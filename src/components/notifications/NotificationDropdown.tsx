import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { formatFriendlyDateTime } from '@/utils/dateUtils';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Clock,
  UploadCloud,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssignment?: (assignmentId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectAssignment,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    requestBrowserPermission,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'erp_pending':
        return <UploadCloud className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-brand-500" />;
    }
  };

  const handleNotificationClick = (n: typeof notifications[0]) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }
    if (n.assignment_id && onSelectAssignment) {
      onSelectAssignment(n.assignment_id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline px-2 py-1"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Notification Banner (if default/promptable) */}
          {'Notification' in window && Notification.permission === 'default' && (
            <div className="p-3 bg-brand-50/80 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900/60 flex items-center justify-between text-xs">
              <span className="text-brand-800 dark:text-brand-300">
                Enable desktop notifications for deadline alerts?
              </span>
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="px-2 py-1 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.length > 0 ? (
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      n.is_read
                        ? 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        : 'bg-brand-50/40 dark:bg-brand-950/30 hover:bg-brand-50/70'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {n.title}
                        </h5>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mb-1">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{formatFriendlyDateTime(n.created_at)}</span>
                        {n.assignment_id && (
                          <span className="text-brand-600 dark:text-brand-400 flex items-center gap-0.5">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                No notifications right now. You are all caught up!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
