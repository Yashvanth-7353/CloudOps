import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, RotateCcw, FileText } from 'lucide-react';
import FeedbackState from './FeedbackState';
const DeploymentFailedState = () => {
    return (_jsx(FeedbackState, { tone: "error", icon: AlertTriangle, title: "Deployment failed", description: "The latest deployment stopped during the release pipeline. Review logs, retry the build, or roll back to the previous healthy version.", actions: [
            { label: 'Retry deployment', onClick: () => undefined },
            { label: 'View logs', href: '/deployment-logs', variant: 'secondary' },
        ], illustration: _jsxs("div", { className: "relative mx-auto flex items-center justify-center", children: [_jsx("div", { className: "absolute h-16 w-16 rounded-full bg-rose-500/10 blur-xl" }), _jsxs("div", { className: "relative flex items-center gap-3 rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-rose-100", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx(RotateCcw, { className: "h-5 w-5" })] })] }) }));
};
export default DeploymentFailedState;
