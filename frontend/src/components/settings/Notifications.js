import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Mail, MessageSquare } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';
const DEFAULT_NOTIFICATIONS = {
    email: true,
    slack: true,
    browser: false,
};
const Toggle = ({ checked, onChange }) => (_jsx("button", { type: "button", onClick: () => onChange(!checked), className: `relative h-7 w-12 rounded-full transition ${checked ? 'bg-emerald-500/80' : 'bg-white/15'}`, "aria-pressed": checked, children: _jsx("span", { className: `absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}` }) }));
const Notifications = () => {
    const stored = readStoredValue(SETTINGS_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const [email, setEmail] = useState(stored.email);
    const [slack, setSlack] = useState(stored.slack);
    const [browser, setBrowser] = useState(stored.browser);
    const persist = (next) => {
        setEmail(next.email);
        setSlack(next.slack);
        setBrowser(next.browser);
        writeStoredValue(SETTINGS_KEYS.NOTIFICATIONS, next);
    };
    return (_jsxs(motion.section, { whileHover: { y: -4 }, className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Notification preferences" }), _jsx("p", { className: "text-sm text-white/60", children: "Choose how you get deployment updates." })] }), _jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-violet-300", children: _jsx(BellRing, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "space-y-3", children: [
                    { label: 'Email notifications', icon: _jsx(Mail, { className: "h-4 w-4" }), checked: email, onChange: (value) => persist({ email: value, slack, browser }) },
                    { label: 'Slack alerts', icon: _jsx(MessageSquare, { className: "h-4 w-4" }), checked: slack, onChange: (value) => persist({ email, slack: value, browser }) },
                    { label: 'Browser notifications', icon: _jsx(BellRing, { className: "h-4 w-4" }), checked: browser, onChange: (value) => persist({ email, slack, browser: value }) },
                ].map((item) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm text-white/85", children: [_jsx("span", { className: "text-cyan-300", children: item.icon }), item.label] }), _jsx(Toggle, { checked: item.checked, onChange: item.onChange })] }, item.label))) })] }));
};
export default Notifications;
