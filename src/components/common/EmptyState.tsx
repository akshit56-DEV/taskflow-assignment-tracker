import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  badge,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 my-4 backdrop-blur-sm relative overflow-hidden"
    >
      {badge && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
          {badge}
        </span>
      )}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500/15 to-indigo-500/10 dark:from-brand-500/20 dark:to-indigo-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 shadow-inner border border-brand-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-500/20"
            >
              {actionLabel}
            </motion.button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              {secondaryActionLabel}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};
