import React from 'react';
import { motion } from 'framer-motion';

const LiveProgressBar: React.FC<{ steps: string[]; current: number; progress: number }> = ({ steps, current, progress }) => {
  const currentStep = steps[current] || 'Starting...';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <div>Current status</div>
        <div>{Math.round(progress)}%</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-sm font-medium text-white">{currentStep}</div>
      </div>

      <div className="w-full bg-white/6 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-3 bg-gradient-to-r from-primary to-accent shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ ease: 'easeInOut', duration: 0.6 }}
        />
      </div>
    </div>
  );
};

export default LiveProgressBar;
