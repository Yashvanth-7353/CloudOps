import React, { useEffect, useMemo, useState } from 'react';
import RepoCard, { Repo } from './RepoCard';
import { motion, AnimatePresence } from 'framer-motion';
import { githubService, GitHubRepository } from '@/services/github-service';
import { useAuth } from '@/app/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { Github, Loader2, Search } from 'lucide-react';

const STORAGE_KEY = 'cloudops_connected_repositories';

const RepoList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<Repo[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const owner = repo.fullName.split('/')[0];
    navigate(`/deploy/${owner}/${repo.name}`);
  };

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
          </div>
        </div>

        {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-text-primary">Connected repositories</h3>
            <p className="text-text-secondary">Deploy frontends with one click — build dist files and go live, no Docker required.</p>
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