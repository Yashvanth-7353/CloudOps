import React from 'react';
import { DashboardLayout } from '@/components/layout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import GitHubIntegration from '@/components/settings/GitHubIntegration';
import AWSCredentials from '@/components/settings/AWSCredentials';
import EnvVariables from '@/components/settings/EnvVariables';
import Notifications from '@/components/settings/Notifications';
import TeamSettings from '@/components/settings/TeamSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';

export default function SettingsPage(){
  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/60">Manage account, integrations, security, and team settings.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileSettings />
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
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">3 connected</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'cloudops-web', branch: 'main', status: 'Production' },
                { name: 'platform-api', branch: 'release', status: 'Staging' },
                { name: 'infra-modules', branch: 'main', status: 'Protected' },
              ].map((repo) => (
                <div key={repo.name} className="rounded-xl border border-white/8 bg-white/5 px-4 py-4">
                  <div className="text-white font-medium">{repo.name}</div>
                  <div className="mt-1 text-sm text-white/60">Branch: {repo.branch}</div>
                  <div className="mt-3 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">{repo.status}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
