import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';

const TopNavbar: React.FC<{ onToggleMobileSidebar?: () => void }> = ({ onToggleMobileSidebar }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const avatarRef = useRef<HTMLButtonElement>(null);

  const userInitial =
    user?.username?.[0]?.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    user?.login?.[0]?.toUpperCase() ||
    'U';

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdown = document.getElementById('topnav-dropdown');
      if (
        avatarRef.current && !avatarRef.current.contains(target) &&
        dropdown && !dropdown.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  };

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="w-full border-b border-white/6 bg-[rgba(10,14,24,0.4)] backdrop-blur-md">
      <div className="max-w-full mx-auto px-4 py-3 flex items-center gap-4">

        <div className="flex items-center gap-3 md:hidden">
          <button onClick={onToggleMobileSidebar} className="p-2 rounded-lg hover:bg-white/5">
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
          <button className="p-2 rounded-lg hover:bg-white/5 relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white/20" />
          </button>

          <button
            ref={avatarRef}
            onClick={handleToggle}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-semibold">
              {userInitial}
            </div>
            <div className="hidden md:block text-sm text-white/90">
              {user?.username || user?.name || 'User'}
            </div>
          </button>
        </div>
      </div>

      {open && createPortal(
        <div
          id="topnav-dropdown"
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-[rgba(12,16,26,0.98)] border border-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
        >
          <ul className="py-1">
            <li>
              <button type="button" onClick={() => go('/profile')}
                className="w-full text-left px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                Profile
              </button>
            </li>
            <li>
              <button type="button" onClick={() => go('/settings')}
                className="w-full text-left px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                Settings
              </button>
            </li>
            <li>
              <button type="button" onClick={() => { setOpen(false); logout(); navigate('/login'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-white/10 hover:text-rose-300 transition-colors cursor-pointer">
                Sign out
              </button>
            </li>
          </ul>
        </div>,
        document.body
      )}
    </header>
  );
};

export default TopNavbar;
