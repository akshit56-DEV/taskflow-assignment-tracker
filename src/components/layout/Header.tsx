import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAssignments } from '@/context/AssignmentContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  Sun,
  Moon,
  Menu,
  AlarmClock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const { user, profile } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { stats } = useAssignments();
  const navigate = useNavigate();

  // Keyboard shortcut 'N' or '⌘K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        onOpenAddModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddModal]);

  const userDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Student');

  // Route-based breadcrumb
  const pathName = window.location.pathname.replace('/', '');
  const pageLabel = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-b border-[#E5E9F3] dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Toggle & Workspace Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-tf-muted hover:text-tf-deep hover:bg-tf-bg dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex lg:hidden items-center gap-2">
          <BrandLogo size="sm" showText={false} />
          <span className="font-semibold text-sm tracking-tight text-[#18223F] dark:text-white">
            TaskFlow
          </span>
        </div>

        {/* Figma Desktop Breadcrumb: Workspace / Page */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#66718C] dark:text-[#94A3B8]">
          <span className="font-medium text-[#939CB1] dark:text-slate-400">Workspace</span>
          <span>/</span>
          <span className="font-semibold text-[#18223F] dark:text-slate-100">{pageLabel}</span>
        </div>
      </div>

      {/* Right: Search, Urgency Pill, Notification Bell, Theme & Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Figma Search Input with ⌘ K */}
        <div
          onClick={() => {
            navigate('/assignments');
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F7FC] dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] text-xs text-[#939CB1] dark:text-slate-400 cursor-pointer hover:border-[#4355ED]/40 transition-colors"
        >
          <span>⌕</span>
          <span>Search anything…</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-800 rounded border border-[#E5E9F3] dark:border-slate-700 text-[#66718C] dark:text-slate-300">
            ⌘ K
          </kbd>
        </div>

        {/* Real-time Urgency Status Pill */}
        {(stats.dueSoon > 0 || stats.overdue > 0) && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFF5E2] dark:bg-amber-950/40 border border-[#B97915]/20 text-[11px]">
            <AlarmClock className="w-3.5 h-3.5 text-[#B97915]" />
            <span className="font-semibold text-[#B97915]">
              {stats.dueSoon} Due Soon
            </span>
          </div>
        )}

        {/* Notification Bell */}
        <NotificationBell onSelectAssignment={onSelectAssignment} />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#66718C] hover:text-[#18223F] hover:bg-[#F5F7FC] dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={`Toggle Theme (Current: ${theme})`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* User Mini Avatar Badge */}
        <div
          onClick={() => navigate('/settings')}
          className="cursor-pointer w-8 h-8 rounded-full bg-[#5B4DF5] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#E6E9F2] dark:ring-slate-800 shadow-tf-subtle hover:scale-105 transition-transform"
          title={userDisplayName}
        >
          {userDisplayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
