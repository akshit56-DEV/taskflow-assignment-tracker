import React from 'react';
import { DeadlineUrgency } from '@/types';
import { AlertCircle, Clock, Calendar } from 'lucide-react';

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
  const getStyle = () => {
    switch (urgency) {
      case 'Overdue':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
          dot: 'bg-rose-600 animate-ping',
          solidDot: 'bg-rose-600',
          icon: <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
        };
      case 'Critical': // Due Today
        return {
          pill: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
          dot: 'bg-orange-500 animate-pulse',
          solidDot: 'bg-orange-500',
          icon: <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />,
        };
      case 'Urgent': // Due Tomorrow
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          solidDot: 'bg-amber-500',
          icon: <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
        };
      case 'Important': // 3-6 days
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
          dot: 'bg-blue-500',
          solidDot: 'bg-blue-500',
          icon: <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
        };
      case 'Approaching':
      case 'Normal':
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
          solidDot: 'bg-slate-400',
          icon: <Calendar className="w-3 h-3 text-slate-400" />,
        };
    }
  };

  const style = getStyle();

  const getLabel = () => {
    if (urgency === 'Overdue') {
      return daysRemaining !== undefined ? `Overdue • ${Math.abs(daysRemaining)}d` : 'Overdue';
    }
    if (urgency === 'Critical') return 'Due Today • 11:59 PM';
    if (urgency === 'Urgent') return 'Due Tomorrow';
    if (urgency === 'Important' && daysRemaining !== undefined) return `Due in ${daysRemaining} days`;
    if (daysRemaining !== undefined && daysRemaining > 0) return `${daysRemaining} days left`;
    return urgency;
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border tracking-tight shadow-2xs select-none ${style.pill} ${sizeClasses}`}
      title={`Urgency: ${urgency}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.solidDot}`} />
      </span>
      <span>{getLabel()}</span>
    </span>
  );
};
