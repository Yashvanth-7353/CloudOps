import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const AWSCredentials: React.FC = () => {
  const [showKey, setShowKey] = useState(false);
  const masked = showKey ? 'AKIA-EXAMPLE-KEY-1234' : '••••••••••••••••••••';

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
        <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm tracking-wide text-white/90">
          {masked}
        </div>

        <button
          type="button"
          onClick={() => setShowKey((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showKey ? 'Hide key' : 'Reveal key'}
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <ShieldAlert className="h-4 w-4" />
          Keys are stored encrypted and never shown in plain text by default.
        </div>
      </div>
    </motion.section>
  );
};

export default AWSCredentials;
