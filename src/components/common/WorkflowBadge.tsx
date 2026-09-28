import React from 'react';
import { DerivedWorkflowStage } from '@/types';
import { getWorkflowStageLabel } from '@/utils/workflowUtils';
import { Circle, PlayCircle, CheckCircle2, UploadCloud, CheckCheck } from 'lucide-react';

interface WorkflowBadgeProps {
  stage: DerivedWorkflowStage;
  size?: 'sm' | 'md';
}

export const WorkflowBadge: React.FC<WorkflowBadgeProps> = ({ stage, size = 'md' }) => {
  const label = getWorkflowStageLabel(stage);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const getStyle = () => {
    switch (stage) {
      case 'checked':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
          icon: <CheckCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        };
      case 'uploaded':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
          icon: <UploadCloud className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
        };
      case 'completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'in_progress':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
          icon: <PlayCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
        };
      case 'not_started':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          icon: <Circle className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${sizeClasses}`}
      title={`Workflow Stage: ${label}`}
    >
      {style.icon}
      <span>{label}</span>
    </span>
  );
};
