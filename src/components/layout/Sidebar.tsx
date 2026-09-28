import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Repeat,
  BookOpen,
  BarChart3,
  Archive,
  Trash2,
  Settings,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { stats, subjects } = useAssignments();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: ListTodo,
      badge: stats.total > 0 ? stats.total : undefined,
    },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/recurring', label: 'Recurring Tutorials', icon: Repeat },
    {
      to: '/subjects',
      label: 'Subjects',
      icon: BookOpen,
      badge: subjects.length > 0 ? subjects.length : undefined,
    },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/archive', label: 'Academic Archive', icon: Archive },
  ];

  const secondaryNavItems = [
    { to: '/trash', label: 'Trash / Bin', icon: Trash2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/90 dark:bg-[#0b101c]/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 group-hover:rotate-3 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                TaskFlow
              </span>
              <span className="block text-[10px] uppercase font-extrabold tracking-wider bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent -mt-1">
                Academic Pro
              </span>
            </div>
          </NavLink>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Core Management
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className="relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl bg-brand-50/90 dark:bg-brand-950/70 border border-brand-200/70 dark:border-brand-800/60 shadow-xs"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}
                      />
                      <span
                        className={
                          isActive
                            ? 'text-brand-700 dark:text-brand-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                        }
                      >
                        {item.label}
                      </span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`relative z-10 px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Workspace & Preferences
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl bg-brand-50/90 dark:bg-brand-950/70 border border-brand-200/70 dark:border-brand-800/60 shadow-xs"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={`relative z-10 w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span
                      className={`relative z-10 ${
                        isActive
                          ? 'text-brand-700 dark:text-brand-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Quick Deadline Urgency Status Card */}
        {stats.overdue > 0 && (
          <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-rose-950/20 border border-red-200/80 dark:border-red-900/60 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300 text-xs mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Urgent Attention</span>
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-300 leading-tight">
              {stats.overdue} {stats.overdue === 1 ? 'assignment is' : 'assignments are'} overdue.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
