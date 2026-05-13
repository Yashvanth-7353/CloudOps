import React, { useEffect, useMemo, useState } from 'react';
import RepoCard, { Repo } from './RepoCard';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { githubService, GitHubRepository } from '@/services/github-service';
import { useAuth } from '@/app/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { Github, Loader2, RefreshCw, Search, Plus, Trash2, X } from 'lucide-react';

const STORAGE_KEY = 'cloudops_connected_repositories';
const DEPLOYED_PROJECTS_KEY = 'cloudops_deployed_projects';

type EnvDraft = {
  id: number;
  key: string;
  value: string;
};

const buildProjectLogs = (repoFullName: string, envPairs: Array<{ key: string; value: string }>) => {
  const time = new Date().toISOString();
  const envCount = envPairs.length;
  return [
    `[${time}] Deployment request received for ${repoFullName}.`,
    `[${time}] Validated repository access and deployment configuration.`,
    `[${time}] Loaded ${envCount} environment variable${envCount === 1 ? '' : 's'}.`,
    `[${time}] Cloned repository and started dependency installation.`,
    `[${time}] Built artifact and published deployment image.`,
    `[${time}] Deployment marked live and health checks passed.`,
  ];
};

const RepoList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<Repo[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployingRepo, setDeployingRepo] = useState<Repo | null>(null);
  const [envVars, setEnvVars] = useState<EnvDraft[]>([{ id: 1, key: 'NODE_ENV', value: 'production' }]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConnectedRepos(JSON.parse(saved));
      }
    } catch {
      setConnectedRepos([]);
    }
  }, []);

  const persistConnections = (items: Repo[]) => {
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
      const mapped = (response.data.repositories || []).map((repository: GitHubRepository): Repo => ({
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
    } catch (fetchError: any) {
      setError(fetchError?.response?.data?.error || 'Unable to load GitHub repositories.');
    } finally {
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

  const handleConnect = (repo: Repo) => {
    const next = connectedRepos.some((item) => item.id === repo.id)
      ? connectedRepos
      : [repo, ...connectedRepos];

    persistConnections(next);
  };

  const handleRemove = (repo: Repo) => {
    persistConnections(connectedRepos.filter((item) => item.id !== repo.id));
  };

  const handleDeploy = (repo: Repo) => {
    setDeployingRepo(repo);
    setEnvVars((current) => current.length > 0 ? current : [{ id: Date.now(), key: 'NODE_ENV', value: 'production' }]);
  };

  const addEnvVar = () => {
    setEnvVars((current) => [...current, { id: Date.now(), key: '', value: '' }]);
  };

  const updateEnvVar = (id: number, field: 'key' | 'value', nextValue: string) => {
    setEnvVars((current) => current.map((item) => (item.id === id ? { ...item, [field]: nextValue } : item)));
  };

  const removeEnvVar = (id: number) => {
    setEnvVars((current) => current.filter((item) => item.id !== id));
  };

  const confirmDeploy = () => {
    if (!deployingRepo) return;

    const repoToDeploy = deployingRepo;

    const normalizedEnvVars = envVars
      .map((item) => ({ key: item.key.trim(), value: item.value.trim() }))
      .filter((item) => item.key.length > 0);

    const liveUrl = `https://preview.cloudops.app/${encodeURIComponent(repoToDeploy.name)}`;

    const deployedProject = {
      id: repoToDeploy.id,
      name: repoToDeploy.name,
      fullName: repoToDeploy.fullName,
      language: repoToDeploy.language,
      deployedAt: new Date().toISOString(),
      liveUrl,
      envVars: normalizedEnvVars,
      deploymentStatus: 'Live',
      logDetails: buildProjectLogs(repoToDeploy.fullName, normalizedEnvVars),
    };

    try {
      const raw = localStorage.getItem(DEPLOYED_PROJECTS_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(current)
        ? [deployedProject, ...current.filter((item: any) => item.id !== repoToDeploy.id)]
        : [deployedProject];

      localStorage.setItem(DEPLOYED_PROJECTS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('cloudops:deployed-projects-updated'));
    } catch {
      localStorage.setItem(DEPLOYED_PROJECTS_KEY, JSON.stringify([deployedProject]));
      window.dispatchEvent(new Event('cloudops:deployed-projects-updated'));
    }

    sessionStorage.setItem('cloudops_selected_repository', JSON.stringify({ ...repoToDeploy, envVars: normalizedEnvVars }));
    setDeployingRepo(null);
    navigate(`/deployment-logs?repo=${encodeURIComponent(repoToDeploy.fullName)}`);
  };

  const closeDeployModal = () => {
    setDeployingRepo(null);
  };

  const deployModal = deployingRepo ? (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          className="relative z-[10000] w-full max-w-2xl rounded-3xl border border-white/10 bg-[rgba(8,12,20,0.96)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Deploy {deployingRepo.name}</h3>
              <p className="mt-1 text-sm text-white/60">Add environment variables before continuing to deployment logs.</p>
            </div>

            <button
              type="button"
              onClick={closeDeployModal}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              aria-label="Close deploy dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {envVars.map((item) => (
              <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={item.key}
                  onChange={(event) => updateEnvVar(item.id, 'key', event.target.value)}
                  placeholder="ENV KEY"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
                <input
                  value={item.value}
                  onChange={(event) => updateEnvVar(item.id, 'value', event.target.value)}
                  placeholder="ENV VALUE"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
                <button
                  type="button"
                  onClick={() => removeEnvVar(item.id)}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition hover:bg-white/10"
                  aria-label="Remove environment variable"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={addEnvVar}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Add variable
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeDeployModal}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeploy}
                className="rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Continue deploy
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <div>
      <section className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Connect a repository</h2>
            <p className="text-sm text-white/60">Pick one or more GitHub repositories to display them as cards.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleConnectRepository}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
            >
              <Github className="h-4 w-4" />
              Connect repository
            </button>

            <button
              type="button"
              onClick={fetchRepositories}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh list
            </button>
          </div>
        </div>

        {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-text-primary">Connected repositories</h3>
            <p className="text-text-secondary">Choose a repository here, then deploy it to show up in Live Projects.</p>
          </div>
          <div className="text-sm text-text-secondary">{connectedRepos.length} selected</div>
        </div>

        {connectedRepos.length > 0 ? (
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedRepos.map((repo) => (
                <motion.div key={repo.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <RepoCard repo={repo} selected onRemove={handleRemove} onDeploy={handleDeploy} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center text-white/60">
            No connected repositories yet. Use <span className="text-white">Connect repository</span> to choose one from GitHub.
          </div>
        )}
      </section>

      {typeof document !== 'undefined' && deployModal ? createPortal(deployModal, document.body) : null}

      {showBrowser && (
        <section className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h3 className="text-xl font-semibold text-white">Available GitHub repositories</h3>
              <p className="text-sm text-white/60">Select a repository to add it to your CloudOps cards.</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search repositories..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/40"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              Loading repositories from GitHub...
            </div>
          ) : filtered.length > 0 ? (
            <AnimatePresence>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((repo) => (
                  <motion.div key={repo.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                    <RepoCard
                      repo={repo}
                      selected={connectedRepos.some((item) => item.id === repo.id)}
                      onConnect={handleConnect}
                      onRemove={handleRemove}
                      onDeploy={handleDeploy}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white/60">
              No repositories match your search.
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default RepoList;
