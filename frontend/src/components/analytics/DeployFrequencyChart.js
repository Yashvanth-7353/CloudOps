import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
const data = Array.from({ length: 12 }).map((_, i) => ({ month: `M${i + 1}`, freq: Math.round(10 + Math.random() * 40) }));
const DeployFrequencyChart = () => {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "Deployment Frequency" }), _jsx("div", { className: "text-xs text-white/60", children: "Monthly" })] }), _jsx("div", { style: { width: '100%', height: 200 }, children: _jsx(ResponsiveContainer, { children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.03)" }), _jsx(XAxis, { dataKey: "month", tick: { fill: 'rgba(255,255,255,0.6)' } }), _jsx(YAxis, { tick: { fill: 'rgba(255,255,255,0.6)' } }), _jsx(Tooltip, { wrapperStyle: { background: 'rgba(2,6,23,0.9)', borderRadius: 6, border: 'none' }, contentStyle: { color: '#fff' } }), _jsx(Bar, { dataKey: "freq", fill: "#34d399", radius: [6, 6, 0, 0] })] }) }) })] }));
};
export default DeployFrequencyChart;
