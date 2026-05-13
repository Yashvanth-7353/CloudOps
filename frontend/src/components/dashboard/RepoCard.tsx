import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Lock, CalendarClock, CheckCircle2, PlugZap, Rocket } from 'lucide-react';

export type Repo = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  htmlUrl: string;
  cloneUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
};

const RepoCard: React.FC<{
  repo: Repo;
  selected?: boolean;
  onConnect?: (repo: Repo) => void;
  onRemove?: (repo: Repo) => void;
  onDeploy?: (repo: Repo) => void;
}> = ({ repo, selected = false, onConnect, onRemove, onDeploy }) => {
  return (
    <motion.article
      layout
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(2,6,23,0.6)' }}
      className="relative rounded-xl p-4 bg-[rgba(12,16,26,0.6)] border border-white/6 backdrop-blur-md hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-primary to-accent text-white">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/95">{repo.name}</h3>
            <p className="text-xs text-white/60">{repo.fullName}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`rounded-full px-3 py-1 text-xs ${selected ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-white/65'}`}>
            {selected ? 'Connected' : 'Available'}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/55">
            {repo.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {repo.isPrivate ? 'Private repo' : 'Public repo'}
          </div>
        </div>
      </div>

      <p className="mt-4 min-h-[3rem] text-sm text-white/70 line-clamp-3">
        {repo.description || 'No description provided by the repository owner.'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
          <PlugZap className="h-3.5 w-3.5 text-cyan-300" />
          {repo.language || 'Repository'}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
          <CalendarClock className="h-3.5 w-3.5 text-cyan-300" />
          Updated {new Date(repo.updatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-cyan-200 hover:text-cyan-100 transition"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open on GitHub
        </a>

        <div className="flex items-center gap-2">
          {selected ? (
            <>
              <button
                type="button"
                onClick={() => onRemove?.(repo)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-white/6 text-white/85 hover:bg-white/10 transition"
              >
                Remove
              </button>

              <button
                type="button"
                onClick={() => onDeploy?.(repo)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20 transition"
              >
                <Rocket className="h-4 w-4" />
                Deploy
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConnect?.(repo)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20 transition"
            >
              Connect repo
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default RepoCard;
