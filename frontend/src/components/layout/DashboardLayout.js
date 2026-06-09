import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    return (_jsxs("div", { className: "relative flex min-h-screen bg-gradient-to-br from-[#05060b] to-[#071026] text-white", children: [_jsx("div", { className: "hidden lg:flex", children: _jsx(Sidebar, { collapsed: collapsed, onCollapse: setCollapsed }) }), _jsx(AnimatePresence, { children: mobileOpen && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-40 lg:hidden", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: () => setMobileOpen(false) }), _jsx(motion.div, { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' }, transition: { type: 'spring', stiffness: 300, damping: 30 }, className: "absolute left-0 top-0 bottom-0 w-72", children: _jsx(Sidebar, { onCollapse: () => setMobileOpen(false) }) })] })) }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(TopNavbar, { onToggleMobileSidebar: () => setMobileOpen(true) }), _jsx("main", { className: "flex-1 overflow-auto", children: _jsx("div", { className: "page-shell page-shell--wide", children: children }) })] })] }));
};
export default DashboardLayout;
