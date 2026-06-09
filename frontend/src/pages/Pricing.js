import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout';
const plans = [
    {
        id: 'starter',
        name: 'Starter',
        subtitle: 'For solo developers and prototypes',
        monthly: 0,
        yearly: 0,
        cta: 'Start Free',
        features: [
            '3 active projects',
            '100 deployments per month',
            'Basic logs retention (7 days)',
            'Community support',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        subtitle: 'For teams shipping to production',
        monthly: 29,
        yearly: 24,
        cta: 'Upgrade to Pro',
        highlighted: true,
        features: [
            'Unlimited projects',
            '1,500 deployments per month',
            'Advanced logs retention (30 days)',
            'Slack alerts and audit events',
            'Priority support',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        subtitle: 'For large organizations and compliance needs',
        monthly: 99,
        yearly: 89,
        cta: 'Contact Sales',
        features: [
            'Unlimited everything',
            'Dedicated deployment clusters',
            'Long-term logs retention (365 days)',
            'SSO / SAML and advanced RBAC',
            'Dedicated success manager',
        ],
    },
];
export default function PricingPage() {
    const [billing, setBilling] = useState('monthly');
    const pricingCards = useMemo(() => plans.map((plan) => ({ ...plan, price: billing === 'monthly' ? plan.monthly : plan.yearly })), [billing]);
    return (_jsx(Layout, { showNavbar: true, children: _jsxs("main", { className: "py-16 md:py-24 px-4 md:px-8 space-y-16", children: [_jsxs("section", { className: "max-w-5xl mx-auto text-center", children: [_jsx(motion.h1, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "text-4xl md:text-5xl font-bold text-text-primary", children: "Pricing That Scales With Your Deployments" }), _jsx(motion.p, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 }, className: "mt-5 text-lg text-text-secondary max-w-3xl mx-auto", children: "Start free, then upgrade as your team and traffic grow. Every plan includes secure CI/CD pipelines, observability, and one-click rollback." }), _jsxs("div", { className: "mt-8 inline-flex rounded-xl border border-white/10 bg-white/5 p-1", children: [_jsx("button", { type: "button", onClick: () => setBilling('monthly'), className: `px-4 py-2 rounded-lg text-sm font-medium transition ${billing === 'monthly' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white'}`, children: "Monthly" }), _jsx("button", { type: "button", onClick: () => setBilling('yearly'), className: `px-4 py-2 rounded-lg text-sm font-medium transition ${billing === 'yearly' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white'}`, children: "Yearly (save up to 18%)" })] })] }), _jsx("section", { className: "max-w-7xl mx-auto grid gap-6 lg:grid-cols-3", children: pricingCards.map((plan, index) => (_jsxs(motion.article, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: index * 0.06 }, viewport: { once: true }, className: `rounded-2xl border p-6 backdrop-blur-md ${plan.highlighted
                            ? 'border-cyan-400/45 bg-[rgba(10,18,32,0.85)] shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                            : 'border-white/10 bg-[rgba(10,14,24,0.72)]'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-semibold text-white", children: plan.name }), plan.highlighted && (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-100", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5" }), "Most Popular"] }))] }), _jsx("p", { className: "mt-2 text-sm text-white/60", children: plan.subtitle }), _jsxs("div", { className: "mt-6", children: [_jsxs("span", { className: "text-4xl font-bold text-white", children: ["$", plan.price] }), _jsx("span", { className: "text-white/55 ml-2", children: "/ month" })] }), _jsx("button", { type: "button", className: `mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${plan.highlighted
                                    ? 'bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/15'}`, children: plan.cta }), _jsx("ul", { className: "mt-6 space-y-3", children: plan.features.map((feature) => (_jsxs("li", { className: "flex items-start gap-2 text-sm text-white/75", children: [_jsx(Check, { className: "w-4 h-4 mt-0.5 text-cyan-300" }), _jsx("span", { children: feature })] }, feature))) })] }, plan.id))) }), _jsxs("section", { className: "max-w-7xl mx-auto rounded-2xl border border-white/10 bg-[rgba(10,14,24,0.72)] p-6 md:p-8", children: [_jsx("h3", { className: "text-2xl font-semibold text-white", children: "Feature Comparison" }), _jsx("div", { className: "mt-5 overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[680px] text-sm text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-white/70 border-b border-white/10", children: [_jsx("th", { className: "py-3 pr-4", children: "Feature" }), _jsx("th", { className: "py-3 pr-4", children: "Starter" }), _jsx("th", { className: "py-3 pr-4", children: "Pro" }), _jsx("th", { className: "py-3", children: "Enterprise" })] }) }), _jsxs("tbody", { className: "text-white/80", children: [_jsxs("tr", { className: "border-b border-white/5", children: [_jsx("td", { className: "py-3 pr-4", children: "Projects" }), _jsx("td", { className: "py-3 pr-4", children: "3" }), _jsx("td", { className: "py-3 pr-4", children: "Unlimited" }), _jsx("td", { className: "py-3", children: "Unlimited" })] }), _jsxs("tr", { className: "border-b border-white/5", children: [_jsx("td", { className: "py-3 pr-4", children: "Monthly Deployments" }), _jsx("td", { className: "py-3 pr-4", children: "100" }), _jsx("td", { className: "py-3 pr-4", children: "1,500" }), _jsx("td", { className: "py-3", children: "Custom" })] }), _jsxs("tr", { className: "border-b border-white/5", children: [_jsx("td", { className: "py-3 pr-4", children: "Logs Retention" }), _jsx("td", { className: "py-3 pr-4", children: "7 days" }), _jsx("td", { className: "py-3 pr-4", children: "30 days" }), _jsx("td", { className: "py-3", children: "365 days" })] }), _jsxs("tr", { children: [_jsx("td", { className: "py-3 pr-4", children: "SAML SSO" }), _jsx("td", { className: "py-3 pr-4", children: "-" }), _jsx("td", { className: "py-3 pr-4", children: "-" }), _jsx("td", { className: "py-3", children: "Included" })] })] })] }) })] })] }) }));
}
