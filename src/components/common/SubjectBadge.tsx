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
  const displayColor = subject?.color || color || '#3b82f6';
  const displayCode = subject?.code;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 ${sizeClasses}`}
      title={displayCode ? `${displayName} (${displayCode})` : displayName}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: displayColor }}
      />
      <span className="truncate max-w-[140px]">{displayName}</span>
      {displayCode && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          [{displayCode}]
        </span>
      )}
    </span>
  );
};
