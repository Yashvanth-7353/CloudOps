import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Link2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/lib/constants';
import { readStoredValue, SETTINGS_KEYS, writeStoredValue } from './settings-storage';

type GitHubSettingsValue = {
  connected: boolean;
  account: string;
};

const DEFAULT_GITHUB: GitHubSettingsValue = {
  connected: true,
  account: 'cloudops/platform-infra',
};

const GitHubIntegration: React.FC = () => {
  const stored = readStoredValue(SETTINGS_KEYS.GITHUB, DEFAULT_GITHUB);
  const [connected, setConnected] = useState(stored.connected);
  const [account, setAccount] = useState(stored.account);

  const persist = (next: GitHubSettingsValue) => {
    setConnected(next.connected);
    setAccount(next.account);
    writeStoredValue(SETTINGS_KEYS.GITHUB, next);
  };

  const handleGitHubAction = () => {
    if (connected) {
      persist({ connected: false, account });
      return;
    }

    window.location.assign(`${API_BASE_URL}/api/auth/github`);
  };

  const handleSyncWithAuth = () => {
    const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    persist({ connected: isAuthenticated, account: isAuthenticated ? account : '' });
  };

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">GitHub integration</h2>
          <p className="text-sm text-white/60">Manage repository access and deployments.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-white">
          <Github className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/80">
          <div className="flex items-center gap-3">
            <Link2 className="h-4 w-4 text-cyan-300" />
            <span>{account || 'No GitHub account linked'}</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${connected ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleGitHubAction}
          className="w-full rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15"
        >
          {connected ? 'Disconnect GitHub' : 'Connect GitHub'}
        </button>

        <button
          type="button"
          onClick={handleSyncWithAuth}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          Sync with active login
        </button>

        <div className="flex items-center gap-3 text-sm text-white/60">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Scoped repository access with deployment-only permissions.
        </div>
      </div>
    </motion.section>
  );
};

export default GitHubIntegration;
