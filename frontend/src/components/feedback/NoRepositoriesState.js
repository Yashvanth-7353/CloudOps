import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GitBranch, Plus } from 'lucide-react';
import FeedbackState from './FeedbackState';
const NoRepositoriesState = () => {
    return (_jsx(FeedbackState, { tone: "info", icon: GitBranch, title: "No repositories connected", description: "Connect a GitHub repository to start automated deployments, monitor builds, and view runtime insights in one place.", actions: [
            { label: 'Connect GitHub', href: '/login' },
            { label: 'Refresh', onClick: () => window.location.reload(), variant: 'secondary' },
        ], illustration: _jsxs("div", { className: "mx-auto flex items-center justify-center gap-3 text-white/45", children: [_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: _jsx(GitBranch, { className: "h-7 w-7" }) }), _jsx(Plus, { className: "h-5 w-5" }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-cyan-200", children: _jsx(GitBranch, { className: "h-7 w-7" }) })] }) }));
};
export default NoRepositoriesState;
