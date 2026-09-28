import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  Plus,
  Search,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Settings,
  Menu,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenAddModal: () => void;
  onToggleSidebar?: () => void;
  onSelectAssignment?: (assignmentId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onToggleSidebar,
  onSelectAssignment,
}) => {
  const { user, profile, signOut } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut 'N' to open Add Assignment modal (unless typing in input/textarea/select)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        onOpenAddModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddModal]);

  // Click outside listener for user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left: Mobile Toggle & Title/Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Shortcut or Link to /assignments */}
        <button
          type="button"
          onClick={() => navigate('/assignments')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors w-48 md:w-64"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="truncate">Search tasks & subjects...</span>
        </button>
      </div>

      {/* Right: Actions (Quick Add + Notifications + Theme + Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* + Add Assignment Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm hover:shadow transition-all"
          title="Add Assignment (Shortcut: N)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Task</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-brand-700/60 rounded text-brand-100">
            N
          </kbd>
        </button>

        {/* Notification Bell */}
        <NotificationBell onSelectAssignment={onSelectAssignment} />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Theme: ${theme} (Click to toggle)`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-200 dark:border-brand-800">
              {(
                profile?.full_name ||
                user?.user_metadata?.full_name ||
                user?.email ||
                'U'
              )[0].toUpperCase()}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {profile?.full_name ||
                user?.user_metadata?.full_name ||
                (user?.email ? user.email.split('@')[0] : 'Student')}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || 'Academic Student'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings & Preferences
                </Link>

                <div className="px-4 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2.5">
                    <Laptop className="w-4 h-4 text-slate-400" /> Theme
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-1.5 py-0.5 rounded ${
                        theme === 'light' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : ''
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-1.5 py-0.5 rounded ${
                        theme === 'dark' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : ''
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`px-1.5 py-0.5 rounded ${
                        theme === 'system' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : ''
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
