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

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
      title={`Priority: ${priority}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {showLabel && <span>{priority}</span>}
    </span>
  );
};
