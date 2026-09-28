import { DerivedWorkflowStage, PriorityLevel, ProgressStatus, DeadlineUrgency } from '@/types';

export function getDerivedWorkflowStage(assignment: {
  progress_status: ProgressStatus;
  completed: boolean;
  uploaded_to_erp: boolean;
  professor_checked: boolean;
}): DerivedWorkflowStage {
  if (assignment.professor_checked) {
    return 'checked';
  }
  if (assignment.uploaded_to_erp) {
    return 'uploaded';
  }
  if (assignment.completed) {
    return 'completed';
  }
  if (assignment.progress_status === 'in_progress') {
    return 'in_progress';
  }
  return 'not_started';
}

export function getWorkflowStageLabel(stage: DerivedWorkflowStage): string {
  switch (stage) {
    case 'checked':
      return 'Professor Checked';
    case 'uploaded':
      return 'Uploaded to ERP';
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'not_started':
    default:
      return 'Not Started';
  }
}

export function getPriorityColor(priority: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case 'Urgent':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
      };
    case 'High':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'Medium':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/60',
        dot: 'bg-blue-500',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getUrgencyColor(urgency: DeadlineUrgency): {
  bg: string;
  text: string;
  border: string;
} {
  switch (urgency) {
    case 'Overdue':
      return {
        bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-800',
      };
    case 'Critical':
      return {
        bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-800',
      };
    case 'Urgent':
      return {
        bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-800',
      };
    case 'Important':
      return {
        bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-800',
      };
    case 'Approaching':
      return {
        bg: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800/60',
      };
    case 'Normal':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
      };
  }
}
