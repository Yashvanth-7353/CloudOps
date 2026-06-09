import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { BookOpen, Sparkles, ShieldCheck, Cloud, BarChart3, Rocket } from 'lucide-react';
const docsSections = [
    {
        title: 'Quick Start',
        description: 'Get CloudOps installed, connected to your repository, and deploying in minutes with a guide that walks through each step.',
        icon: _jsx(Sparkles, { className: "w-6 h-6 text-primary" }),
    },
    {
        title: 'Deployment Pipeline',
        description: 'Learn how CloudOps automates build, test, and deploy stages for AWS infrastructure with pipelines and rollbacks.',
        icon: _jsx(Rocket, { className: "w-6 h-6 text-accent" }),
    },
    {
        title: 'Security',
        description: 'See secure auth, GitHub integration, secrets management, and role-based access control for teams.',
        icon: _jsx(ShieldCheck, { className: "w-6 h-6 text-success" }),
    },
    {
        title: 'Monitoring',
        description: 'Use analytics, logs, alerts, and cost insights to keep your applications healthy and optimized.',
        icon: _jsx(BarChart3, { className: "w-6 h-6 text-warning" }),
    },
    {
        title: 'Cloud Integrations',
        description: 'Connect AWS, containers, and third-party services using established CloudOps integrations.',
        icon: _jsx(Cloud, { className: "w-6 h-6 text-cyan-300" }),
    },
    {
        title: 'API Reference',
        description: 'Consume CloudOps API endpoints for deployments, repositories, and analytics from your CI/CD workflows.',
        icon: _jsx(BookOpen, { className: "w-6 h-6 text-white" }),
    },
];
export default function DocsPage() {
    return (_jsx(Layout, { showNavbar: true, children: _jsxs("main", { className: "space-y-10 py-24", children: [_jsx("section", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-6 items-start justify-between", children: [_jsxs("div", { className: "max-w-3xl space-y-4", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.35em] text-primary", children: "Documentation" }), _jsx("h1", { className: "text-4xl sm:text-5xl font-semibold text-white", children: "CloudOps Docs" }), _jsx("p", { className: "text-white/70 leading-8", children: "Everything you need to understand CloudOps. From setup to deployments, from GitHub integration to analytics and observability." })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("a", { href: "#getting-started", className: "btn btn-secondary", children: "Getting Started" }), _jsx("a", { href: "#deployment-pipeline", className: "btn btn-secondary", children: "Deployment Guide" }), _jsx("a", { href: "#monitoring", className: "btn btn-secondary", children: "Monitoring" })] })] }) }) }), _jsx("section", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-3", children: docsSections.map((section) => (_jsxs(motion.article, { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 }, className: "glass-elevated rounded-[1.5rem] border border-white/10 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.2)]", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mb-5", children: section.icon }), _jsx("h2", { className: "text-xl font-semibold text-white mb-3", children: section.title }), _jsx("p", { className: "text-white/70 leading-7", children: section.description })] }, section.title))) }), _jsx("section", { id: "getting-started", className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", children: _jsxs("div", { className: "rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md", children: [_jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-semibold text-white", children: "Getting Started" }), _jsx("p", { className: "text-white/70 mt-2 max-w-2xl", children: "Follow the first steps to connect your GitHub repository, configure your AWS environment, and run your first deployment." })] }), _jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary", children: [_jsx(Sparkles, { className: "w-4 h-4" }), " Quick start guide"] })] }), _jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [
                                    {
                                        step: '01',
                                        title: 'Connect repo',
                                        detail: 'Authorize CloudOps with GitHub and select the repository you want to deploy.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Configure pipeline',
                                        detail: 'Set up build commands, environments, and AWS target configuration.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Deploy live',
                                        detail: 'Trigger your first deployment and monitor status from the dashboard.',
                                    },
                                ].map((item) => (_jsxs("div", { className: "rounded-3xl border border-white/10 p-6 bg-[rgba(255,255,255,0.03)]", children: [_jsxs("div", { className: "text-sm uppercase tracking-[0.3em] text-primary mb-4", children: ["Step ", item.step] }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: item.title }), _jsx("p", { className: "text-white/70 leading-7", children: item.detail })] }, item.step))) })] }) }), _jsxs("section", { id: "deployment-pipeline", className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md", children: [_jsx("h2", { className: "text-3xl font-semibold text-white", children: "Deployment Pipeline" }), _jsx("p", { className: "text-white/70 mt-4 leading-8", children: "CloudOps runs your build, test, and deploy stages automatically. Define your environment, choose branches, and let CloudOps handle releases with rollback safety." }), _jsx("ul", { className: "mt-8 space-y-4", children: [
                                        'Build container images or serverless artifacts using your repo settings.',
                                        'Run pre-deploy validation and tests before production updates.',
                                        'Deploy safely to AWS with environment promotion and monitoring.',
                                    ].map((item) => (_jsxs("li", { className: "flex gap-3 text-white/75", children: [_jsx("span", { className: "mt-1 text-primary", children: "\u2022" }), _jsx("span", { children: item })] }, item))) })] }), _jsxs("div", { className: "rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md", children: [_jsx("h2", { className: "text-3xl font-semibold text-white", children: "Integrations" }), _jsx("p", { className: "text-white/70 mt-4 leading-8", children: "Use GitHub, AWS, container registries, and third-party services to create a deployment pipeline that fits your team\u2019s stack." }), _jsx("div", { className: "mt-8 grid gap-3", children: ['GitHub OAuth', 'AWS IAM & Secrets', 'Docker & Container Registry', 'Monitoring & Alerts'].map((item) => (_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: _jsx("p", { className: "text-white/75", children: item }) }, item))) })] })] }), _jsx("section", { id: "monitoring", className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[2rem] border border-white/10 bg-[rgba(12,16,26,0.75)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-md", children: _jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-3xl font-semibold text-white", children: "Monitoring & Analytics" }), _jsx("p", { className: "text-white/70 leading-8", children: "Track deployment health, CPU/memory usage, logs, and cost trends across your cloud infrastructure. Alerts keep your team ahead of issues." })] }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-black", children: "1" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Usage dashboards" }), _jsx("p", { className: "text-white/70", children: "Visualize deployment metrics and server health." })] })] }), _jsxs("div", { className: "mt-6 flex flex-col gap-4", children: [_jsx("div", { className: "rounded-2xl border border-white/10 bg-black/10 p-4", children: _jsx("p", { className: "text-white/70", children: "Performance tracking" }) }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-black/10 p-4", children: _jsx("p", { className: "text-white/70", children: "Cost optimization" }) })] })] })] }) })] }) }));
}
