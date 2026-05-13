import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Lock, CalendarClock, CheckCircle2, PlugZap, Rocket, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { githubService } from '../../services/github-service'; 

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setFeedback(null); // Clear old messages
    
    try {
      const repositoryOwner = repo.fullName.split('/')[0];

      await githubService.connectRepository({
        repositoryName: repo.name,
        repositoryOwner: repositoryOwner,
        repositoryUrl: repo.htmlUrl, 
        isPrivate: repo.isPrivate,
        description: repo.description || undefined,
      });
      
      // Show success message!
      setFeedback({ type: 'success', message: 'Webhook created successfully!' });
      
      // Wait 1.5 seconds so the user can read the success message, then move the card
      setTimeout(() => {
        onConnect?.(repo);
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      setFeedback({ type: 'error', message: error.message || 'Failed to connect repo.' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    setFeedback(null);
    try {
      const repositoryOwner = repo.fullName.split('/')[0];
      
      // Call our new backend route
      await githubService.removeRepository(repositoryOwner, repo.name);
      
      setFeedback({ type: 'success', message: 'Repository disconnected successfully!' });
      
      // Wait a moment so they see the success message, then remove it from the UI
      setTimeout(() => {
        onRemove?.(repo);
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setFeedback({ type: 'error', message: error.message || 'Failed to disconnect repo.' });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <motion.article
      layout
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(2,6,23,0.6)' }}
      className="relative flex flex-col rounded-xl p-4 bg-[rgba(12,16,26,0.6)] border border-white/6 backdrop-blur-md hover:border-primary/40 transition-colors"
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

      {/* --- FEEDBACK MESSAGE AREA --- */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-3 flex items-center gap-2 text-xs rounded-md p-2 ${
              feedback.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
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
                onClick={handleRemove}
                disabled={isRemoving}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isRemoving 
                    ? 'bg-red-500/10 text-red-100/50 cursor-not-allowed' 
                    : 'bg-white/6 text-white/85 hover:bg-red-500/20 hover:text-red-200'
                }`}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
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
              onClick={handleConnect}
              disabled={isConnecting}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isConnecting 
                  ? 'bg-cyan-500/10 text-cyan-100/50 cursor-not-allowed' 
                  : 'bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20'
              }`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect repo'
              )}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default RepoCard;