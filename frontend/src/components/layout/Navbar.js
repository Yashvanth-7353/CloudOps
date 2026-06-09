import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Navbar Component
 * Modern SaaS navbar with glassmorphism, animations, and mobile support
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/app/providers/auth-provider';
import Logo from './Logo';
import './Navbar.css';
const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Deployments', href: '/deployments' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
];
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { notify } = useToast();
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userName = user?.username || user?.name || user?.login || 'User';
    const userInitial = userName?.[0]?.toUpperCase() || 'U';
    const handleLogout = () => {
        setUserMenuOpen(false);
        logout();
        navigate('/login');
    };
    const handleProfile = () => {
        setUserMenuOpen(false);
        navigate('/settings?tab=profile');
    };
    const handleSettings = () => {
        setUserMenuOpen(false);
        navigate('/settings?tab=settings');
    };
    const handleThemeToggle = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        toggleTheme();
        notify({
            variant: 'info',
            title: `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`,
            message: `Switched to ${nextTheme} theme.`,
        });
    };
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    // Close mobile menu on link click
    const handleNavClick = () => {
        setIsOpen(false);
        setActiveDropdown(null);
    };
    // Close user menu when clicking outside
    React.useEffect(() => {
        if (!userMenuOpen)
            return;
        const handleClickOutside = (e) => {
            const target = e.target;
            if (!target.closest('[aria-haspopup="menu"]') && !target.closest('[role="menu"]')) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [userMenuOpen]);
    const isActiveNavLink = (href) => {
        if (href.startsWith('/')) {
            if (href === '/')
                return location.pathname === '/';
            return location.pathname === href;
        }
        if (href.startsWith('#')) {
            return location.pathname === '/' && location.hash === href;
        }
        return false;
    };
    return (_jsxs(_Fragment, { children: [_jsx(motion.nav, { className: `fixed top-0 left-0 right-0 z-[1030] navbar ${scrolled ? 'navbar-scrolled' : ''}`, style: {
                    backgroundColor: scrolled
                        ? 'rgba(11, 16, 32, 0.7)'
                        : 'rgba(11, 16, 32, 0.4)',
                    backdropFilter: scrolled ? 'blur(12px)' : 'blur(6px)',
                }, children: _jsx("div", { className: "container-fluid", children: _jsxs("div", { className: "navbar-content", children: [_jsx(motion.div, { className: "navbar-logo", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: _jsx(Logo, {}) }), _jsx("div", { className: "navbar-links-desktop", children: navLinks.map((link) => (_jsxs(motion.div, { className: "nav-item-wrapper", onHoverStart: () => setActiveDropdown(link.label), onHoverEnd: () => setActiveDropdown(null), children: [_jsxs("a", { href: link.href, className: `nav-link ${isActiveNavLink(link.href) ? 'nav-link-active' : ''}`, onClick: handleNavClick, children: [_jsx("span", { children: link.label }), link.submenu && (_jsx(ChevronDown, { size: 16, className: "nav-chevron" }))] }), isActiveNavLink(link.href) && (_jsx(motion.div, { className: "nav-underline nav-underline-active", layoutId: "active-navbar-underline", initial: false }))] }, link.label))) }), _jsxs("div", { className: "navbar-actions", children: [_jsx(motion.button, { type: "button", className: "theme-toggle-btn", onClick: handleThemeToggle, "aria-label": "Toggle dark mode", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: theme === 'dark' ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }), isAuthenticated ? (_jsxs("div", { className: "hidden md:flex items-center gap-3 relative", children: [_jsxs("button", { type: "button", onClick: () => setUserMenuOpen((value) => !value), className: "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition", "aria-haspopup": "menu", "aria-expanded": userMenuOpen, "aria-label": "Open user menu", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-xs font-semibold", children: userInitial }), userName, _jsx(ChevronDown, { className: `w-4 h-4 transition ${userMenuOpen ? 'rotate-180' : ''}` })] }), _jsx(AnimatePresence, { children: userMenuOpen && (_jsxs(motion.div, { role: "menu", initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.18 }, className: "absolute right-0 top-[calc(100%+10px)] w-44 bg-[rgba(12,16,26,0.9)] border border-white/10 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-[9999]", style: { pointerEvents: 'auto' }, children: [_jsx("button", { type: "button", role: "menuitem", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleProfile();
                                                            }, className: "w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer", children: "Profile" }), _jsx("div", { className: "border-t border-white/5" }), _jsx("button", { type: "button", role: "menuitem", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleSettings();
                                                            }, className: "w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer", children: "Settings" }), _jsx("div", { className: "border-t border-white/5" }), _jsx("button", { type: "button", role: "menuitem", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleLogout();
                                                            }, className: "w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer", children: "Sign out" })] })) })] })) : (_jsxs(motion.a, { href: "http://localhost:5000/auth/github", className: "btn btn-secondary gap-md hidden md:flex", "aria-label": "Sign in with GitHub", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(Github, { size: 18 }), _jsx("span", { children: "Sign in" })] })), _jsx(motion.button, { className: "btn-menu md:hidden", onClick: () => setIsOpen(!isOpen), "aria-label": isOpen ? 'Close navigation menu' : 'Open navigation menu', "aria-expanded": isOpen, "aria-controls": "mobile-navigation-menu", whileTap: { scale: 0.9 }, children: _jsx(AnimatePresence, { mode: "wait", children: isOpen ? (_jsx(motion.div, { initial: { rotate: -90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: 90, opacity: 0 }, transition: { duration: 0.2 }, children: _jsx(X, { size: 24 }) }, "close")) : (_jsx(motion.div, { initial: { rotate: 90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: -90, opacity: 0 }, transition: { duration: 0.2 }, children: _jsx(Menu, { size: 24 }) }, "open")) }) })] })] }) }) }), _jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { id: "mobile-navigation-menu", className: "mobile-menu", initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3, ease: 'easeInOut' }, children: _jsxs("div", { className: "mobile-menu-content", children: [navLinks.map((link, index) => (_jsx(motion.a, { href: link.href, className: "mobile-nav-link", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { delay: index * 0.05, duration: 0.2 }, onClick: handleNavClick, children: link.label }, link.label))), isAuthenticated ? (_jsx(motion.button, { type: "button", className: "mobile-github-btn", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { delay: navLinks.length * 0.05, duration: 0.2 }, onClick: () => {
                                    handleNavClick();
                                    handleLogout();
                                }, children: _jsx("span", { children: "Sign out" }) })) : (_jsxs(motion.a, { href: "http://localhost:5000/auth/github", className: "mobile-github-btn", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { delay: navLinks.length * 0.05, duration: 0.2 }, onClick: handleNavClick, children: [_jsx(Github, { size: 18 }), _jsx("span", { children: "Sign in with GitHub" })] }))] }) })) }), _jsx("div", { className: "navbar-spacer" })] }));
};
export default Navbar;
