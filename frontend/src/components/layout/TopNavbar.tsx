import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';

const TopNavbar: React.FC<{ onToggleMobileSidebar?: () => void }> = ({ onToggleMobileSidebar }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userInitial =
    user?.username?.[0]?.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    user?.login?.[0]?.toUpperCase() ||
    'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full border-b border-white/6 bg-[rgba(10,14,24,0.4)] backdrop-blur-md">
      <div className="max-w-full mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={onToggleMobileSidebar} className="p-2 rounded-lg hover:bg-white/3">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center flex-1">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/70" />
            </div>
            <input
              placeholder="Search deployments, services..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 placeholder-white/50 text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/3 relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white/20" />
          </button>

          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-semibold">{userInitial}</div>
              <div className="hidden md:block text-sm text-white/90">{user?.username || user?.name || 'User'}</div>
            </button>

            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-44 bg-[rgba(12,16,26,0.85)] border border-white/6 backdrop-blur-md rounded-lg shadow-lg overflow-hidden"
              >
                <ul className="py-1">
                  <li>
                    <a href="/profile" className="block px-3 py-2 text-sm hover:bg-white/3">Profile</a>
                  </li>
                  <li>
                    <a href="/settings" className="block px-3 py-2 text-sm hover:bg-white/3">Settings</a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-white/3"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
