import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Server, Code, CheckCircle2, Clock } from 'lucide-react';
const StatCard = ({ label, value, icon }) => {
    return (_jsx(motion.div, { whileHover: { y: -4 }, className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-white/60", children: label }), _jsx("div", { className: "text-2xl font-bold text-white mt-1", children: value })] }), _jsx("div", { className: "w-12 h-12 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow", children: icon })] }) }));
};
const StatsCards = () => {
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Deployments", value: "1,284", icon: _jsx(Server, { className: "w-6 h-6" }) }), _jsx(StatCard, { label: "Active Containers", value: "87", icon: _jsx(Code, { className: "w-6 h-6" }) }), _jsx(StatCard, { label: "Success Rate", value: "98.6%", icon: _jsx(CheckCircle2, { className: "w-6 h-6" }) }), _jsx(StatCard, { label: "Avg Deploy Time", value: "2m 14s", icon: _jsx(Clock, { className: "w-6 h-6" }) })] }));
};
export default StatsCards;
