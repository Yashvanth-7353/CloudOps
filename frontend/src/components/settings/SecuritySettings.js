import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';
const DEFAULT_SECURITY = {
    mfa: true,
    deployApproval: true,
};
const SecuritySettings = () => {
    const stored = readStoredValue(SETTINGS_KEYS.SECURITY, DEFAULT_SECURITY);
    const [mfa, setMfa] = useState(stored.mfa);
    const [deployApproval, setDeployApproval] = useState(stored.deployApproval);
    const Toggle = ({ checked, onChange }) => (_jsx("button", { type: "button", onClick: () => onChange(!checked), className: `relative h-7 w-12 rounded-full transition ${checked ? 'bg-cyan-500/80' : 'bg-white/15'}`, "aria-pressed": checked, children: _jsx("span", { className: `absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}` }) }));
    const persist = (next) => {
        setMfa(next.mfa);
        setDeployApproval(next.deployApproval);
        writeStoredValue(SETTINGS_KEYS.SECURITY, next);
    };
    return (_jsxs(motion.section, { whileHover: { y: -4 }, className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Security settings" }), _jsx("p", { className: "text-sm text-white/60", children: "Protect deployments and account access." })] }), _jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-emerald-300", children: _jsx(ShieldCheck, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3", children: [_jsxs("div", { className: "text-sm text-white/85", children: [_jsx("div", { children: "Multi-factor authentication" }), _jsx("div", { className: "text-white/60", children: "Required for all team members" })] }), _jsx(Toggle, { checked: mfa, onChange: (value) => persist({ mfa: value, deployApproval }) })] }), _jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3", children: [_jsxs("div", { className: "text-sm text-white/85", children: [_jsx("div", { children: "Deployment approval required" }), _jsx("div", { className: "text-white/60", children: "Manual approval before production pushes" })] }), _jsx(Toggle, { checked: deployApproval, onChange: (value) => persist({ mfa, deployApproval: value }) })] }), _jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70", children: [_jsx(LockKeyhole, { className: "h-4 w-4 text-cyan-300" }), "Secrets are encrypted at rest and audited on change."] })] })] }));
};
export default SecuritySettings;
