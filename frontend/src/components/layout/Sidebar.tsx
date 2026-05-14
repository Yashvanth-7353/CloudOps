import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, CreditCard, Settings, Rocket, Layers3, Cloud, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/dashboard' },
  { key: 'deployments', label: 'Deployments', icon: <Layers3 className="w-5 h-5" />, href: '/deployments' },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
  { key: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" />, href: '/billing' },
  { key: 'environment-variables', label: 'Environment Variables', icon: <Database className="w-5 h-5" />, href: '/environment-variables' },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' },
];

const Sidebar: React.FC<{
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}> = ({ collapsed = false, onCollapse }) => {
  const liveProjectsHref = '/live-projects';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="relative h-full z-20 bg-[rgba(19,26,42,0.6)] backdrop-blur-md border-r border-[#0a3f78]/70 overflow-hidden"
    >
      {collapsed && (
        <div className="group absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-1/2">
          <div className="absolute right-7 top-1/2 h-[2px] w-7 -translate-y-1/2 bg-[rgba(26,46,78,0.85)] transition-colors group-hover:bg-[#0a3f78]" />
          <button
            type="button"
            onClick={() => onCollapse && onCollapse(false)}
            aria-label="Expand sidebar"
            className="relative rounded-r-lg border border-white/10 bg-[rgba(6,26,56,0.98)] px-3 py-2 text-sm font-semibold text-white/90 transition transform hover:scale-110"
          >
            &gt;&gt;
          </button>
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="px-4 py-5 flex items-center gap-3">
          <Link
            to="/"
            className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            aria-label="Go to home page"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/25 to-accent/25 text-primary">
              <Cloud className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-base font-semibold text-white">CloudOps</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Deploy Smart</div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <div className="ml-3 text-xs text-white/60">v1.0.0</div>
          )}
          <div className="ml-auto">
            <button
              aria-label="Toggle sidebar"
              className="p-2 rounded hover:bg-white/5"
              onClick={() => onCollapse && onCollapse(!collapsed)}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-4 flex-1 overflow-auto px-2">
          <ul className="flex flex-col gap-1">
            {navItems.map(item => (
              <li key={item.key}>
                <Link
                  to={item.href || '/'}
                  className={`group flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-white/3 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <span className="text-accent">{item.icon}</span>
                  {!collapsed && <span className="text-white/90">{item.label}</span>}
                </Link>
              </li>
            ))}

            <li>
              <Link
                to={liveProjectsHref}
                className={`group flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-white/3 ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <span className="text-cyan-300">
                  <Rocket className="w-5 h-5" />
                </span>
                {!collapsed && <span className="text-white/90">Live Projects</span>}
              </Link>
            </li>
          </ul>
        </nav>

        
      </div>
    </motion.aside>
  );
};

export default Sidebar;
