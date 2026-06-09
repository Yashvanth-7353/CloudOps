import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
const historical = Array.from({ length: 8 }).map((_, i) => ({ month: `M${i + 1}`, cost: Math.round(8000 + Math.random() * 4000) }));
const forecast = Array.from({ length: 4 }).map((_, i) => ({ month: `F${i + 1}`, cost: Math.round(9000 + Math.random() * 3000) }));
const data = [...historical, ...forecast];
const CostPredictionChart = () => {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "Cost Prediction" }), _jsx("div", { className: "text-xs text-white/60", children: "Next 4 months" })] }), _jsx("div", { style: { width: '100%', height: 220 }, children: _jsx(ResponsiveContainer, { children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.03)" }), _jsx(XAxis, { dataKey: "month", tick: { fill: 'rgba(255,255,255,0.6)' } }), _jsx(YAxis, { tick: { fill: 'rgba(255,255,255,0.6)' } }), _jsx(Tooltip, { wrapperStyle: { background: 'rgba(2,6,23,0.9)', borderRadius: 6, border: 'none' }, formatter: (v) => [`$${v.toLocaleString()}`, 'Cost'] }), _jsx(Line, { type: "monotone", dataKey: "cost", stroke: "#fb923c", strokeWidth: 2, dot: { r: 2 } })] }) }) }), _jsx("div", { className: "mt-3 text-sm text-white/70", children: "Prediction uses historical trend and exponential smoothing (mock)." })] }));
};
export default CostPredictionChart;
