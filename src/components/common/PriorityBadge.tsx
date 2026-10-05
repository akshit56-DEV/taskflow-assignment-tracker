import React from 'react';
import { PriorityLevel } from '@/types';
import { getPriorityColor } from '@/utils/workflowUtils';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showLabel = true,
}) => {
  const styles = getPriorityColor(priority);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border shadow-2xs ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
      title={`Priority: ${priority}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {showLabel && <span>{priority}</span>}
    </span>
  );
};
