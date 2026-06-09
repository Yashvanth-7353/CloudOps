import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import GitHubIntegration from '@/components/settings/GitHubIntegration';
import AWSCredentials from '@/components/settings/AWSCredentials';
import EnvVariables from '@/components/settings/EnvVariables';
import Notifications from '@/components/settings/Notifications';
import TeamSettings from '@/components/settings/TeamSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { STORAGE_KEYS, readStoredValue, writeStoredValue } from '@/components/settings/settings-storage';
export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [connectedRepos, setConnectedRepos] = React.useState(() => readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []));
    const tabParam = (searchParams.get('tab') || '').toLowerCase();
    const activeTab = tabParam === 'profile' ? 'profile' : 'settings';
    const showProfileOnly = activeTab === 'profile';
    React.useEffect(() => {
        const sync = () => setConnectedRepos(readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []));
        window.addEventListener('storage', sync);
        window.addEventListener('cloudops:connected-repositories-updated', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('cloudops:connected-repositories-updated', sync);
        };
    }, []);
    const removeRepository = (id) => {
        const next = connectedRepos.filter((repo) => repo.id !== id);
        setConnectedRepos(next);
        writeStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, next);
        window.dispatchEvent(new Event('cloudops:connected-repositories-updated'));
    };
    return (_jsx(DashboardLayout, { children: _jsx("main", { className: "space-y-8", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Settings" }), _jsx("p", { className: "text-white/60", children: "Manage account, integrations, security, and team settings." })] }), _jsxs("div", { className: "inline-flex rounded-xl border border-white/10 bg-white/5 p-1", children: [_jsx("button", { type: "button", onClick: () => setSearchParams({ tab: 'profile' }), className: `rounded-lg px-4 py-2 text-sm transition ${activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white hover:bg-white/5'}`, children: "Profile" }), _jsx("button", { type: "button", onClick: () => setSearchParams({ tab: 'settings' }), className: `rounded-lg px-4 py-2 text-sm transition ${activeTab === 'settings' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white hover:bg-white/5'}`, children: "Settings" })] }), showProfileOnly ? (_jsx("div", { className: "grid grid-cols-1 gap-6", children: _jsx(ProfileSettings, {}) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(GitHubIntegration, {}), _jsx(AWSCredentials, {}), _jsx(EnvVariables, {}), _jsx(Notifications, {}), _jsx(TeamSettings, {}), _jsx(SecuritySettings, {})] }), _jsxs("section", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Connected repositories" }), _jsx("p", { className: "text-sm text-white/60", children: "Repositories linked to your CloudOps workspace." })] }), _jsxs("div", { className: "text-xs uppercase tracking-[0.2em] text-cyan-300/80", children: [connectedRepos.length, " connected"] })] }), connectedRepos.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: connectedRepos.map((repo) => (_jsxs("div", { className: "rounded-xl border border-white/8 bg-white/5 px-4 py-4", children: [_jsx("div", { className: "text-white font-medium", children: repo.name }), _jsx("div", { className: "mt-1 text-sm text-white/60", children: repo.fullName }), _jsx("div", { className: "mt-3 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100", children: repo.language || 'Connected' }), _jsx("button", { type: "button", onClick: () => removeRepository(repo.id), className: "mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10", children: "Remove connection" })] }, repo.id))) })) : (_jsx("div", { className: "rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60", children: "No connected repositories yet." }))] })] }))] }) }) }));
}
