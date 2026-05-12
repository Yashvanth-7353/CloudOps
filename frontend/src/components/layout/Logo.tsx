/**
 * Logo Component
 * CloudOps brand logo with animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <motion.a
      href="/"
      className="flex items-center gap-md"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="logo-icon"
        whileHover={{ rotate: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className="relative">
          <Cloud
            size={28}
            color="#6C63FF"
            fill="#6C63FF"
            strokeWidth={1.5}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(108, 99, 255, 0.3), transparent)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      <div className="logo-text">
        <span className="logo-title">CloudOps</span>
        <span className="logo-subtitle">Deploy Smart</span>
      </div>
    </motion.a>
  );
};

export default Logo;
