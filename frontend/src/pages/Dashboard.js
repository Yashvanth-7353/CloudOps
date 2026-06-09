import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertCircle, TrendingUp } from 'lucide-react';
// Lazy load RepoList
const RepoList = React.lazy(() => import('@/components/dashboard/RepoList'));
/**
 * Dashboard Page
 * Main application dashboard for authenticated users
 */
export default function DashboardPage() {
    const stats = [
        { icon: Activity, label: 'Active Deployments', value: '12', color: 'text-accent' },
        { icon: Zap, label: 'Total Uptime', value: '99.9%', color: 'text-primary' },
        { icon: TrendingUp, label: 'Performance', value: '+24%', color: 'text-success' },
        { icon: AlertCircle, label: 'Alerts', value: '2', color: 'text-warning' },
    ];
    return (_jsx(DashboardLayout, { children: _jsx("main", { className: "space-y-10", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-text-primary mb-4", children: "Dashboard" }), _jsx("p", { className: "text-text-secondary text-lg", children: "Welcome back! Here's what's happening with your deployments." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: index * 0.1 }, className: "backdrop-blur-md bg-surface-glass/30 border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all duration-300", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-secondary text-sm mb-2", children: stat.label }), _jsx("p", { className: "text-3xl font-bold text-text-primary", children: stat.value })] }), _jsx("div", { className: `${stat.color} opacity-60`, children: _jsx(Icon, { className: "w-10 h-10" }) })] }) }, stat.label));
                        }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, className: "", children: [_jsx("h2", { className: "text-2xl font-bold text-text-primary mb-4", children: "GitHub repositories" }), _jsx("div", { className: "mb-6", children: _jsx("p", { className: "text-text-secondary", children: "Connect a GitHub repo to load live repository cards and manage them from CloudOps." }) }), _jsx("div", { children: _jsx(Suspense, { fallback: _jsx("div", { children: "Loading repositories..." }), children: _jsx(RepoList, {}) }) })] })] }) }) }));
}
