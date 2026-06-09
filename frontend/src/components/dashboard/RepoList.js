import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import RepoCard from './RepoCard';
import { motion, AnimatePresence } from 'framer-motion';
import { githubService } from '@/services/github-service';
import { useAuth } from '@/app/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { Github, Loader2, Search } from 'lucide-react';
const STORAGE_KEY = 'cloudops_connected_repositories';
const RepoList = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [repos, setRepos] = useState([]);
    const [connectedRepos, setConnectedRepos] = useState([]);
    const [showBrowser, setShowBrowser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setConnectedRepos(JSON.parse(saved));
            }
        }
        catch {
            setConnectedRepos([]);
        }
    }, []);
    const persistConnections = (items) => {
        setConnectedRepos(items);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    };
    const fetchRepositories = async () => {
        if (!isAuthenticated) {
            setError('Please sign in first to connect GitHub repositories.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await githubService.listRepositories();
            const mapped = (response.data.repositories || []).map((repository) => ({
                id: repository.id,
                name: repository.name,
                fullName: repository.fullName,
                description: repository.description,
                language: repository.language,
                updatedAt: repository.updatedAt,
                htmlUrl: repository.htmlUrl,
                cloneUrl: repository.cloneUrl,
                isPrivate: repository.isPrivate,
                defaultBranch: repository.defaultBranch,
            }));
            setRepos(mapped);
        }
        catch (fetchError) {
            setError(fetchError?.response?.data?.error || 'Unable to load GitHub repositories.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleConnectRepository = async () => {
        setShowBrowser(true);
        if (!repos.length) {
            await fetchRepositories();
        }
    };
    const filtered = useMemo(() => {
        const list = repos.filter((repo) => {
            const searchable = `${repo.name} ${repo.fullName} ${repo.language || ''} ${repo.description || ''}`.toLowerCase();
            return searchable.includes(query.toLowerCase());
        });
        return list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }, [repos, query]);
    const handleConnect = (repo) => {
        const next = connectedRepos.some((item) => item.id === repo.id)
            ? connectedRepos
            : [repo, ...connectedRepos];
        persistConnections(next);
    };
    const handleRemove = (repo) => {
        persistConnections(connectedRepos.filter((item) => item.id !== repo.id));
    };
    const handleDeploy = (repo) => {
        const owner = repo.fullName.split('/')[0];
        navigate(`/deploy/${owner}/${repo.name}`);
    };
    return (_jsxs("div", { children: [_jsxs("section", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] mb-6", children: [_jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Connect a repository" }), _jsx("p", { className: "text-sm text-white/60", children: "Pick one or more GitHub repositories to display them as cards." })] }), _jsx("div", { className: "flex flex-wrap items-center gap-3", children: _jsxs("button", { type: "button", onClick: handleConnectRepository, className: "inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20", children: [_jsx(Github, { className: "h-4 w-4" }), "Connect repository"] }) })] }), error && _jsx("div", { className: "mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100", children: error })] }), _jsxs("section", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-text-primary", children: "Connected repositories" }), _jsx("p", { className: "text-text-secondary", children: "Deploy frontends with one click \u2014 build dist files and go live, no Docker required." })] }), _jsxs("div", { className: "text-sm text-text-secondary", children: [connectedRepos.length, " selected"] })] }), connectedRepos.length > 0 ? (_jsx(AnimatePresence, { children: _jsx(motion.div, { layout: true, className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: connectedRepos.map((repo) => (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, children: _jsx(RepoCard, { repo: repo, selected: true, onRemove: handleRemove, onDeploy: handleDeploy }) }, repo.id))) }) })) : (_jsxs("div", { className: "rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center text-white/60", children: ["No connected repositories yet. Use ", _jsx("span", { className: "text-white", children: "Connect repository" }), " to choose one from GitHub."] }))] }), showBrowser && (_jsxs("section", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: "Available GitHub repositories" }), _jsx("p", { className: "text-sm text-white/60", children: "Select a repository to add it to your CloudOps cards." })] }), _jsxs("div", { className: "relative w-full md:w-80", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search repositories...", className: "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/40" })] })] }), isLoading ? (_jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white/70", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin text-cyan-300" }), "Loading repositories from GitHub..."] })) : filtered.length > 0 ? (_jsx(AnimatePresence, { children: _jsx(motion.div, { layout: true, className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", children: filtered.map((repo) => (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, children: _jsx(RepoCard, { repo: repo, selected: connectedRepos.some((item) => item.id === repo.id), onConnect: handleConnect, onRemove: handleRemove, onDeploy: handleDeploy }) }, repo.id))) }) })) : (_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white/60", children: "No repositories match your search." }))] }))] }));
};
export default RepoList;
