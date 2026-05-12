import React from 'react';
import { motion } from 'framer-motion';

const AppBackground: React.FC = () => {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="app-grid-overlay" />
      <motion.div
        className="app-orb app-orb--primary"
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="app-orb app-orb--accent"
        animate={{ y: [0, 14, 0], x: [0, -12, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="app-orb app-orb--success"
        animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(0,212,255,0.08),transparent_28%),linear-gradient(180deg,rgba(11,16,32,0.16),rgba(11,16,32,0.82))]" />
    </div>
  );
};

export default AppBackground;
