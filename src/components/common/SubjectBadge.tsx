import React from 'react';
import { Subject } from '@/types';

interface SubjectBadgeProps {
  subject?: Subject | null;
  name?: string;
  color?: string;
  size?: 'sm' | 'md';
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subject,
  name,
  color,
  size = 'md',
}) => {
  const displayName = subject?.name || name || 'General';
  const displayColor = subject?.color || color || '#2563EB';

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg font-semibold bg-surface-container-low dark:bg-slate-800/90 text-on-surface dark:text-slate-100 border border-outline-variant/30 dark:border-slate-700/60 shadow-2xs ${sizeClasses}`}
      title={displayName}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: displayColor }}
      />
      <span className="truncate max-w-[150px]">{displayName}</span>
    </span>
  );
};
