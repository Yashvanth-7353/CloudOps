import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Banknote, ServerCog, Database, Share2 } from 'lucide-react';
const Card = ({ label, value, icon }) => (_jsx(motion.div, { whileHover: { y: -6 }, className: "p-4 rounded-xl bg-gradient-to-tr from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-white/6 backdrop-blur-md", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-white/60", children: label }), _jsx("div", { className: "text-2xl font-bold text-white mt-1", children: value })] }), _jsx("div", { className: "w-12 h-12 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow", children: icon })] }) }));
const CostSummaryCards = () => {
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { label: "Total AWS Cost (30d)", value: "$12,430", icon: _jsx(Banknote, { className: "w-5 h-5" }) }), _jsx(Card, { label: "ECS Usage", value: "$6,120", icon: _jsx(ServerCog, { className: "w-5 h-5" }) }), _jsx(Card, { label: "Storage", value: "$2,480", icon: _jsx(Database, { className: "w-5 h-5" }) }), _jsx(Card, { label: "Network", value: "$1,210", icon: _jsx(Share2, { className: "w-5 h-5" }) })] }));
};
export default CostSummaryCards;
