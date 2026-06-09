import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
const TopNavbar = ({ onToggleMobileSidebar }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const userInitial = user?.username?.[0]?.toUpperCase() ||
        user?.name?.[0]?.toUpperCase() ||
        user?.login?.[0]?.toUpperCase() ||
        'U';
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsx("header", { className: "w-full border-b border-white/6 bg-[rgba(10,14,24,0.4)] backdrop-blur-md", children: _jsxs("div", { className: "max-w-full mx-auto px-4 py-3 flex items-center gap-4", children: [_jsx("div", { className: "flex items-center gap-3 md:hidden", children: _jsx("button", { onClick: onToggleMobileSidebar, className: "p-2 rounded-lg hover:bg-white/3", children: _jsx("svg", { className: "w-5 h-5 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: _jsx("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h16M4 18h16" }) }) }) }), _jsx("div", { className: "flex items-center flex-1", children: _jsxs("div", { className: "relative w-full max-w-md", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "w-4 h-4 text-white/70" }) }), _jsx("input", { placeholder: "Search deployments, services...", className: "w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 placeholder-white/50 text-white focus:outline-none" })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { className: "p-2 rounded-lg hover:bg-white/3 relative", children: [_jsx(Bell, { className: "w-5 h-5 text-white" }), _jsx("span", { className: "absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white/20" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "flex items-center gap-2 p-2 rounded-lg hover:bg-white/3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-semibold", children: userInitial }), _jsx("div", { className: "hidden md:block text-sm text-white/90", children: user?.username || user?.name || 'User' })] }), open && (_jsx(motion.div, { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.18 }, className: "absolute right-0 mt-2 w-44 bg-[rgba(12,16,26,0.85)] border border-white/6 backdrop-blur-md rounded-lg shadow-lg overflow-hidden", children: _jsxs("ul", { className: "py-1", children: [_jsx("li", { children: _jsx("a", { href: "/profile", className: "block px-3 py-2 text-sm hover:bg-white/3", children: "Profile" }) }), _jsx("li", { children: _jsx("a", { href: "/settings", className: "block px-3 py-2 text-sm hover:bg-white/3", children: "Settings" }) }), _jsx("li", { children: _jsx("button", { type: "button", onClick: handleLogout, className: "w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-white/3", children: "Sign out" }) })] }) }))] })] })] }) }));
};
export default TopNavbar;
