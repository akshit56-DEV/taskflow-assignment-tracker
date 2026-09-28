import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/75 dark:bg-[#07090e]/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Left: Mobile Toggle & Title/Search */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Global Quick Search Shortcut or Link to /assignments */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => navigate('/assignments')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all w-48 md:w-64 shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search tasks & subjects...</span>
        </motion.button>
      </div>

      {/* Right: Actions (Quick Add + Notifications + Theme + Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* + Add Assignment Button */}
        <motion.button
          whileHover={{ scale: 1.03, translateY: -1 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:from-brand-800 active:to-indigo-800 rounded-xl shadow-md shadow-brand-500/20 transition-all"
          title="Add Assignment (Shortcut: N)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Task</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white/20 rounded text-white font-medium">
            N
          </kbd>
        </motion.button>

        {/* Notification Bell */}
        <NotificationBell onSelectAssignment={onSelectAssignment} />

        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title={`Theme: ${theme} (Click to toggle)`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {resolvedTheme === 'dark' ? (
              <motion.div
                key="dark"
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4 h-4 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4 text-slate-600" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
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
          </motion.button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Academic Student'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings & Preferences
                  </Link>

                  <div className="px-4 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-slate-400" /> Theme
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-[10px]">
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          theme === 'light' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          theme === 'dark' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          theme === 'system' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
