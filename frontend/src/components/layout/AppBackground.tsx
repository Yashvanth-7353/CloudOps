import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const AppBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 -z-10',
        isDark ? 'bg-background' : 'bg-[hsl(220_14%_98%)]'
      )}
    >
      {/* Subtle grid — visible in both themes */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(hsl(215 28% 14% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(215 28% 14% / 0.5) 1px, transparent 1px)'
            : 'linear-gradient(hsl(220 13% 91%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 13% 91%) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }}
      />
      {isDark && (
        <div className="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      )}
    </div>
  );
};

export default AppBackground;
