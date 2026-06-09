import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
const data = [
    { name: 'Healthy', value: 86 },
    { name: 'Degraded', value: 10 },
    { name: 'Down', value: 4 },
];
const COLORS = ['#34d399', '#f59e0b', '#fb7185'];
const ApplicationHealth = () => {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "Application Health" }), _jsx("div", { className: "text-xs text-white/60", children: "Overall" })] }), _jsx("div", { style: { width: '100%', height: 180 }, children: _jsx(ResponsiveContainer, { children: _jsx(PieChart, { children: _jsx(Pie, { data: data, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 70, paddingAngle: 2, children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }) }) }) }), _jsxs("div", { className: "mt-3 flex flex-col gap-1 text-sm", children: [_jsx("div", { className: "text-white/90", children: "Healthy: 86%" }), _jsx("div", { className: "text-white/70", children: "Degraded: 10%" }), _jsx("div", { className: "text-white/70", children: "Down: 4%" })] })] }));
};
export default ApplicationHealth;
