import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';
const DEPLOYED_PROJECTS_KEY = 'cloudops_deployed_projects';
const DeployedProjectCard = ({ project }) => {
    const content = (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm uppercase tracking-[0.16em] text-cyan-300/70", children: "Live Project" }), _jsx("h3", { className: "mt-2 text-lg font-semibold text-white", children: project.name }), _jsx("p", { className: "mt-1 text-sm text-white/60", children: project.fullName })] }), _jsx("div", { className: "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200", children: "Deployed" })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsx("span", { className: "rounded-full bg-white/5 px-3 py-1", children: project.language || 'Repository' }), _jsx("span", { className: "rounded-full bg-white/5 px-3 py-1", children: project.deployedAt ? new Date(project.deployedAt).toLocaleString() : 'Just now' })] })] }));
    if (project.liveUrl) {
        return (_jsxs(motion.a, { layout: true, whileHover: { y: -4 }, href: project.liveUrl, target: "_blank", rel: "noreferrer", "aria-label": `Open live project ${project.name}`, className: "block rounded-2xl border border-white/10 bg-[rgba(12,16,26,0.72)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] transition hover:border-cyan-300/40", children: [content, _jsx("div", { className: "mt-4 text-xs text-cyan-200", children: "Open live link in new tab" })] }));
    }
    return (_jsxs(motion.div, { layout: true, whileHover: { y: -4 }, className: "rounded-2xl border border-white/10 bg-[rgba(12,16,26,0.72)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [content, _jsx("div", { className: "mt-4 text-xs text-white/45", children: "Live link unavailable" })] }));
};
export default function LiveProjectsPage() {
    const [deployedProjects, setDeployedProjects] = useState([]);
    useEffect(() => {
        const loadProjects = () => {
            try {
                const raw = localStorage.getItem(DEPLOYED_PROJECTS_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                setDeployedProjects(Array.isArray(parsed) ? parsed : []);
            }
            catch {
                setDeployedProjects([]);
            }
        };
        loadProjects();
        window.addEventListener('cloudops:deployed-projects-updated', loadProjects);
        window.addEventListener('storage', loadProjects);
        return () => {
            window.removeEventListener('cloudops:deployed-projects-updated', loadProjects);
            window.removeEventListener('storage', loadProjects);
        };
    }, []);
    return (_jsx(DashboardLayout, { children: _jsx("main", { className: "space-y-10", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "mb-8", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-text-primary mb-4", children: "Live Projects" }), _jsx("p", { className: "text-text-secondary text-lg", children: "Only deployed repositories are shown here." })] }), deployedProjects.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: deployedProjects.map((project) => (_jsx(DeployedProjectCard, { project: project }, project.id))) })) : (_jsx("div", { className: "rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center text-text-secondary", children: "No live project." }))] }) }) }));
}
