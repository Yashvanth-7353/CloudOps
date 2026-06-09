import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const LiveProgressBar = ({ steps, current, progress }) => {
    const currentStep = steps[current] || 'Starting...';
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-white/70", children: [_jsx("div", { children: "Current status" }), _jsxs("div", { children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "rounded-xl border border-white/10 bg-white/5 px-4 py-3", children: _jsx("div", { className: "text-sm font-medium text-white", children: currentStep }) }), _jsx("div", { className: "w-full bg-white/6 rounded-full h-3 overflow-hidden", children: _jsx(motion.div, { className: "h-3 bg-gradient-to-r from-primary to-accent shadow-glow", initial: { width: 0 }, animate: { width: `${Math.min(100, Math.max(0, progress))}%` }, transition: { ease: 'easeInOut', duration: 0.6 } }) })] }));
};
export default LiveProgressBar;
