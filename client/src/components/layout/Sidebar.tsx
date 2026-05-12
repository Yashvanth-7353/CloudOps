import React from 'react';
import { motion } from 'framer-motion';
import { Home, Box, BarChart3, CreditCard, Settings } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/dashboard' },
  { key: 'deployments', label: 'Deployments', icon: <Box className="w-5 h-5" />, href: '/deployments' },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
  { key: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" />, href: '/billing' },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' },
];

const Sidebar: React.FC<{
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}> = ({ collapsed = false, onCollapse }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="relative h-full z-20 bg-[rgba(19,26,42,0.6)] backdrop-blur-md border-r border-white/6 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        <div className="px-4 py-6 flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">CO</div>
          </div>
          {!collapsed && <div className="text-lg font-semibold">CloudOps</div>}
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
                <a
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-white/3 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <span className="text-accent">{item.icon}</span>
                  {!collapsed && <span className="text-white/90">{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 py-4">
          <div className="text-xs text-white/60 text-center">v1.0.0</div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
