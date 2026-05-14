/**
 * Deployment Pipeline Visualization - Styling Reference
 * 
 * This file documents all the custom styling patterns and color schemes
 * used in the Deployment Pipeline Visualization component suite.
 */

// Color Palette
const COLORS = {
  // Status colors
  success: {
    primary: '#10B981', // emerald-500
    light: 'rgb(16, 185, 129, 0.2)',
    glow: 'rgb(16, 185, 129, 0.3)',
    text: '#34D399', // emerald-400
  },
  error: {
    primary: '#EF4444', // red-500
    light: 'rgb(239, 68, 68, 0.2)',
    glow: 'rgb(239, 68, 68, 0.3)',
    text: '#F87171', // red-400
  },
  warning: {
    primary: '#F59E0B', // amber-500
    light: 'rgb(245, 158, 11, 0.2)',
    glow: 'rgb(245, 158, 11, 0.3)',
    text: '#FBBF24', // amber-400
  },
  info: {
    primary: '#3B82F6', // blue-500
    light: 'rgb(59, 130, 246, 0.2)',
    glow: 'rgb(59, 130, 246, 0.3)',
    text: '#60A5FA', // blue-400
  },
  active: {
    primary: '#06B6D4', // cyan-500
    light: 'rgb(6, 182, 212, 0.2)',
    glow: 'rgb(34, 211, 238, 0.5)',
    text: '#22D3EE', // cyan-400
  },
  pending: {
    primary: '#64748B', // slate-500
    light: 'rgb(100, 116, 139, 0.2)',
    glow: 'rgb(100, 116, 139, 0.2)',
    text: '#94A3B8', // slate-400
  },

  // Background colors
  bg: {
    primary: '#0F172A', // slate-900
    secondary: '#1E293B', // slate-800
    tertiary: 'rgb(30, 41, 59, 0.5)', // slate-800/50
    accent: 'rgb(15, 23, 42, 0.5)', // slate-900/50
  },

  // Text colors
  text: {
    primary: '#FFFFFF', // white
    secondary: '#E2E8F0', // slate-300
    tertiary: '#CBD5E1', // slate-400
    muted: '#94A3B8', // slate-400
    dim: '#64748B', // slate-500
  },

  // Border colors
  border: {
    primary: 'rgb(51, 65, 85, 0.5)', // slate-700/50
    secondary: 'rgb(51, 65, 85, 0.3)', // slate-700/30
    success: 'rgb(16, 185, 129, 0.3)', // emerald-500/30
    error: 'rgb(239, 68, 68, 0.3)', // red-500/30
    active: 'rgb(34, 211, 238, 0.5)', // cyan-500/50
  },
};

// Tailwind Class Reference
const TAILWIND_CLASSES = {
  // Status badges
  badges: {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    active: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },

  // Stage indicators
  stages: {
    success: 'bg-emerald-500/20 border-emerald-500',
    error: 'bg-red-500/20 border-red-500',
    warning: 'bg-amber-500/20 border-amber-500',
    active: 'bg-cyan-500/20 border-cyan-500',
    pending: 'bg-slate-500/20 border-slate-500',
  },

  // Icon colors
  icons: {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    active: 'text-cyan-400',
    pending: 'text-slate-400',
  },

  // Cards
  cards: {
    base: 'bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors',
    interactive: 'bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-colors',
    dark: 'bg-slate-900 border border-slate-700/50',
  },

  // Buttons
  buttons: {
    primary: 'px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-lg',
    success: 'px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-lg',
    error: 'px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg',
    warning: 'px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg',
    ghost: 'px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-lg hover:text-slate-200',
  },

  // Text utilities
  text: {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  },

  // Layout patterns
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
  },
};

// Animation Timing
const ANIMATIONS = {
  durations: {
    fast: 200,      // ms
    base: 500,      // ms
    slow: 1000,     // ms
    slower: 2000,   // ms
  },

  easing: {
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
    linear: 'linear',
    easeExpo: 'easeInOut',
  },

  transitions: {
    smooth: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-500 ease-out',
  },

  effects: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    glow: 'shadow-lg shadow-cyan-500/50',
  },
};

// Shadow Definitions
const SHADOWS = {
  glow: {
    emerald: 'shadow-lg shadow-emerald-500/30',
    red: 'shadow-lg shadow-red-500/30',
    cyan: 'shadow-lg shadow-cyan-500/50',
    blue: 'shadow-lg shadow-blue-500/30',
    purple: 'shadow-lg shadow-purple-500/30',
    amber: 'shadow-lg shadow-amber-500/30',
  },

  card: 'shadow-md shadow-black/50',
  hover: 'hover:shadow-lg hover:shadow-black/50',
};

// Responsive Breakpoints
const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific Styles

// Progress Ring (SVG)
const PROGRESS_RING_STYLES = {
  circumference: 2 * Math.PI * 28, // radius 28
  updateStrokeDashOffset: (percentage: number) => {
    const circumference = 2 * Math.PI * 28;
    return circumference * (1 - percentage / 100);
  },
};

// Log Entry Styles
const LOG_STYLES = {
  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(15, 23, 42, 0.5) 2px, rgba(15, 23, 42, 0.5) 4px)',
  fontFamily: 'font-mono',
  fontSize: 'text-xs',
  lineHeight: 'leading-[1.35]',
};

// Gradient Backgrounds
const GRADIENTS = {
  pipeline: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  progress: {
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    error: 'bg-gradient-to-r from-red-500 to-red-400',
    active: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  connector: {
    success: 'linear-gradient(to right, rgb(16, 185, 129), rgb(16, 185, 129))',
    active: 'linear-gradient(to right, rgb(16, 185, 129), rgb(34, 211, 238), rgb(100, 116, 139))',
    pending: 'linear-gradient(to right, rgb(100, 116, 139), rgb(100, 116, 139))',
  },
};

// Status Color Mappings
const STATUS_COLORS = {
  pending: {
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    indicator: 'bg-slate-500/20 border-slate-500',
    icon: 'text-slate-400',
    glow: 'shadow-lg shadow-slate-500/20',
  },
  'in-progress': {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    indicator: 'bg-cyan-500/20 border-cyan-500',
    icon: 'text-cyan-400',
    glow: 'shadow-lg shadow-cyan-500/50',
  },
  success: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    indicator: 'bg-emerald-500/20 border-emerald-500',
    icon: 'text-emerald-400',
    glow: 'shadow-lg shadow-emerald-500/30',
  },
  failed: {
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    indicator: 'bg-red-500/20 border-red-500',
    icon: 'text-red-400',
    glow: 'shadow-lg shadow-red-500/30',
  },
};

// Log Level Colors
const LOG_LEVEL_COLORS = {
  info: 'text-cyan-400',
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
};

// Export all styling configurations
export {
  COLORS,
  TAILWIND_CLASSES,
  ANIMATIONS,
  SHADOWS,
  BREAKPOINTS,
  PROGRESS_RING_STYLES,
  LOG_STYLES,
  GRADIENTS,
  STATUS_COLORS,
  LOG_LEVEL_COLORS,
};

/**
 * Usage Examples:
 * 
 * 1. Status Color Application:
 *    <div className={STATUS_COLORS[status].badge}> ... </div>
 * 
 * 2. Shadow Effects:
 *    style={{ boxShadow: `0 0 20px ${COLORS.success.glow}` }}
 * 
 * 3. Gradient Backgrounds:
 *    style={{ background: GRADIENTS.connector[status] }}
 * 
 * 4. Responsive Classes:
 *    className="hidden lg:flex md:grid-cols-2 lg:grid-cols-3"
 * 
 * 5. Animation Timing:
 *    transition={{ duration: ANIMATIONS.durations.base }}
 */
