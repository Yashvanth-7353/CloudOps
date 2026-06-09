import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const statusColor = (s) => {
    switch (s) {
        case 'running':
            return 'bg-yellow-400';
        case 'success':
            return 'bg-green-400';
        case 'failed':
            return 'bg-rose-400';
        default:
            return 'bg-white/6';
    }
};
const DeploymentTimeline = ({ steps }) => {
    return (_jsx("div", { className: "space-y-3", children: steps.map((s, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.06 }, className: "flex items-start gap-3", children: [_jsx("div", { className: `w-3 h-3 mt-1 rounded-full ${statusColor(s.status)}` }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-white/90 font-medium", children: s.label }), _jsx("div", { className: "text-xs text-white/60", children: s.status })] })] }, s.label))) }));
};
export default DeploymentTimeline;
