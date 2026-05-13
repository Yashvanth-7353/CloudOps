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

type ConnectedRepository = {
  id: string;
  name: string;
  fullName: string;
  language?: string | null;
};

export default function SettingsPage(){
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectedRepos, setConnectedRepos] = React.useState<ConnectedRepository[]>(() => readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []));
  const tabParam = (searchParams.get('tab') || '').toLowerCase();
  const activeTab = tabParam === 'profile' ? 'profile' : 'settings';
  const showProfileOnly = activeTab === 'profile';

  React.useEffect(() => {
    const sync = () => setConnectedRepos(readStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, []));
    window.addEventListener('storage', sync);
    window.addEventListener('cloudops:connected-repositories-updated', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cloudops:connected-repositories-updated', sync as EventListener);
    };
  }, []);

  const removeRepository = (id: string) => {
    const next = connectedRepos.filter((repo) => repo.id !== id);
    setConnectedRepos(next);
    writeStoredValue(STORAGE_KEYS.CONNECTED_REPOSITORIES, next);
    window.dispatchEvent(new Event('cloudops:connected-repositories-updated'));
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
