import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Folder, File, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { deploymentService } from '../services/deployment-service';
import { io, Socket } from 'socket.io-client';

// Type for the file tree
type FileNode = { name: string; type: 'file' | 'directory'; children?: FileNode[] };

export default function DeployProject() {
  const { owner, repo } = useParams<{ owner: string, repo: string }>();
  const navigate = useNavigate();

  // Process States
  const [step, setStep] = useState<'cloning' | 'env' | 'dockerfile' | 'deploying' | 'complete'>('cloning');
  const [clonePath, setClonePath] = useState('');
  const [hasDockerfile, setHasDockerfile] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  // Form States
  const [envPath, setEnvPath] = useState('.env');
  const [envContent, setEnvContent] = useState('');
  const [dockerfileContent, setDockerfileContent] = useState('');

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
        setFileTree(result.fileTree || []); // Save the tree!
        
        addLog(`Repository cloned successfully.`, 'success');
        setStep('env');
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

    newSocket.on('build-log', (data) => {
      addLog(data.text, data.type);
    });

    newSocket.on('build-complete', () => {
      setStep('complete');
      newSocket.disconnect();
    });

    return () => { newSocket.disconnect(); };
  }, [step, repo]);

  const handleStartBuild = async () => {
    setStep('deploying');
    addLog(`Saving configuration files...`, 'system');
    
    try {
      await deploymentService.saveFiles({
        clonePath, envPath, envContent, dockerfileContent: !hasDockerfile ? dockerfileContent : undefined
      });
      addLog(`Configuration saved. Starting build engine...`, 'success');
      
      // Trigger the backend build process which fires socket events
      await deploymentService.startBuild(repo!, owner!);

    } catch (err: any) {
      addLog(`Error: ${err.message}`, 'error');
      setStep('env');
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
          {(step === 'env' || step === 'dockerfile') && (
            <div className="bg-[rgba(12,16,26,0.6)] border border-white/10 rounded-xl p-5 backdrop-blur-md shrink-0">
              {step === 'env' ? (
                <>
                  <h3 className="text-sm font-bold mb-3">1. Environment Secrets</h3>
                  <input type="text" value={envPath} onChange={(e) => setEnvPath(e.target.value)} placeholder=".env path" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs mb-3 focus:border-cyan-500/50 outline-none" />
                  <textarea value={envContent} onChange={(e) => setEnvContent(e.target.value)} placeholder="API_KEY=123..." className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono mb-4 focus:border-cyan-500/50 outline-none" />
                  <button onClick={() => hasDockerfile ? handleStartBuild() : setStep('dockerfile')} className="w-full bg-cyan-500/20 text-cyan-300 py-2 rounded-lg font-medium hover:bg-cyan-500/30 text-sm">
                    {hasDockerfile ? 'Deploy Application' : 'Next Step'}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold mb-3 text-yellow-400">2. Missing Dockerfile</h3>
                  <textarea value={dockerfileContent} onChange={(e) => setDockerfileContent(e.target.value)} placeholder="FROM node:18..." className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono mb-4 focus:border-yellow-500/50 outline-none" />
                  <button onClick={handleStartBuild} disabled={!dockerfileContent} className="w-full bg-cyan-500/20 text-cyan-300 py-2 rounded-lg font-medium hover:bg-cyan-500/30 text-sm disabled:opacity-50">
                    Deploy Application
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - TERMINAL LOGS */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
          {/* Progress Tracker Header */}
          <div className="bg-[#111] px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 text-sm ${step !== 'cloning' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {step === 'cloning' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Clone
              </div>
              <div className="w-8 h-[1px] bg-white/20" />
              <div className={`flex items-center gap-2 text-sm ${step === 'cloning' ? 'text-white/30' : step === 'deploying' || step === 'complete' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {step === 'cloning' ? <div className="w-4 h-4 rounded-full border border-white/30" /> : step === 'deploying' || step === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />} Configure
              </div>
              <div className="w-8 h-[1px] bg-white/20" />
              <div className={`flex items-center gap-2 text-sm ${step === 'cloning' || step === 'env' || step === 'dockerfile' ? 'text-white/30' : step === 'complete' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {step === 'cloning' || step === 'env' || step === 'dockerfile' ? <div className="w-4 h-4 rounded-full border border-white/30" /> : step === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />} Build & Deploy
              </div>
            </div>
            {step === 'complete' && (
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE</span>
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