import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';

type AwsSettingsValue = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

const DEFAULT_AWS: AwsSettingsValue = {
  accessKeyId: 'AKIA-EXAMPLE-KEY-1234',
  secretAccessKey: 'EXAMPLE-SECRET-KEY',
  region: 'us-east-1',
};

const AWSCredentials: React.FC = () => {
  const stored = readStoredValue(SETTINGS_KEYS.AWS, DEFAULT_AWS);
  const [accessKeyId, setAccessKeyId] = useState(stored.accessKeyId);
  const [secretAccessKey, setSecretAccessKey] = useState(stored.secretAccessKey);
  const [region, setRegion] = useState(stored.region);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const masked = showKey ? secretAccessKey : '••••••••••••••••••••';

  const saveCredentials = () => {
    writeStoredValue(SETTINGS_KEYS.AWS, { accessKeyId, secretAccessKey, region });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">AWS credentials</h2>
          <p className="text-sm text-white/60">Secure API key management for deployments.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-amber-200">
          <KeyRound className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/50">Access key ID</span>
          <input
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm tracking-wide text-white outline-none focus:border-amber-400/50"
          />
        </label>

        <label className="block space-y-2">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/50">Secret access key</span>
          <input
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            type={showKey ? 'text' : 'password'}
            className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm tracking-wide text-white outline-none focus:border-amber-400/50"
          />
        </label>

        <label className="block space-y-2">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/50">Region</span>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowKey((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKey ? 'Hide key' : 'Reveal key'}
          </button>

          <button
            type="button"
            onClick={saveCredentials}
            className="rounded-xl bg-amber-500/15 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            Save AWS credentials
          </button>
        </div>

        {saved && <div className="text-sm text-emerald-200">AWS credentials saved locally.</div>}

        <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <ShieldAlert className="h-4 w-4" />
          Keys are stored encrypted and never shown in plain text by default.
        </div>
      </div>
    </motion.section>
  );
};

export default AWSCredentials;
