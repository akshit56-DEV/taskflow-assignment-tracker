import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAssignments } from '@/context/AssignmentContext';
import { useNotifications } from '@/context/NotificationContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Columns3,
  Repeat2,
  BookOpen,
  BarChart3,
  Bell,
  Archive,
  Trash2,
  Settings,
  X,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut } = useAuth();
  const { stats, subjects } = useAssignments();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (onClose) onClose();
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: ListTodo,
      badge: stats.total > 0 ? stats.total : undefined,
    },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/kanban', label: 'Kanban', icon: Columns3 },
    {
      to: '/recurring',
      label: 'Tutorials',
      icon: Repeat2,
    },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      to: '/subjects',
      label: 'Subjects',
      icon: BookOpen,
      badge: subjects.length > 0 ? subjects.length : undefined,
    },
    { to: '/archive', label: 'Archive', icon: Archive },
    { to: '/trash', label: 'Trash', icon: Trash2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const userDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Student');

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
            className="fixed inset-0 z-40 bg-tf-navy/60 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#0B1020] border-r border-[#E5E9F3] dark:border-[#1E293B] transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between select-none ${
          isOpen ? 'translate-x-0 shadow-tf-hero' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E5E9F3] dark:border-[#1E293B]">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-2 group"
            >
              <BrandLogo size="sm" showText={true} />
            </NavLink>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-tf-muted hover:text-tf-deep hover:bg-tf-bg transition-colors"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="px-3.5 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-medium ${
                      isActive
                        ? 'bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] dark:text-[#A49DFC] font-semibold'
                        : 'text-[#5C6175] hover:bg-[#F5F7FB] hover:text-[#171A2E] dark:text-[#94A3B8] dark:hover:bg-[#11142B] dark:hover:text-[#F1F5F9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-[#5B4DF5] dark:text-[#A49DFC]'
                            : 'text-[#9499AB] dark:text-[#94A3B8]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-[#5B4DF5] text-white'
                            : 'bg-[#E6E9F2] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300'
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

          {/* Academic Semester Note (Figma #3:73039 Sidebar Note) */}
          <div className="px-5 mt-auto pb-4">
            <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B]">
              <span className="block text-[10px] font-semibold text-[#18223F] dark:text-slate-200 tracking-wider uppercase">
                Academic Year 2026–27
              </span>
              <span className="block text-[11px] text-[#66718C] dark:text-slate-400 mt-0.5">
                Semester 03 · One step ahead
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Settings & Profile Card */}
        <div className="p-3.5 border-t border-tf-border dark:border-slate-800 flex flex-col gap-2.5">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              location.pathname === '/settings'
                ? 'bg-[#EEECFF] dark:bg-tf-indigo/20 text-tf-indigo dark:text-white font-bold'
                : 'text-tf-muted hover:bg-tf-bg hover:text-tf-deep dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-tf-muted dark:text-slate-400" />
            <span>Settings & Preferences</span>
          </NavLink>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-tf-bg dark:bg-slate-900 border border-tf-border/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-linear text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-tf-success ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-tf-deep dark:text-white truncate">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-tf-subtle truncate">
                  Academic Scholar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 text-tf-muted hover:text-tf-danger rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
