import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, UserCircle2 } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';

type ProfileSettingsValue = {
  name: string;
  email: string;
};

const DEFAULT_PROFILE: ProfileSettingsValue = {
  name: 'Avery Carter',
  email: 'avery@cloudops.dev',
};

const ProfileSettings: React.FC = () => {
  const [name, setName] = useState(() => readStoredValue(SETTINGS_KEYS.PROFILE, DEFAULT_PROFILE).name);
  const [email, setEmail] = useState(() => readStoredValue(SETTINGS_KEYS.PROFILE, DEFAULT_PROFILE).email);
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    writeStoredValue(SETTINGS_KEYS.PROFILE, { name, email });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Profile settings</h2>
          <p className="text-sm text-white/60">Manage your personal account details.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-cyan-300">
          <UserCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveProfile}
            className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Email address</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={saveProfile}
            className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <button
          type="button"
          onClick={saveProfile}
          className="rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
        >
          Save profile
        </button>

        {saved && <div className="text-sm text-emerald-200">Profile saved.</div>}

        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <BadgeCheck className="h-4 w-4" />
          Profile synced with GitHub and CloudOps workspace.
        </div>
      </div>
    </motion.section>
  );
};

export default ProfileSettings;
