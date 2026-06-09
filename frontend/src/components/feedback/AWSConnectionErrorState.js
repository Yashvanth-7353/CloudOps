import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CloudOff, RefreshCw, KeyRound } from 'lucide-react';
import FeedbackState from './FeedbackState';
const AWSConnectionErrorState = () => {
    return (_jsx(FeedbackState, { tone: "error", icon: CloudOff, title: "AWS connection error", description: "CloudOps could not reach your AWS account. Check credentials, region settings, and IAM permissions, then reconnect to continue deployments.", actions: [
            { label: 'Reconnect AWS', href: '/settings' },
            { label: 'Retry', onClick: () => window.location.reload(), variant: 'secondary' },
        ], illustration: _jsxs("div", { className: "mx-auto flex items-center gap-3 text-white/50", children: [_jsx("div", { className: "rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4 text-rose-100", children: _jsx(CloudOff, { className: "h-6 w-6" }) }), _jsx(RefreshCw, { className: "h-5 w-5" }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-cyan-200", children: _jsx(KeyRound, { className: "h-6 w-6" }) })] }) }));
};
export default AWSConnectionErrorState;
