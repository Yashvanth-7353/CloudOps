import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';

type SecuritySettingsValue = {
  mfa: boolean;
  deployApproval: boolean;
};

const DEFAULT_SECURITY: SecuritySettingsValue = {
  mfa: true,
  deployApproval: true,
};

const SecuritySettings: React.FC = () => {
  const stored = readStoredValue(SETTINGS_KEYS.SECURITY, DEFAULT_SECURITY);
  const [mfa, setMfa] = useState(stored.mfa);
  const [deployApproval, setDeployApproval] = useState(stored.deployApproval);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-cyan-500/80' : 'bg-white/15'}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  const persist = (next: SecuritySettingsValue) => {
    setMfa(next.mfa);
    setDeployApproval(next.deployApproval);
    writeStoredValue(SETTINGS_KEYS.SECURITY, next);
  };

  return (
    <motion.section whileHover={{ y: -4 }} className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Security settings</h2>
          <p className="text-sm text-white/60">Protect deployments and account access.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
          <div className="text-sm text-white/85">
            <div>Multi-factor authentication</div>
            <div className="text-white/60">Required for all team members</div>
          </div>
          <Toggle checked={mfa} onChange={(value) => persist({ mfa: value, deployApproval })} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
          <div className="text-sm text-white/85">
            <div>Deployment approval required</div>
            <div className="text-white/60">Manual approval before production pushes</div>
          </div>
          <Toggle checked={deployApproval} onChange={(value) => persist({ mfa, deployApproval: value })} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70">
          <LockKeyhole className="h-4 w-4 text-cyan-300" />
          Secrets are encrypted at rest and audited on change.
        </div>
      </div>
    </motion.section>
  );
};

export default SecuritySettings;
