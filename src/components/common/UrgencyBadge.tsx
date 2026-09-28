import React from 'react';
import { DeadlineUrgency } from '@/types';
import { getUrgencyColor } from '@/utils/workflowUtils';
import { Clock, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';

interface UrgencyBadgeProps {
  urgency: DeadlineUrgency;
  daysRemaining?: number;
  size?: 'sm' | 'md';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  daysRemaining,
  size = 'md',
}) => {
  const styles = getUrgencyColor(urgency);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const renderIcon = () => {
    switch (urgency) {
      case 'Overdue':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
      case 'Critical':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />;
      case 'Urgent':
        return <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />;
      case 'Important':
        return <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'Approaching':
      case 'Normal':
      default:
        return <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getLabel = () => {
    if (urgency === 'Overdue') {
      return daysRemaining !== undefined ? `Overdue (${Math.abs(daysRemaining)}d)` : 'Overdue';
    }
    if (urgency === 'Critical') return 'Due Today';
    if (urgency === 'Urgent') return 'Due Tomorrow';
    if (urgency === 'Important' && daysRemaining !== undefined) return `${daysRemaining} days left`;
    return urgency;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${styles.bg} ${styles.border} ${sizeClasses}`}
      title={`Urgency: ${urgency}`}
    >
      {renderIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};
