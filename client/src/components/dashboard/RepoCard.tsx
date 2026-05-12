import React from 'react';
import { motion } from 'framer-motion';
import { Github, Play } from 'lucide-react';

export type Repo = {
  id: string;
  name: string;
  framework: string;
  updatedAt: string; // ISO
  status: 'idle' | 'deploying' | 'success' | 'failed';
};

const statusColor = (s: Repo['status']) => {
  switch (s) {
    case 'deploying':
      return 'bg-yellow-400/90';
    case 'success':
      return 'bg-green-400/90';
    case 'failed':
      return 'bg-rose-400/90';
    default:
      return 'bg-white/10';
  }
};

const RepoCard: React.FC<{ repo: Repo; onDeploy?: (id: string) => void }> = ({ repo, onDeploy }) => {
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
            <p className="text-xs text-white/60">{repo.framework}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`w-3.5 h-3.5 rounded-full ${statusColor(repo.status)}`} />
          <button
            onClick={() => onDeploy && onDeploy(repo.id)}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-white/6 hover:bg-white/8 transition"
          >
            <Play className="w-4 h-4" />
            Deploy
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/60">
        <div>Updated {new Date(repo.updatedAt).toLocaleString()}</div>
        <div className="text-xs">Status: <span className="text-white/85 font-medium">{repo.status}</span></div>
      </div>
    </motion.article>
  );
};

export default RepoCard;
