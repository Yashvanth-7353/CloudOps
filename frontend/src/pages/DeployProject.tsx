import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Folder,
  File,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Github,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  deploymentService,
  type FileNode,
  type FrameworkDetection,
  type SuggestedRoot,
} from '../services/deployment-service';
import { io, Socket } from 'socket.io-client';

type WizardStep = 'cloning' | 'folder' | 'framework' | 'env' | 'deploying' | 'complete';

type EnvVar = { id: number; key: string; value: string };

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'cloning', label: 'Import' },
  { key: 'folder', label: 'Root Directory' },
  { key: 'framework', label: 'Framework' },
  { key: 'env', label: 'Environment' },
  { key: 'deploying', label: 'Deploy' },
];

const DEPLOYED_PROJECTS_KEY = 'cloudops_deployed_projects';

function stepIndex(step: WizardStep) {
  if (step === 'complete') return 4;
  return STEPS.findIndex((s) => s.key === step);
}

export default function DeployProject() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>('cloning');
  const [clonePath, setClonePath] = useState('');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [suggestedRoots, setSuggestedRoots] = useState<SuggestedRoot[]>([]);
  const [rootDirectory, setRootDirectory] = useState('./');
  const [detection, setDetection] = useState<FrameworkDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [buildCommand, setBuildCommand] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('dist');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [publicUrl, setPublicUrl] = useState('');
  const [logs, setLogs] = useState<{ id: number; text: string; type: string; time: string }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const addLog = useCallback((text: string, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type, time }]);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const applyDetection = useCallback((result: FrameworkDetection) => {
    setDetection(result);
    setBuildCommand(result.buildCommand || 'npm run build');
    setOutputDirectory(result.outputDirectory || 'dist');

    const suggested = result.suggestedEnvVars || [];
    if (suggested.length > 0) {
      setEnvVars(suggested.map((v, i) => ({ id: i + 1, key: v.key, value: v.value })));
    } else {
      setEnvVars([{ id: 1, key: 'NODE_ENV', value: 'production' }]);
    }
  }, []);

  const runDetectionOnClone = useCallback(async (path: string, root: string) => {
    setIsDetecting(true);
    addLog(`Detecting framework in ${root === './' ? 'root' : root}...`, 'system');
    try {
      const result = await deploymentService.detectFramework(path, root);
      applyDetection(result);
      addLog(`Detected ${result.displayName} — static deploy ready.`, 'success');
      setStep('framework');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Framework detection failed';
      addLog(message, 'error');
    } finally {
      setIsDetecting(false);
    }
  }, [addLog, applyDetection]);

  // Clone on mount
  useEffect(() => {
    if (!owner || !repo) return;

    const startClone = async () => {
      addLog(`Importing ${owner}/${repo} from GitHub...`, 'system');
      try {
        const result = await deploymentService.initDeploy(repo, owner);
        setClonePath(result.clonePath);
        setFileTree(result.fileTree || []);
        setSuggestedRoots(result.suggestedRoots || []);
        addLog('Repository imported successfully.', 'success');
        setStep('folder');

        const hasRootPackage = (result.fileTree || []).some(
          (n) => n.name === 'package.json' && n.type === 'file'
        );
        if (hasRootPackage) {
          setRootDirectory('./');
          await runDetectionOnClone(result.clonePath, './');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to import repository';
        addLog(message, 'error');
      }
    };
    startClone();
  }, [owner, repo, addLog, runDetectionOnClone]);

  const runDetection = async (root: string) => {
    if (!clonePath) return;
    setRootDirectory(root);
    await runDetectionOnClone(clonePath, root);
  };

  const handleSelectFolder = (path: string) => {
    runDetection(path);
  };

  const handleConfirmFramework = () => {
    setStep('env');
  };

  const addEnvVar = () => setEnvVars((c) => [...c, { id: Date.now(), key: '', value: '' }]);
  const updateEnvVar = (id: number, field: 'key' | 'value', val: string) =>
    setEnvVars((c) => c.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  const removeEnvVar = (id: number) => setEnvVars((c) => c.filter((v) => v.id !== id));

  const saveDeployedProject = (url: string) => {
    try {
      const raw = localStorage.getItem(DEPLOYED_PROJECTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const project = {
        id: `${owner}/${repo}`,
        name: repo,
        fullName: `${owner}/${repo}`,
        language: detection?.displayName || 'Frontend',
        deployedAt: new Date().toISOString(),
        liveUrl: url,
      };
      const updated = [project, ...existing.filter((p: { id: string }) => p.id !== project.id)];
      localStorage.setItem(DEPLOYED_PROJECTS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('cloudops:deployed-projects-updated'));
    } catch {
      // ignore
    }
  };

  const handleDeploy = async () => {
    if (!repo || !clonePath) return;

    const environmentVariables = envVars
      .filter((v) => v.key.trim())
      .reduce<Record<string, string>>((acc, v) => {
        acc[v.key.trim()] = v.value;
        return acc;
      }, {});

    setStep('deploying');
    addLog('Starting deployment...', 'system');

    const socketUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;
    socket.emit('join-deployment', repo);

    socket.on('build-log', (data: { text: string; type: string }) => {
      addLog(data.text, data.type);
    });

    socket.on('build-complete', (data: { status: string; publicUrl?: string }) => {
      if (data.status === 'success' && data.publicUrl) {
        setPublicUrl(data.publicUrl);
        saveDeployedProject(data.publicUrl);
        setStep('complete');
      } else {
        addLog('Deployment failed.', 'error');
        setStep('env');
      }
      socket.disconnect();
    });

    try {
      const envContent = envVars
        .filter((v) => v.key.trim())
        .map((v) => `${v.key.trim()}=${v.value}`)
        .join('\n');

      await deploymentService.saveFiles({
        clonePath,
        envPath: '.env',
        envContent,
        rootDirectory,
      });

      await deploymentService.startBuild({
        repositoryName: repo,
        clonePath,
        rootDirectory,
        buildCommand,
        outputDirectory,
        environmentVariables,
        deployType: 'static',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deployment failed';
      addLog(message, 'error');
      setStep('env');
      socket.disconnect();
    }
  };

  useEffect(() => () => { socketRef.current?.disconnect(); }, []);

  const renderTree = (nodes: FileNode[], depth = 0, parentPath = '') => {
    return nodes.map((node, i) => {
      const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
      const isSelected = rootDirectory === nodePath || (rootDirectory === './' && !parentPath && node.name === '.');
      const isDir = node.type === 'directory';

      return (
        <div key={`${nodePath}-${i}`}>
          <button
            type="button"
            onClick={() => isDir && handleSelectFolder(nodePath)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
              isDir ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-60'
            } ${isSelected && isDir ? 'bg-white/10 text-white' : 'text-white/60'}`}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            disabled={!isDir || isDetecting}
          >
            {isDir ? (
              <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-white/40'}`} />
            ) : (
              <File className="h-3.5 w-3.5 shrink-0 text-white/30" />
            )}
            <span className="truncate">{node.name}</span>
            {isSelected && isDir && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
          </button>
          {node.children && node.children.length > 0 && renderTree(node.children, depth + 1, nodePath)}
        </div>
      );
    });
  };

  const currentStepIdx = stepIndex(step);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top bar — Vercel-style */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Github className="h-4 w-4" />
            <span className="font-medium text-white">{owner}</span>
            <span className="text-white/30">/</span>
            <span>{repo}</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition ${
                  i < currentStepIdx
                    ? 'text-white/50'
                    : i === currentStepIdx
                      ? 'bg-white text-black'
                      : 'text-white/30'
                }`}
              >
                {i < currentStepIdx ? <CheckCircle2 className="h-3 w-3" /> : null}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-white/20" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main config panel */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {step === 'cloning' && 'Importing Repository'}
                {step === 'folder' && 'Configure Project'}
                {step === 'framework' && 'Framework Preset'}
                {step === 'env' && 'Environment Variables'}
                {step === 'deploying' && 'Building & Deploying'}
                {step === 'complete' && 'Deployment Ready'}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {step === 'cloning' && 'Cloning your repository from GitHub...'}
                {step === 'folder' && 'Select the folder containing your frontend app.'}
                {step === 'framework' && 'We detected your framework. Review the build settings.'}
                {step === 'env' && 'Add environment variables for your build. Public vars (VITE_, NEXT_PUBLIC_) are embedded at build time.'}
                {step === 'deploying' && 'Building your project and publishing static files — no Docker required.'}
                {step === 'complete' && 'Your site is live and ready to share.'}
              </p>
            </div>

            {/* Cloning state */}
            {step === 'cloning' && (
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <Loader2 className="h-5 w-5 animate-spin text-white/60" />
                <span className="text-sm text-white/60">Importing from GitHub...</span>
              </div>
            )}

            {/* Folder selection */}
            {(step === 'folder' || step === 'framework' || step === 'env' || step === 'deploying' || step === 'complete') && (
              <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">Root Directory</label>
                  <p className="mt-0.5 text-sm text-white/70">
                    The directory containing your <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">package.json</code> or entry point.
                  </p>
                </div>

                {/* Quick suggestions */}
                {suggestedRoots.length > 1 && step === 'folder' && (
                  <div className="border-b border-white/[0.06] px-5 py-3">
                    <p className="mb-2 text-xs text-white/40">Suggested directories</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedRoots.map((s) => (
                        <button
                          key={s.path}
                          type="button"
                          onClick={() => handleSelectFolder(s.path === './' ? './' : s.path)}
                          disabled={isDetecting}
                          className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                            rootDirectory === s.path
                              ? 'border-white bg-white text-black'
                              : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleSelectFolder('./')}
                        disabled={isDetecting}
                        className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                          rootDirectory === './'
                            ? 'border-white bg-white text-black'
                            : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        Root (./)
                      </button>
                    </div>
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto p-3">
                  <button
                    type="button"
                    onClick={() => handleSelectFolder('./')}
                    disabled={isDetecting}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                      rootDirectory === './' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5" />
                    <span>./ (repository root)</span>
                    {rootDirectory === './' && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                  {fileTree.length > 0 ? renderTree(fileTree) : (
                    <p className="px-2 py-4 text-xs italic text-white/30">Loading file tree...</p>
                  )}
                </div>

                {isDetecting && (
                  <div className="flex items-center gap-2 border-t border-white/[0.06] px-5 py-3 text-xs text-white/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Detecting framework...
                  </div>
                )}
              </section>
            )}

            {/* Framework settings */}
            {(step === 'framework' || step === 'env' || step === 'deploying' || step === 'complete') && detection && (
              <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/40">Framework Preset</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-white/50" />
                      <span className="text-sm font-medium">{detection.displayName}</span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        Static Deploy
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-white/40">Build Command</label>
                    <input
                      value={buildCommand}
                      onChange={(e) => setBuildCommand(e.target.value)}
                      disabled={step !== 'framework' && step !== 'env'}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40">Output Directory</label>
                    <input
                      value={outputDirectory}
                      onChange={(e) => setOutputDirectory(e.target.value)}
                      disabled={step !== 'framework' && step !== 'env'}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60"
                    />
                  </div>
                </div>

                {step === 'framework' && (
                  <div className="border-t border-white/[0.06] px-5 py-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleConfirmFramework}
                      className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Environment variables */}
            {(step === 'env' || step === 'deploying' || step === 'complete') && (
              <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">Environment Variables</label>
                  <p className="mt-0.5 text-sm text-white/50">Available at build time. Prefix with VITE_ or NEXT_PUBLIC_ for client-side access.</p>
                </div>

                <div className="space-y-2 p-5">
                  {envVars.map((v) => (
                    <div key={v.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={v.key}
                        onChange={(e) => updateEnvVar(v.id, 'key', e.target.value)}
                        placeholder="KEY"
                        disabled={step !== 'env'}
                        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/30 disabled:opacity-60"
                      />
                      <input
                        value={v.value}
                        onChange={(e) => updateEnvVar(v.id, 'value', e.target.value)}
                        placeholder="VALUE"
                        disabled={step !== 'env'}
                        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => removeEnvVar(v.id)}
                        disabled={step !== 'env'}
                        className="flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-white/50 transition hover:bg-white/5 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {step === 'env' && (
                  <div className="border-t border-white/[0.06] px-5 py-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={addEnvVar}
                      className="flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add variable
                    </button>
                    <button
                      type="button"
                      onClick={handleDeploy}
                      className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                      Deploy
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Complete state */}
            {step === 'complete' && publicUrl && (
              <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-500/15 p-3">
                    <Globe className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-100">Your project is live</h3>
                    <p className="mt-1 text-sm text-white/50">Static files are being served directly — no containers needed.</p>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
                    >
                      {publicUrl}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate('/live-projects')}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    View Live Projects
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Build logs sidebar */}
          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="border-b border-white/[0.06] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">Build Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
              {logs.map((log) => (
                <div key={log.id} className="mb-0.5 flex gap-3">
                  <span className="shrink-0 text-white/20">{log.time}</span>
                  <span
                    className={
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'system'
                            ? 'text-white/50'
                            : 'text-white/70'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
              {step === 'deploying' && (
                <div className="mt-2 flex items-center gap-2 text-white/30">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Building...</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
