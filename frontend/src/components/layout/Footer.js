import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Github, Mail, Sparkles } from 'lucide-react';
const footerLinks = [
    { label: 'Docs', href: '/docs' },
    { label: 'Deployments', href: '/deployments' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Support', href: 'mailto:support@cloudops.io' },
];
export default function Footer() {
    return (_jsx("footer", { className: "border-t border-white/10 bg-[rgba(8,12,22,0.65)] backdrop-blur-xl py-10 text-white/80", children: _jsxs("div", { className: "page-shell page-shell--wide grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.35em] text-primary", children: "CloudOps" }), _jsx("h2", { className: "text-2xl sm:text-3xl font-semibold text-white", children: "Build, deploy, and operate your cloud infrastructure with confidence." }), _jsx("p", { className: "max-w-2xl text-white/70 leading-7", children: "CloudOps helps teams ship faster by automating deployment pipelines, maintaining visibility, and keeping environments secure." })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-1", children: [_jsx("div", { className: "flex flex-wrap gap-3", children: footerLinks.map((link) => (_jsx("a", { href: link.href, className: "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-primary/50 hover:text-white", children: link.label }, link.label))) }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/75", children: [_jsx("p", { className: "mb-3 font-semibold text-white", children: "Stay updated" }), _jsx("p", { className: "leading-7", children: "Subscribe to updates, release notes, and best practices for modern cloud deployments." }), _jsxs("div", { className: "mt-4 flex items-center gap-3 text-white/80", children: [_jsx(Github, { className: "w-5 h-5" }), _jsx(Mail, { className: "w-5 h-5" }), _jsx(Sparkles, { className: "w-5 h-5" })] })] })] })] }) }));
}
