import React from 'react';
import { motion } from 'framer-motion';

const LiveProgressBar: React.FC<{ steps: string[]; current: number; progress: number }> = ({ steps, current, progress }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <div>{steps[current] || 'Starting...'}</div>
        <div>{Math.round(progress)}%</div>
      </div>

      <div className="w-full bg-white/6 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-3 bg-gradient-to-r from-primary to-accent shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ ease: 'easeInOut', duration: 0.6 }}
        />
      </div>

      <div className="flex gap-2 items-center justify-between mt-2 text-xs text-white/60">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center ${i === current ? 'text-white' : 'text-white/50'}`}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveProgressBar;
