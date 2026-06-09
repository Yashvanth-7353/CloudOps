import { useState, useCallback } from 'react';
import { Folder, File, CheckCircle2, Plus, Trash2, Loader2, Globe } from 'lucide-react';
import {
  deploymentService,
  type FileNode,
  type FrameworkDetection,
  type SuggestedRoot,
} from '@/services/deployment-service';
import type { Socket } from 'socket.io-client';

type StaticStep = 's3-folder' | 's3-framework' | 's3-env';

type EnvVar = { id: number; key: string; value: string };

type Props = {
  clonePath: string;
  fileTree: FileNode[];
  suggestedRoots: SuggestedRoot[];
  repo: string;
  step: StaticStep;
  setStep: (step: StaticStep) => void;
  onDeploying: () => void;
  onComplete: (publicUrl: string) => void;
  addLog: (text: string, type?: string) => void;
  socketRef: React.RefObject<Socket | null>;
};

export default function StaticDeployPanel({
  clonePath,
  fileTree,
  suggestedRoots,
  repo,
  step,
  setStep,
  onDeploying,
  onComplete,
  addLog,
  socketRef,
}: Props) {
  const [rootDirectory, setRootDirectory] = useState('./');
  const [detection, setDetection] = useState<FrameworkDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [outputDirectory, setOutputDirectory] = useState('dist');
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ id: 1, key: 'NODE_ENV', value: 'production' }]);

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

  const runDetection = useCallback(async (root: string) => {
    if (!clonePath) return;
    setRootDirectory(root);
    setIsDetecting(true);
    addLog(`Detecting framework in ${root === './' ? 'root' : root}...`, 'system');
    try {
      const result = await deploymentService.detectFramework(clonePath, root);
      applyDetection(result);
      addLog(`Detected ${result.displayName} — static deploy ready.`, 'success');
      setStep('s3-framework');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Framework detection failed';
      addLog(message, 'error');
    } finally {
      setIsDetecting(false);
    }
  }, [clonePath, addLog, applyDetection, setStep]);

  const addEnvVar = () => setEnvVars((c) => [...c, { id: Date.now(), key: '', value: '' }]);
  const updateEnvVar = (id: number, field: 'key' | 'value', val: string) =>
    setEnvVars((c) => c.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  const removeEnvVar = (id: number) => setEnvVars((c) => c.filter((v) => v.id !== id));

  const handleDeploy = async () => {
    if (!repo || !clonePath) return;

    const environmentVariables = envVars
      .filter((v) => v.key.trim())
      .reduce<Record<string, string>>((acc, v) => {
        acc[v.key.trim()] = v.value;
        return acc;
      }, {});

    onDeploying();
    addLog('Starting S3 static deployment...', 'system');

    if (socketRef.current) {
      socketRef.current.emit('join-deployment', repo);
    }

    const onBuildComplete = (data: { status: string; publicUrl?: string; error?: string }) => {
      if (data.status === 'success' && data.publicUrl) {
        addLog(`Live URL: ${data.publicUrl}`, 'success');
        onComplete(data.publicUrl);
      } else {
        addLog(data.error || 'Deployment failed.', 'error');
        setStep('s3-env');
      }
      socketRef.current?.off('build-complete', onBuildComplete);
    };

    socketRef.current?.on('build-complete', onBuildComplete);

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
        deployType: 'static',
      });

      await deploymentService.startStaticBuild({
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
      setStep('s3-env');
      socketRef.current?.off('build-complete', onBuildComplete);
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0, parentPath = '') => {
    return nodes.map((node, i) => {
      const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
      const isSelected = rootDirectory === nodePath;
      const isDir = node.type === 'directory';

      return (
        <div key={`${nodePath}-${i}`}>
          <button
            type="button"
            onClick={() => isDir && runDetection(nodePath)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
              isDir ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-60'
            } ${isSelected && isDir ? 'bg-white/10 text-white' : 'text-white/60'}`}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            disabled={!isDir || isDetecting}
          >
            {isDir ? (
              <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-cyan-500/60'}`} />
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

  if (step === 's3-folder') {
    return (
      <>
        <h3 className="text-sm font-bold mb-3 text-emerald-300 flex items-center gap-2">
          <Globe className="w-4 h-4" /> S3 Static — Root Directory
        </h3>
        <p className="text-xs text-white/50 mb-3">Select the folder containing your frontend app (package.json or index.html).</p>
        {suggestedRoots.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedRoots.map((root) => (
              <button
                key={root.path}
                type="button"
                onClick={() => runDetection(root.path)}
                disabled={isDetecting}
                className={`rounded-lg px-3 py-1.5 text-xs border transition ${
                  rootDirectory === root.path
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                {root.label}
              </button>
            ))}
          </div>
        )}
        <div className="max-h-32 overflow-y-auto mb-3 rounded-lg border border-white/10 p-2">
          <button
            type="button"
            onClick={() => runDetection('./')}
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
            <p className="px-2 py-2 text-xs italic text-white/30">Loading file tree...</p>
          )}
        </div>
        {isDetecting && (
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Detecting framework...
          </div>
        )}
      </>
    );
  }

  if (step === 's3-framework') {
    return (
      <>
        <h3 className="text-sm font-bold mb-3 text-emerald-300">Framework Preset</h3>
        {detection && (
          <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-sm font-medium text-emerald-200">{detection.displayName}</p>
            <p className="text-xs text-white/50 mt-1">Root: {rootDirectory}</p>
          </div>
        )}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Build Command</label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono focus:border-emerald-500/50 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Output Directory</label>
            <input
              type="text"
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono focus:border-emerald-500/50 outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => setStep('s3-env')}
          className="w-full bg-emerald-500/20 text-emerald-300 py-2 rounded-lg font-medium hover:bg-emerald-500/30 text-sm"
        >
          Next: Environment Variables
        </button>
      </>
    );
  }

  if (step === 's3-env') {
    return (
      <>
        <h3 className="text-sm font-bold mb-3 text-emerald-300">Build Environment Variables</h3>
        <p className="text-xs text-white/50 mb-3">
          VITE_*, NEXT_PUBLIC_*, and REACT_APP_* vars are embedded at build time.
        </p>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {envVars.map((v) => (
            <div key={v.id} className="flex gap-2">
              <input
                type="text"
                value={v.key}
                onChange={(e) => updateEnvVar(v.id, 'key', e.target.value)}
                placeholder="KEY"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono focus:border-emerald-500/50 outline-none"
              />
              <input
                type="text"
                value={v.value}
                onChange={(e) => updateEnvVar(v.id, 'value', e.target.value)}
                placeholder="value"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono focus:border-emerald-500/50 outline-none"
              />
              <button
                type="button"
                onClick={() => removeEnvVar(v.id)}
                className="p-2 text-white/40 hover:text-red-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addEnvVar}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white mb-4 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add variable
        </button>
        <button
          onClick={handleDeploy}
          className="w-full bg-emerald-500/20 text-emerald-300 py-2 rounded-lg font-medium hover:bg-emerald-500/30 text-sm"
        >
          Deploy to S3
        </button>
      </>
    );
  }

  return null;
}
