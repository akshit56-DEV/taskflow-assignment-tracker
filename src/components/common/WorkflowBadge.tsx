import React from 'react';
import { DerivedWorkflowStage } from '@/types';
import { getWorkflowStageLabel } from '@/utils/workflowUtils';
import { UploadCloud, CheckCheck, Play, Check, CircleDot } from 'lucide-react';

interface WorkflowBadgeProps {
  stage: DerivedWorkflowStage;
  size?: 'sm' | 'md';
  showDotOnly?: boolean;
}

export const WorkflowBadge: React.FC<WorkflowBadgeProps> = ({
  stage,
  size = 'md',
  showDotOnly = false,
}) => {
  const label = getWorkflowStageLabel(stage);

  const getStyle = () => {
    switch (stage) {
      case 'checked':
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/60',
          dot: 'bg-emerald-500',
          icon: <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'uploaded':
        return {
          pill: 'bg-indigo-50 text-indigo-800 border-indigo-300/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700/60',
          dot: 'bg-indigo-500',
          icon: <UploadCloud className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
        };
      case 'completed':
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-300/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700/60',
          dot: 'bg-teal-500',
          icon: <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />,
        };
      case 'in_progress':
        return {
          pill: 'bg-blue-50 text-blue-800 border-blue-300/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700/60',
          dot: 'bg-blue-600',
          icon: <Play className="w-2.5 h-2.5 fill-blue-600 text-blue-600 dark:text-blue-400" />,
        };
      case 'not_started':
      default:
        return {
          pill: 'bg-slate-100/90 text-slate-700 border-slate-300/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
          icon: <CircleDot className="w-3 h-3 text-slate-400" />,
        };
    }
  };

  const style = getStyle();

  if (showDotOnly) {
    return (
      <span className="flex items-center gap-1.5" title={label}>
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400">{label}</span>
      </span>
    );
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border tracking-tight shadow-2xs select-none ${style.pill} ${sizeClasses}`}
      title={`Workflow Stage: ${label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {style.icon}
      <span>{label}</span>
    </span>
  );
};
