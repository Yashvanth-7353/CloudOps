import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileCode2, Terminal, X } from 'lucide-react';
import { deploymentService } from '../../services/deployment-service';
export default function DeployWizardModal({ repoName, repoOwner, onClose }) {
    const [step, setStep] = useState('cloning');
    const [clonePath, setClonePath] = useState('');
    const [hasDockerfile, setHasDockerfile] = useState(true);
    const [error, setError] = useState(null);
    // Form States
    const [envPath, setEnvPath] = useState('.env');
    const [envContent, setEnvContent] = useState('');
    const [dockerfileContent, setDockerfileContent] = useState('');
    // Step 1: Clone immediately on mount
    useEffect(() => {
        const startClone = async () => {
            try {
                const result = await deploymentService.initDeploy(repoName, repoOwner);
                setClonePath(result.clonePath);
                setHasDockerfile(result.hasDockerfile);
                setStep('env'); // Move to env setup after cloning
            }
            catch (err) {
                setError(err.message);
            }
        };
        startClone();
    }, [repoName, repoOwner]);
    const handleNextFromEnv = () => {
        if (!hasDockerfile) {
            setStep('dockerfile');
        }
        else {
            handleSaveAll();
        }
    };
    const handleSaveAll = async () => {
        setStep('saving');
        try {
            await deploymentService.saveFiles({
                clonePath,
                envPath,
                envContent,
                dockerfileContent: !hasDockerfile ? dockerfileContent : undefined
            });
            setStep('done');
        }
        catch (err) {
            setError(err.message);
            setStep('env'); // Go back on error
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-[#0f1423] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center p-4 border-b border-white/10 bg-white/5", children: [_jsxs("h2", { className: "text-lg font-semibold text-white", children: ["Deploying ", repoName] }), _jsx("button", { onClick: onClose, className: "text-white/50 hover:text-white transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6", children: [error && (_jsx("div", { className: "mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm", children: error })), (step === 'cloning' || step === 'saving') && (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Loader2, { className: "w-10 h-10 text-cyan-400 animate-spin mb-4" }), _jsx("p", { className: "text-white/80 text-lg", children: step === 'cloning' ? 'Cloning repository from GitHub...' : 'Configuring files...' }), _jsx("p", { className: "text-white/40 text-sm mt-2", children: "This will only take a moment." })] })), step === 'env' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Terminal, { className: "w-5 h-5 text-cyan-400" }), _jsx("h3", { className: "text-md font-medium text-white", children: "Environment Variables" })] }), _jsx("p", { className: "text-white/60 text-sm mb-4", children: "Provide any environment variables required by your application. Leave blank if none are needed." }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-xs font-medium text-white/60 mb-1", children: "File Path (e.g., .env or server/.env)" }), _jsx("input", { type: "text", value: envPath, onChange: (e) => setEnvPath(e.target.value), className: "w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500/50" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-xs font-medium text-white/60 mb-1", children: ".env Content" }), _jsx("textarea", { value: envContent, onChange: (e) => setEnvContent(e.target.value), placeholder: "PORT=8080\nDB_URL=mongodb://...", className: "w-full h-40 bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50" })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: handleNextFromEnv, className: "bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-lg font-medium hover:bg-cyan-500/30 transition", children: hasDockerfile ? 'Save & Continue' : 'Next Step' }) })] })), step === 'dockerfile' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(FileCode2, { className: "w-5 h-5 text-yellow-400" }), _jsx("h3", { className: "text-md font-medium text-white", children: "Missing Dockerfile Detected" })] }), _jsx("p", { className: "text-white/60 text-sm mb-4", children: "We couldn't find a Dockerfile in your repository root. CloudOps requires one to build your app. Paste your Docker configuration below." }), _jsx("div", { className: "mb-6", children: _jsx("textarea", { value: dockerfileContent, onChange: (e) => setDockerfileContent(e.target.value), placeholder: "FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]", className: "w-full h-48 bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-500/50" }) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => setStep('env'), className: "bg-white/5 text-white/70 px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition", children: "Back" }), _jsx("button", { onClick: handleSaveAll, disabled: !dockerfileContent.trim(), className: "bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-lg font-medium hover:bg-cyan-500/30 transition disabled:opacity-50", children: "Save & Prepare Build" })] })] })), step === 'done' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl", children: "\u2713" }), _jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Configuration Complete!" }), _jsx("p", { className: "text-white/60 mb-6", children: "Your environment files and Dockerfile are ready. The deployment engine is primed." }), _jsx("button", { onClick: onClose, className: "bg-cyan-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-400 transition", children: "Close Wizard" })] }))] })] }) }));
}
