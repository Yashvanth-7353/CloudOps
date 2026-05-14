import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Folder, File, ArrowLeft, CheckCircle2, Cloud, Server } from 'lucide-react';
import { deploymentService } from '../services/deployment-service';
import { io } from 'socket.io-client';

// Type for the file tree
type FileNode = { name: string; type: 'file' | 'directory'; children?: FileNode[] };

export default function DeployProject() {
  const { owner, repo } = useParams<{ owner: string, repo: string }>();
  const navigate = useNavigate();

  // Process States
  const [step, setStep] = useState<'cloning' | 'type' | 'env' | 'dockerfile' | 'aws' | 'deploying' | 'complete'>('cloning');
  const [clonePath, setClonePath] = useState('');
  const [hasDockerfile, setHasDockerfile] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [projectId, setProjectId] = useState('');
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [activeDeploymentId, setActiveDeploymentId] = useState('');

  // Deployment Type
  const [deploymentType, setDeploymentType] = useState<'local' | 'aws'>('local');

  // Form States - Local
  const [envPath, setEnvPath] = useState('.env');
  const [envContent, setEnvContent] = useState('');
  const [dockerfileContent, setDockerfileContent] = useState('');

  // Form States - AWS
  const [awsInstanceType, setAwsInstanceType] = useState('t3.micro');
  const [awsEnvironmentVars, setAwsEnvironmentVars] = useState('');

  // Socket & Logs
  const [logs, setLogs] = useState<{ id: number, text: string, type: string, time: string }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type, time }]);
  };

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // 1. Initial Clone & Fetch Tree
  useEffect(() => {
    if (!owner || !repo) return;
    
    const startClone = async () => {
      addLog(`Initializing workspace for ${owner}/${repo}...`, 'system');
      try {
        const result = await deploymentService.initDeploy(repo, owner);
        setClonePath(result.clonePath);
        setHasDockerfile(result.hasDockerfile);
        setFileTree(result.fileTree || []);
        setProjectId(result.projectId);
        setRepositoryOwner(result.repositoryOwner);
        setRepositoryUrl(result.repositoryUrl || `https://github.com/${owner}/${repo}.git`);
        
        addLog(`Repository cloned successfully.`, 'success');
        setStep('type'); // Move to deployment type selection
      } catch (err: any) {
        addLog(`Failed to clone: ${err.message}`, 'error');
      }
    };
    startClone();
  }, [owner, repo]);

  // 2. Setup Socket Connection for Live Logs
  useEffect(() => {
    if (step !== 'deploying' || !repo) return;

    // Connect to backend WebSocket (adjust URL if needed)
    const socketUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.emit('join-deployment', repo);

    // Listen for deployment logs (works for both local and AWS deployments)
    newSocket.on('deployment-log', (data) => {
      addLog(data.message, data.level);
    });

    // Also listen for legacy build-log events
    newSocket.on('build-log', (data) => {
      addLog(data.text, data.type);
    });

    newSocket.on('build-complete', () => {
      setStep('complete');
      newSocket.disconnect();
    });

    // Listen for deployment-complete event (new event from backend)
    newSocket.on('deployment-complete', (data) => {
      addLog(`✅ Deployment completed successfully!`, 'success');
      if (data?.liveUrl) {
        addLog(`🔗 Live URL: ${data.liveUrl}`, 'success');
      }
      setStep('complete');

      const deploymentIdToOpen = data?.deploymentId || activeDeploymentId;
      if (deploymentIdToOpen) {
        navigate(`/deployment-logs?deploymentId=${encodeURIComponent(deploymentIdToOpen)}`);
      }

      newSocket.disconnect();
    });

    return () => { newSocket.disconnect(); };
  }, [step, repo, activeDeploymentId, navigate]);

  const handleStartBuild = async () => {
    setStep('deploying');
    addLog(`🚀 Starting ${deploymentType === 'aws' ? 'AWS EC2' : 'local'} deployment...`, 'system');
    
    try {
      if (deploymentType === 'aws') {
        // AWS Deployment
        const envVars: Record<string, string> = {};
        if (awsEnvironmentVars) {
          awsEnvironmentVars.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) envVars[key.trim()] = value.trim();
          });
        }

        addLog(`☁️  Pushing image to AWS ECR...`, 'info');
        const result = await deploymentService.startAWSDeployment({
          repositoryUrl,
          repositoryName: repo!,
          repositoryOwner: owner || repositoryOwner,
          branch: 'main',
          instanceType: awsInstanceType,
          environmentVariables: envVars,
        });

        addLog(`✅ AWS deployment initiated!`, 'success');
        addLog(`🆔 Deployment ID: ${result.deploymentId}`, 'info');
        setActiveDeploymentId(result.deploymentId);
        if (result.instanceId) addLog(`📍 Instance ID: ${result.instanceId}`, 'info');
        if (result.liveUrl) addLog(`🔗 Live URL: ${result.liveUrl}`, 'success');
        if (result.ecrUri) addLog(`🐳 ECR URI: ${result.ecrUri}`, 'info');
        // Don't set step to complete here - wait for Socket.io 'deployment-complete' event
        // which confirms the actual deployment succeeded
      } else {
        // Local Deployment
        await deploymentService.saveFiles({
          clonePath,
          envPath,
          envContent,
          dockerfileContent: !hasDockerfile ? dockerfileContent : undefined
        });
        addLog(`Configuration saved. Starting build engine...`, 'success');
        
        await deploymentService.startBuild({
          projectId,
          repositoryName: repo!,
          repositoryOwner
        });
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`, 'error');
      setStep(deploymentType === 'aws' ? 'aws' : 'env');
    }
  };

  // Helper to render the File Tree recursively
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node, i) => (
      <div key={i} style={{ paddingLeft: `${depth * 12}px` }} className="flex items-center gap-2 py-1 text-xs text-white/70 hover:text-cyan-300">
        {node.type === 'directory' ? <Folder className="w-3.5 h-3.5 text-cyan-500" /> : <File className="w-3.5 h-3.5 text-white/40" />}
        <span>{node.name}</span>
        {node.children && <div className="w-full mt-1">{renderTree(node.children, depth + 1)}</div>}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pt-24">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 h-[80vh]">
        
        {/* LEFT COLUMN - WORKSPACE & CONFIG */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 h-full">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Exit Setup
          </button>
          
          {/* File Explorer */}
          <div className="bg-[rgba(12,16,26,0.6)] border border-white/10 rounded-xl p-4 backdrop-blur-md flex-1 flex flex-col overflow-hidden">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4" /> Workspace Explorer
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {fileTree.length > 0 ? renderTree(fileTree) : (
                <div className="text-white/30 text-xs italic">Awaiting clone...</div>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          {(step === 'type' || step === 'env' || step === 'dockerfile' || step === 'aws') && (
            <div className="bg-[rgba(12,16,26,0.6)] border border-white/10 rounded-xl p-5 backdrop-blur-md shrink-0 max-h-[50vh] overflow-y-auto">
              {/* Deployment Type Selection */}
              {step === 'type' && (
                <>
                  <h3 className="text-sm font-bold mb-4">1. Select Deployment Type</h3>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => { setDeploymentType('local'); setStep('env'); }}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition ${
                        deploymentType === 'local'
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                          : 'bg-black/40 text-white/60 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Server className="w-4 h-4" /> Local
                    </button>
                    <button
                      onClick={() => { setDeploymentType('aws'); setStep('aws'); }}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition ${
                        deploymentType === 'aws'
                          ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                          : 'bg-black/40 text-white/60 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Cloud className="w-4 h-4" /> AWS EC2
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mb-4">
                    <strong>Local:</strong> Runs on this server (localhost:4002+)<br/>
                    <strong>AWS:</strong> Runs on EC2 with public IP
                  </p>
                </>
              )}

              {/* Local Deployment - Environment & Dockerfile */}
              {(step === 'env' || step === 'dockerfile') && deploymentType === 'local' && (
                <>
                  {step === 'env' ? (
                    <>
                      <h3 className="text-sm font-bold mb-3">2. Environment Secrets</h3>
                      <input type="text" value={envPath} onChange={(e) => setEnvPath(e.target.value)} placeholder=".env path" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs mb-3 focus:border-cyan-500/50 outline-none" />
                      <textarea value={envContent} onChange={(e) => setEnvContent(e.target.value)} placeholder="API_KEY=123..." className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono mb-4 focus:border-cyan-500/50 outline-none" />
                      <button onClick={() => hasDockerfile ? handleStartBuild() : setStep('dockerfile')} className="w-full bg-cyan-500/20 text-cyan-300 py-2 rounded-lg font-medium hover:bg-cyan-500/30 text-sm">
                        {hasDockerfile ? '▶️ Deploy to Local' : 'Next Step'}
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold mb-3 text-yellow-400">2. Missing Dockerfile</h3>
                      <textarea value={dockerfileContent} onChange={(e) => setDockerfileContent(e.target.value)} placeholder="FROM node:18..." className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono mb-4 focus:border-yellow-500/50 outline-none" />
                      <button onClick={handleStartBuild} disabled={!dockerfileContent} className="w-full bg-cyan-500/20 text-cyan-300 py-2 rounded-lg font-medium hover:bg-cyan-500/30 text-sm disabled:opacity-50">
                        ▶️ Deploy to Local
                      </button>
                    </>
                  )}
                </>
              )}

              {/* AWS Deployment Configuration */}
              {step === 'aws' && deploymentType === 'aws' && (
                <>
                  <h3 className="text-sm font-bold mb-4 text-orange-300">⚡ Automated AWS EC2 Deployment</h3>
                  <p className="text-xs text-white/50 mb-4">EC2 Key Pair and Security Group will be automatically created for you.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">Instance Type</label>
                      <select
                        value={awsInstanceType}
                        onChange={(e) => setAwsInstanceType(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:border-orange-500/50 outline-none"
                      >
                        <option value="t3.micro">t3.micro (free tier, recommended)</option>
                        <option value="t3.small">t3.small</option>
                        <option value="t3.medium">t3.medium</option>
                        <option value="t3.large">t3.large</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/60 mb-1 block">Environment Variables (optional)</label>
                      <textarea
                        value={awsEnvironmentVars}
                        onChange={(e) => setAwsEnvironmentVars(e.target.value)}
                        placeholder="NODE_ENV=production&#10;API_KEY=xxx"
                        className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono focus:border-orange-500/50 outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartBuild}
                      className="w-full bg-orange-500/20 text-orange-300 py-2 rounded-lg font-medium hover:bg-orange-500/30 text-sm"
                    >
                      🚀 Deploy to AWS EC2
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - TERMINAL LOGS */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
          {/* Progress Tracker Header */}
          <div className="bg-[#111] px-6 py-4 border-b border-white/10 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-xs whitespace-nowrap ${step !== 'cloning' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {step === 'cloning' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Clone
              </div>
              <div className="w-4 h-[1px] bg-white/20" />
              <div className={`flex items-center gap-2 text-xs whitespace-nowrap ${step === 'cloning' ? 'text-white/30' : ['type', 'env', 'dockerfile', 'aws', 'deploying', 'complete'].includes(step) ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {step === 'cloning' ? <div className="w-4 h-4 rounded-full border border-white/30" /> : ['type', 'env', 'dockerfile', 'aws', 'deploying', 'complete'].includes(step) ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />} Config
              </div>
              <div className="w-4 h-[1px] bg-white/20" />
              <div className={`flex items-center gap-2 text-xs whitespace-nowrap ${['cloning', 'type', 'env', 'dockerfile', 'aws'].includes(step) ? 'text-white/30' : step === 'complete' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {['cloning', 'type', 'env', 'dockerfile', 'aws'].includes(step) ? <div className="w-4 h-4 rounded-full border border-white/30" /> : step === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />} Deploy
              </div>
            </div>
            {step === 'complete' && (
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse ml-4">LIVE</span>
            )}
          </div>
          
          {/* The Terminal Screen */}
          <div className="p-5 flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed space-y-1 bg-[#050505]">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <span className="text-white/20 shrink-0 select-none">[{log.time}]</span>
                <span className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                  ${log.type === 'system' ? 'text-cyan-400' : ''}
                  ${log.type === 'info' ? 'text-white/70' : ''}
                `}>
                  {log.text}
                </span>
              </div>
            ))}
            {step === 'deploying' && (
              <div className="flex gap-4 text-cyan-400/50 animate-pulse mt-2">
                <span className="text-transparent">[{logs[logs.length-1]?.time}]</span>
                <span>Wait...</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}