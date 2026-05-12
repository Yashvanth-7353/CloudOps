import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type FeedbackTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

const toneStyles: Record<FeedbackTone, { ring: string; accent: string; glow: string }> = {
  neutral: { ring: 'border-white/8', accent: 'text-cyan-200', glow: 'shadow-[0_20px_80px_rgba(2,132,199,0.12)]' },
  success: { ring: 'border-emerald-400/15', accent: 'text-emerald-200', glow: 'shadow-[0_20px_80px_rgba(16,185,129,0.12)]' },
  warning: { ring: 'border-amber-400/15', accent: 'text-amber-200', glow: 'shadow-[0_20px_80px_rgba(245,158,11,0.12)]' },
  error: { ring: 'border-rose-400/15', accent: 'text-rose-200', glow: 'shadow-[0_20px_80px_rgba(244,63,94,0.14)]' },
  info: { ring: 'border-sky-400/15', accent: 'text-sky-200', glow: 'shadow-[0_20px_80px_rgba(14,165,233,0.12)]' },
};

export interface FeedbackAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
}

export interface FeedbackStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: FeedbackAction[];
  tone?: FeedbackTone;
  illustration?: React.ReactNode;
  className?: string;
}

const FeedbackState: React.FC<FeedbackStateProps> = ({
  title,
  description,
  icon: Icon,
  actions = [],
  tone = 'neutral',
  illustration,
  className = '',
}) => {
  const styles = toneStyles[tone];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-3xl border ${styles.ring} ${styles.glow} bg-[rgba(10,14,24,0.72)] backdrop-blur-md px-5 py-7 sm:px-6 sm:py-8 ${className}`}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/5 ${styles.accent}`}>
          <Icon className="h-7 w-7" />
        </div>

        <div className="mt-5">{illustration}</div>

        <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/65 sm:text-base">{description}</p>

        {actions.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => {
              const base = 'inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30';
              const variant = action.variant === 'secondary'
                ? 'border border-white/10 bg-white/5 text-white/85 hover:bg-white/10'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_18px_40px_rgba(14,165,233,0.18)] hover:brightness-110';

              if (action.href) {
                return (
                  <a key={action.label} href={action.href} className={`${base} ${variant}`}>
                    {action.label}
                  </a>
                );
              }

              return (
                <button key={action.label} type="button" onClick={action.onClick} className={`${base} ${variant}`}>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default FeedbackState;
