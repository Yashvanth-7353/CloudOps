import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, RefreshCw, ShieldAlert } from 'lucide-react';
import FeedbackState from './FeedbackState';
const AnalyticsUnavailableState = () => {
    return (_jsx(FeedbackState, { tone: "warning", icon: BarChart3, title: "Analytics unavailable", description: "Metrics are temporarily unavailable while the telemetry service reconnects. You can refresh the dashboard or check the status page for updates.", actions: [
            { label: 'Refresh analytics', onClick: () => window.location.reload() },
            { label: 'Status page', href: '/status', variant: 'secondary' },
        ], illustration: _jsxs("div", { className: "mx-auto flex items-center gap-3 text-amber-100/80", children: [_jsx("div", { className: "rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4", children: _jsx(ShieldAlert, { className: "h-6 w-6" }) }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: _jsx(BarChart3, { className: "h-6 w-6" }) }), _jsx(RefreshCw, { className: "h-5 w-5 animate-spin" })] }) }));
};
export default AnalyticsUnavailableState;
