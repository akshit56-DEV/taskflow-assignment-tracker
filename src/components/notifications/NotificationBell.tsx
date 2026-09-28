import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  onSelectAssignment?: (assignmentId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onSelectAssignment }) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <motion.div
          animate={
            unreadCount > 0
              ? {
                  rotate: [0, -10, 10, -8, 8, 0],
                  transition: {
                    repeat: Infinity,
                    repeatDelay: 5,
                    duration: 0.8,
                  },
                }
              : {}
          }
        >
          <Bell className="w-5 h-5" />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectAssignment={onSelectAssignment}
      />
    </div>
  );
};
