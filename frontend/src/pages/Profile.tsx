import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { axiosClient } from '@/services/api/axios-client';

interface ProfileData {
  username: string;
  email: string | null;
  avatar: string | null;
  createdAt: string | null;
  totalDeployments: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient.get('/api/users/profile')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <DashboardLayout>
      <main className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-1">Profile</h1>
          <p className="text-white/60">Your GitHub account details and deployment stats.</p>
        </motion.div>

        {loading && <div className="text-white/50">Loading profile…</div>}
        {error && <div className="text-rose-400">{error}</div>}

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-6 shadow-[0_20px_60px_rgba(2,6,23,0.35)]"
          >
            <div className="flex items-center gap-5 mb-8">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-20 h-20 rounded-full border-2 border-cyan-400/40" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                  {profile.username?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                {profile.email && <p className="text-white/60 text-sm mt-0.5">{profile.email}</p>}
                <p className="text-white/40 text-xs mt-1">Member since {memberSince}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/8 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Total Deployments</p>
                <p className="text-3xl font-bold text-cyan-300">{profile.totalDeployments}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1">GitHub Username</p>
                <p className="text-xl font-semibold text-white">@{profile.username}</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </DashboardLayout>
  );
}
