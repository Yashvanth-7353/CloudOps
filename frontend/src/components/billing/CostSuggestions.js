import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Zap, Layers, Database, Cpu } from 'lucide-react';
const suggestions = [
    { icon: _jsx(Zap, { className: "w-4 h-4" }), title: 'Right-size ECS tasks', desc: 'Reduce CPU/RAM for low-util services.' },
    { icon: _jsx(Layers, { className: "w-4 h-4" }), title: 'Use spot capacity', desc: 'Migrate non-critical workers to spot instances.' },
    { icon: _jsx(Database, { className: "w-4 h-4" }), title: 'Archive older data', desc: 'Move infrequently accessed data to Glacier.' },
    { icon: _jsx(Cpu, { className: "w-4 h-4" }), title: 'Enable CPU autoscaling', desc: 'Scale down idle nodes automatically.' },
];
const CostSuggestions = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Cost Optimization Suggestions" }), _jsx("div", { className: "flex flex-col gap-3", children: suggestions.map(s => (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center text-white", children: s.icon }), _jsxs("div", { children: [_jsx("div", { className: "text-white/90 font-medium", children: s.title }), _jsx("div", { className: "text-white/70 text-sm", children: s.desc })] })] }, s.title))) })] }));
export default CostSuggestions;
