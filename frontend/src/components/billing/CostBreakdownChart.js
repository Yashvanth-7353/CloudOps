import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
const data = [
    { name: 'ECS', value: 6120 },
    { name: 'Storage', value: 2480 },
    { name: 'Network', value: 1210 },
    { name: 'Other', value: 2620 },
];
const COLORS = ['#60a5fa', '#7c3aed', '#fb7185', '#f59e0b'];
const CostBreakdownChart = () => (_jsxs(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "AWS Cost Breakdown" }), _jsx("div", { className: "text-xs text-white/60", children: "Last 30 days" })] }), _jsx("div", { style: { width: '100%', height: 220 }, children: _jsx(ResponsiveContainer, { children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 48, outerRadius: 80, paddingAngle: 4, children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { wrapperStyle: { background: 'rgba(2,6,23,0.9)', borderRadius: 6, border: 'none' }, formatter: (v) => [`$${v.toLocaleString()}`, 'Cost'] })] }) }) }), _jsx("div", { className: "mt-3 text-sm text-white/70", children: _jsx("div", { className: "flex flex-col gap-2", children: data.map((d, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "w-3 h-3 rounded-full", style: { background: COLORS[i] } }), _jsx("div", { className: "flex-1 text-sm text-white/90", children: d.name }), _jsxs("div", { className: "text-sm text-white/80", children: ["$", d.value.toLocaleString()] })] }, d.name))) }) })] }));
export default CostBreakdownChart;
