import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import { useOutletContext } from 'react-router-dom';
import { formatFriendlyDateTime } from '@/utils/dateUtils';
import { AssignmentWithDetails } from '@/types';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  UploadCloud,
  CheckCircle2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const { onOpenDetails } = useOutletContext<LayoutContextType>();
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'reminders'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'unread') return !n.is_read;
    if (filterMode === 'reminders') return n.type === 'due_soon' || n.type === 'overdue';
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-[#D34D61]" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-[#B97915]" />;
      case 'erp_pending':
        return <UploadCloud className="w-4 h-4 text-[#4355ED]" />;
      default:
        return <Bell className="w-4 h-4 text-[#4355ED]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header (Figma #3:73732: Notifications / The important updates, in one quiet place.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            The important updates, in one quiet place.
          </p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] text-[#4355ED] dark:text-[#7970D9] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] shadow-tf-subtle transition-colors self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </motion.button>
        )}
      </div>

      {/* Tabs (All updates, Unread · 2, Reminders) */}
      <div className="flex items-center gap-2 border-b border-[#E5E9F3] dark:border-[#1E293B] pb-3">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-[#4355ED] text-white shadow-xs'
              : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]'
          }`}
        >
          All updates
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('unread')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterMode === 'unread'
              ? 'bg-[#4355ED] text-white shadow-xs'
              : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]'
          }`}
        >
          Unread {unreadCount > 0 ? `· ${unreadCount}` : ''}
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('reminders')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterMode === 'reminders'
              ? 'bg-[#4355ED] text-white shadow-xs'
              : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] space-y-3 flex flex-col items-center justify-center shadow-tf-subtle"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] dark:text-[#7970D9] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#18223F] dark:text-white">
                  You’re all caught up.
                </p>
                <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-1 max-w-sm">
                  We'll alert you whenever an assignment is nearing its deadline, needs ERP upload, or receives professor feedback.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredNotifications.map((n) => {
              const isUnread = !n.is_read;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-tf-subtle ${
                    isUnread
                      ? 'bg-white dark:bg-[#111827] border-[#4355ED]/40 dark:border-[#4355ED]/50 ring-1 ring-[#4355ED]/10'
                      : 'bg-white dark:bg-[#111827] border-[#E5E9F3] dark:border-[#1E293B] hover:border-[#4355ED]/30'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isUnread
                        ? 'bg-[#EEF0FF] dark:bg-[#4355ED]/20'
                        : 'bg-[#F5F7FC] dark:bg-[#1E293B]'
                    }`}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#4355ED] shrink-0" />
                        )}
                        <h3 className="text-sm font-bold text-[#18223F] dark:text-white truncate">
                          {n.title}
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#939CB1] flex-shrink-0">
                        {formatFriendlyDateTime(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action link (View assignment →) */}
                    <div className="flex items-center gap-4 pt-1">
                      {n.assignment_id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnread) markAsRead(n.id);
                            if (n.assignment_id) onOpenDetails(n.assignment_id);
                          }}
                          className="text-xs font-semibold text-[#4355ED] dark:text-[#7970D9] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View assignment</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markAsRead(n.id)}
                          className="text-xs font-medium text-[#939CB1] hover:text-[#18223F] dark:hover:text-white cursor-pointer"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Notification Button */}
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#939CB1] hover:text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 transition-all cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
