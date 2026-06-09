import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Folder, File, ArrowLeft, CheckCircle2, ChevronRight, Plus, Trash2, Github, Globe, ExternalLink, Sparkles, } from 'lucide-react';
import { deploymentService, } from '../services/deployment-service';
import { io } from 'socket.io-client';
const STEPS = [
    { key: 'cloning', label: 'Import' },
    { key: 'folder', label: 'Root Directory' },
    { key: 'framework', label: 'Framework' },
    { key: 'env', label: 'Environment' },
    { key: 'deploying', label: 'Deploy' },
];
const DEPLOYED_PROJECTS_KEY = 'cloudops_deployed_projects';
function stepIndex(step) {
    if (step === 'complete')
        return 4;
    return STEPS.findIndex((s) => s.key === step);
}
export default function DeployProject() {
    const { owner, repo } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('cloning');
    const [clonePath, setClonePath] = useState('');
    const [fileTree, setFileTree] = useState([]);
    const [suggestedRoots, setSuggestedRoots] = useState([]);
    const [rootDirectory, setRootDirectory] = useState('./');
    const [detection, setDetection] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [buildCommand, setBuildCommand] = useState('');
    const [outputDirectory, setOutputDirectory] = useState('dist');
    const [envVars, setEnvVars] = useState([]);
    const [publicUrl, setPublicUrl] = useState('');
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);
    const socketRef = useRef(null);
    const addLog = useCallback((text, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour12: false });
        setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type, time }]);
    }, []);
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);
    const applyDetection = useCallback((result) => {
        setDetection(result);
        setBuildCommand(result.buildCommand || 'npm run build');
        setOutputDirectory(result.outputDirectory || 'dist');
        const suggested = result.suggestedEnvVars || [];
        if (suggested.length > 0) {
            setEnvVars(suggested.map((v, i) => ({ id: i + 1, key: v.key, value: v.value })));
        }
        else {
            setEnvVars([{ id: 1, key: 'NODE_ENV', value: 'production' }]);
        }
    }, []);
    const runDetectionOnClone = useCallback(async (path, root) => {
        setIsDetecting(true);
        addLog(`Detecting framework in ${root === './' ? 'root' : root}...`, 'system');
        try {
            const result = await deploymentService.detectFramework(path, root);
            applyDetection(result);
            addLog(`Detected ${result.displayName} — static deploy ready.`, 'success');
            setStep('framework');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Framework detection failed';
            addLog(message, 'error');
        }
        finally {
            setIsDetecting(false);
        }
    }, [addLog, applyDetection]);
    // Clone on mount
    useEffect(() => {
        if (!owner || !repo)
            return;
        const startClone = async () => {
            addLog(`Importing ${owner}/${repo} from GitHub...`, 'system');
            try {
                const result = await deploymentService.initDeploy(repo, owner);
                setClonePath(result.clonePath);
                setFileTree(result.fileTree || []);
                setSuggestedRoots(result.suggestedRoots || []);
                addLog('Repository imported successfully.', 'success');
                setStep('folder');
                const hasRootPackage = (result.fileTree || []).some((n) => n.name === 'package.json' && n.type === 'file');
                if (hasRootPackage) {
                    setRootDirectory('./');
                    await runDetectionOnClone(result.clonePath, './');
                }
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to import repository';
                addLog(message, 'error');
            }
        };
        startClone();
    }, [owner, repo, addLog, runDetectionOnClone]);
    const runDetection = async (root) => {
        if (!clonePath)
            return;
        setRootDirectory(root);
        await runDetectionOnClone(clonePath, root);
    };
    const handleSelectFolder = (path) => {
        runDetection(path);
    };
    const handleConfirmFramework = () => {
        setStep('env');
    };
    const addEnvVar = () => setEnvVars((c) => [...c, { id: Date.now(), key: '', value: '' }]);
    const updateEnvVar = (id, field, val) => setEnvVars((c) => c.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
    const removeEnvVar = (id) => setEnvVars((c) => c.filter((v) => v.id !== id));
    const saveDeployedProject = (url) => {
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
            const updated = [project, ...existing.filter((p) => p.id !== project.id)];
            localStorage.setItem(DEPLOYED_PROJECTS_KEY, JSON.stringify(updated));
            window.dispatchEvent(new Event('cloudops:deployed-projects-updated'));
        }
        catch {
            // ignore
        }
    };
    const handleDeploy = async () => {
        if (!repo || !clonePath)
            return;
        const environmentVariables = envVars
            .filter((v) => v.key.trim())
            .reduce((acc, v) => {
            acc[v.key.trim()] = v.value;
            return acc;
        }, {});
        setStep('deploying');
        addLog('Starting deployment...', 'system');
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socket = io(socketUrl);
        socketRef.current = socket;
        socket.emit('join-deployment', repo);
        socket.on('build-log', (data) => {
            addLog(data.text, data.type);
        });
        socket.on('build-complete', (data) => {
            if (data.status === 'success' && data.publicUrl) {
                setPublicUrl(data.publicUrl);
                saveDeployedProject(data.publicUrl);
                setStep('complete');
            }
            else {
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
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Deployment failed';
            addLog(message, 'error');
            setStep('env');
            socket.disconnect();
        }
    };
    useEffect(() => () => { socketRef.current?.disconnect(); }, []);
    const renderTree = (nodes, depth = 0, parentPath = '') => {
        return nodes.map((node, i) => {
            const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
            const isSelected = rootDirectory === nodePath || (rootDirectory === './' && !parentPath && node.name === '.');
            const isDir = node.type === 'directory';
            return (_jsxs("div", { children: [_jsxs("button", { type: "button", onClick: () => isDir && handleSelectFolder(nodePath), className: `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${isDir ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-60'} ${isSelected && isDir ? 'bg-white/10 text-white' : 'text-white/60'}`, style: { paddingLeft: `${depth * 14 + 8}px` }, disabled: !isDir || isDetecting, children: [isDir ? (_jsx(Folder, { className: `h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-white/40'}` })) : (_jsx(File, { className: "h-3.5 w-3.5 shrink-0 text-white/30" })), _jsx("span", { className: "truncate", children: node.name }), isSelected && isDir && _jsx(CheckCircle2, { className: "ml-auto h-3.5 w-3.5 text-emerald-400" })] }), node.children && node.children.length > 0 && renderTree(node.children, depth + 1, nodePath)] }, `${nodePath}-${i}`));
        });
    };
    const currentStepIdx = stepIndex(step);
    return (_jsxs("div", { className: "min-h-screen bg-[#000000] text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl", children: _jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between px-6 py-4", children: [_jsxs("button", { onClick: () => navigate('/dashboard'), className: "flex items-center gap-2 text-sm text-white/50 transition hover:text-white", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Dashboard"] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-white/70", children: [_jsx(Github, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium text-white", children: owner }), _jsx("span", { className: "text-white/30", children: "/" }), _jsx("span", { children: repo })] }), _jsx("div", { className: "w-20" })] }) }), _jsxs("main", { className: "mx-auto max-w-5xl px-6 py-10", children: [_jsx("div", { className: "mb-10 flex items-center gap-1", children: STEPS.map((s, i) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("div", { className: `flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition ${i < currentStepIdx
                                        ? 'text-white/50'
                                        : i === currentStepIdx
                                            ? 'bg-white text-black'
                                            : 'text-white/30'}`, children: [i < currentStepIdx ? _jsx(CheckCircle2, { className: "h-3 w-3" }) : null, s.label] }), i < STEPS.length - 1 && _jsx(ChevronRight, { className: "h-3 w-3 text-white/20" })] }, s.key))) }), _jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_380px]", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-semibold tracking-tight", children: [step === 'cloning' && 'Importing Repository', step === 'folder' && 'Configure Project', step === 'framework' && 'Framework Preset', step === 'env' && 'Environment Variables', step === 'deploying' && 'Building & Deploying', step === 'complete' && 'Deployment Ready'] }), _jsxs("p", { className: "mt-1 text-sm text-white/50", children: [step === 'cloning' && 'Cloning your repository from GitHub...', step === 'folder' && 'Select the folder containing your frontend app.', step === 'framework' && 'We detected your framework. Review the build settings.', step === 'env' && 'Add environment variables for your build. Public vars (VITE_, NEXT_PUBLIC_) are embedded at build time.', step === 'deploying' && 'Building your project and publishing static files — no Docker required.', step === 'complete' && 'Your site is live and ready to share.'] })] }), step === 'cloning' && (_jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6", children: [_jsx(Loader2, { className: "h-5 w-5 animate-spin text-white/60" }), _jsx("span", { className: "text-sm text-white/60", children: "Importing from GitHub..." })] })), (step === 'folder' || step === 'framework' || step === 'env' || step === 'deploying' || step === 'complete') && (_jsxs("section", { className: "rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden", children: [_jsxs("div", { className: "border-b border-white/[0.06] px-5 py-4", children: [_jsx("label", { className: "text-xs font-medium uppercase tracking-wider text-white/40", children: "Root Directory" }), _jsxs("p", { className: "mt-0.5 text-sm text-white/70", children: ["The directory containing your ", _jsx("code", { className: "rounded bg-white/10 px-1.5 py-0.5 text-xs", children: "package.json" }), " or entry point."] })] }), suggestedRoots.length > 1 && step === 'folder' && (_jsxs("div", { className: "border-b border-white/[0.06] px-5 py-3", children: [_jsx("p", { className: "mb-2 text-xs text-white/40", children: "Suggested directories" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [suggestedRoots.map((s) => (_jsx("button", { type: "button", onClick: () => handleSelectFolder(s.path === './' ? './' : s.path), disabled: isDetecting, className: `rounded-lg border px-3 py-1.5 text-xs transition ${rootDirectory === s.path
                                                                    ? 'border-white bg-white text-black'
                                                                    : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`, children: s.label }, s.path))), _jsx("button", { type: "button", onClick: () => handleSelectFolder('./'), disabled: isDetecting, className: `rounded-lg border px-3 py-1.5 text-xs transition ${rootDirectory === './'
                                                                    ? 'border-white bg-white text-black'
                                                                    : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`, children: "Root (./)" })] })] })), _jsxs("div", { className: "max-h-48 overflow-y-auto p-3", children: [_jsxs("button", { type: "button", onClick: () => handleSelectFolder('./'), disabled: isDetecting, className: `mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${rootDirectory === './' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`, children: [_jsx(Folder, { className: "h-3.5 w-3.5" }), _jsx("span", { children: "./ (repository root)" }), rootDirectory === './' && _jsx(CheckCircle2, { className: "ml-auto h-3.5 w-3.5 text-emerald-400" })] }), fileTree.length > 0 ? renderTree(fileTree) : (_jsx("p", { className: "px-2 py-4 text-xs italic text-white/30", children: "Loading file tree..." }))] }), isDetecting && (_jsxs("div", { className: "flex items-center gap-2 border-t border-white/[0.06] px-5 py-3 text-xs text-white/50", children: [_jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }), "Detecting framework..."] }))] })), (step === 'framework' || step === 'env' || step === 'deploying' || step === 'complete') && detection && (_jsxs("section", { className: "rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden", children: [_jsx("div", { className: "border-b border-white/[0.06] px-5 py-4 flex items-center justify-between", children: _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium uppercase tracking-wider text-white/40", children: "Framework Preset" }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4 text-white/50" }), _jsx("span", { className: "text-sm font-medium", children: detection.displayName }), _jsx("span", { className: "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300", children: "Static Deploy" })] })] }) }), _jsxs("div", { className: "grid gap-4 p-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-white/40", children: "Build Command" }), _jsx("input", { value: buildCommand, onChange: (e) => setBuildCommand(e.target.value), disabled: step !== 'framework' && step !== 'env', className: "mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-white/40", children: "Output Directory" }), _jsx("input", { value: outputDirectory, onChange: (e) => setOutputDirectory(e.target.value), disabled: step !== 'framework' && step !== 'env', className: "mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60" })] })] }), step === 'framework' && (_jsx("div", { className: "border-t border-white/[0.06] px-5 py-4 flex justify-end", children: _jsx("button", { type: "button", onClick: handleConfirmFramework, className: "rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90", children: "Continue" }) }))] })), (step === 'env' || step === 'deploying' || step === 'complete') && (_jsxs("section", { className: "rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden", children: [_jsxs("div", { className: "border-b border-white/[0.06] px-5 py-4", children: [_jsx("label", { className: "text-xs font-medium uppercase tracking-wider text-white/40", children: "Environment Variables" }), _jsx("p", { className: "mt-0.5 text-sm text-white/50", children: "Available at build time. Prefix with VITE_ or NEXT_PUBLIC_ for client-side access." })] }), _jsx("div", { className: "space-y-2 p-5", children: envVars.map((v) => (_jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]", children: [_jsx("input", { value: v.key, onChange: (e) => updateEnvVar(v.id, 'key', e.target.value), placeholder: "KEY", disabled: step !== 'env', className: "rounded-lg border border-white/10 bg-black px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/30 disabled:opacity-60" }), _jsx("input", { value: v.value, onChange: (e) => updateEnvVar(v.id, 'value', e.target.value), placeholder: "VALUE", disabled: step !== 'env', className: "rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-60" }), _jsx("button", { type: "button", onClick: () => removeEnvVar(v.id), disabled: step !== 'env', className: "flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-white/50 transition hover:bg-white/5 disabled:opacity-40", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, v.id))) }), step === 'env' && (_jsxs("div", { className: "border-t border-white/[0.06] px-5 py-4 flex items-center justify-between", children: [_jsxs("button", { type: "button", onClick: addEnvVar, className: "flex items-center gap-2 text-sm text-white/60 transition hover:text-white", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add variable"] }), _jsx("button", { type: "button", onClick: handleDeploy, className: "rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90", children: "Deploy" })] }))] })), step === 'complete' && publicUrl && (_jsxs("section", { className: "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "rounded-full bg-emerald-500/15 p-3", children: _jsx(Globe, { className: "h-6 w-6 text-emerald-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-emerald-100", children: "Your project is live" }), _jsx("p", { className: "mt-1 text-sm text-white/50", children: "Static files are being served directly \u2014 no containers needed." }), _jsxs("a", { href: publicUrl, target: "_blank", rel: "noreferrer", className: "mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90", children: [publicUrl, _jsx(ExternalLink, { className: "h-3.5 w-3.5" })] })] })] }), _jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx("button", { onClick: () => navigate('/live-projects'), className: "rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5", children: "View Live Projects" }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5", children: "Back to Dashboard" })] })] }))] }), _jsxs("div", { className: "flex flex-col rounded-xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]", children: [_jsx("div", { className: "border-b border-white/[0.06] px-4 py-3", children: _jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-white/40", children: "Build Logs" }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed", children: [logs.map((log) => (_jsxs("div", { className: "mb-0.5 flex gap-3", children: [_jsx("span", { className: "shrink-0 text-white/20", children: log.time }), _jsx("span", { className: log.type === 'error'
                                                            ? 'text-red-400'
                                                            : log.type === 'success'
                                                                ? 'text-emerald-400'
                                                                : log.type === 'system'
                                                                    ? 'text-white/50'
                                                                    : 'text-white/70', children: log.text })] }, log.id))), step === 'deploying' && (_jsxs("div", { className: "mt-2 flex items-center gap-2 text-white/30", children: [_jsx(Loader2, { className: "h-3 w-3 animate-spin" }), _jsx("span", { children: "Building..." })] })), _jsx("div", { ref: logsEndRef })] })] })] })] })] }));
}
