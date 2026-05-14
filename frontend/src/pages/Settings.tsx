import React, { useEffect, useState } from 'react';
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
import { axiosClient } from '@/services/api/axios-client';
import { Eye, EyeOff, Plus, Trash2, Webhook } from 'lucide-react';

type ConnectedRepository = { id: string; name: string; fullName: string; language?: string | null };
type EnvVar = { key: string; value: string };

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-emerald-500/80' : 'bg-white/15'}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
  </button>
);

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectedRepos, setConnectedRepos] = React.useState<ConnectedRepository[]>(() =>
    readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, [])
  );
  const tabParam = (searchParams.get('tab') || '').toLowerCase();
  const activeTab = tabParam === 'profile' ? 'profile' : 'settings';
  const showProfileOnly = activeTab === 'profile';

  // Webhook state
  const [webhookId, setWebhookId] = useState<string>('');
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState(false);

  // Build notifications
  const [buildNotifications, setBuildNotifications] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  // Global env vars
  const [globalEnvVars, setGlobalEnvVars] = useState<EnvVar[]>(() =>
    readStoredValue('cloudops_global_env_vars', [])
  );
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  React.useEffect(() => {
    const sync = () => setConnectedRepos(readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []));
    window.addEventListener('storage', sync);
    window.addEventListener('cloudops:connected-repositories-updated', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cloudops:connected-repositories-updated', sync as EventListener);
    };
  }, []);

  useEffect(() => {
    axiosClient.get('/api/users/settings')
      .then((res) => {
        const s = res.data.settings || {};
        if (typeof s.notificationsEnabled === 'boolean') setBuildNotifications(s.notificationsEnabled);
      })
      .catch(() => {});

    // Load webhook info from first connected project if available
    const repos = readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []) as ConnectedRepository[];
    if (repos.length > 0) {
      setWebhookId((repos[0] as any).githubWebhookId || '');
      setWebhookSecret((repos[0] as any).webhookSecret || '');
    }
  }, []);

  const removeRepository = (id: string) => {
    const next = connectedRepos.filter((repo) => repo.id !== id);
    setConnectedRepos(next);
    writeStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, next);
    window.dispatchEvent(new Event('cloudops:connected-repositories-updated'));
  };

  const handleBuildNotifToggle = async (val: boolean) => {
    setBuildNotifications(val);
    setSavingNotif(true);
    try {
      await axiosClient.patch('/api/users/settings', { notificationsEnabled: val });
    } catch {
      // silently fail
    } finally {
      setSavingNotif(false);
    }
  };

  const addEnvVar = () => {
    if (!newKey.trim()) return;
    const next = [...globalEnvVars, { key: newKey.trim(), value: newValue }];
    setGlobalEnvVars(next);
    writeStoredValue('cloudops_global_env_vars', next);
    setNewKey('');
    setNewValue('');
  };

  const removeEnvVar = (index: number) => {
    const next = globalEnvVars.filter((_, i) => i !== index);
    setGlobalEnvVars(next);
    writeStoredValue('cloudops_global_env_vars', next);
  };

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/60">Manage account, integrations, security, and team settings.</p>
          </div>

          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`rounded-lg px-4 py-2 text-sm transition ${activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'settings' })}
              className={`rounded-lg px-4 py-2 text-sm transition ${activeTab === 'settings' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              Settings
            </button>
          </div>

          {showProfileOnly ? (
            <div className="grid grid-cols-1 gap-6">
              <ProfileSettings />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GitHubIntegration />
                <AWSCredentials />
                <EnvVariables />
                <Notifications />
                <TeamSettings />
                <SecuritySettings />
              </div>

              {/* Webhook Configuration */}
              <section className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-cyan-300">
                    <Webhook className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Webhook configuration</h2>
                    <p className="text-sm text-white/60">GitHub webhook details for your connected projects.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Webhook ID</span>
                    <input
                      readOnly
                      value={webhookId || 'Not configured'}
                      className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white/80 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Webhook secret</span>
                    <div className="relative">
                      <input
                        readOnly
                        type={showSecret ? 'text' : 'password'}
                        value={webhookSecret || 'Not configured'}
                        className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 pr-12 text-white/80 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Build Notifications toggle */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-white/85">Build notifications</p>
                    <p className="text-xs text-white/40">Receive alerts when deployments complete or fail.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingNotif && <span className="text-xs text-white/40">Saving…</span>}
                    <Toggle checked={buildNotifications} onChange={handleBuildNotifToggle} />
                  </div>
                </div>
              </section>

              {/* Global Environment Variables */}
              <section className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Global environment variables</h2>
                    <p className="text-sm text-white/60">Key-value pairs available across all projects.</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{globalEnvVars.length} vars</div>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="KEY"
                    className="flex-1 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
                  />
                  <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="value"
                    className="flex-1 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
                  />
                  <button
                    type="button"
                    onClick={addEnvVar}
                    className="flex items-center gap-1 rounded-xl bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-500/25 transition"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>

                {globalEnvVars.length > 0 ? (
                  <div className="space-y-2">
                    {globalEnvVars.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-2">
                        <span className="text-sm font-mono text-cyan-300 min-w-[120px]">{v.key}</span>
                        <span className="text-sm text-white/60 flex-1 truncate">{v.value}</span>
                        <button type="button" onClick={() => removeEnvVar(i)} className="text-white/30 hover:text-rose-400 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                    No global environment variables yet.
                  </div>
                )}
              </section>

              {/* Connected repositories */}
              <section className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Connected repositories</h2>
                    <p className="text-sm text-white/60">Repositories linked to your CloudOps workspace.</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{connectedRepos.length} connected</div>
                </div>

                {connectedRepos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {connectedRepos.map((repo) => (
                      <div key={repo.id} className="rounded-xl border border-white/8 bg-white/5 px-4 py-4">
                        <div className="text-white font-medium">{repo.name}</div>
                        <div className="mt-1 text-sm text-white/60">{repo.fullName}</div>
                        <div className="mt-3 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                          {repo.language || 'Connected'}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRepository(repo.id)}
                          className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                        >
                          Remove connection
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                    No connected repositories yet.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
