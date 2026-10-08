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

export type AutoPriority =
  | 'Critical'
  | 'Urgent'
  | 'High'
  | 'Medium'
  | 'Normal'
  | 'Unscheduled'
  | 'Completed';

/**
 * Deterministic automated priority calculator:
 * - Overdue: Critical
 * - <= 24 hours (Today/Tomorrow): Urgent
 * - <= 48 hours (2 days): High
 * - <= 5 days: Medium
 * - > 5 days: Normal
 * - No due date: Unscheduled / Normal
 * 
 * Workflow Weighting:
 * - ERP upload pending: Elevate urgency (+1 tier, minimum 'High')
 * - Professor verification pending: Slight urgency increase (minimum 'Medium')
 * - Completed & Checked: No active urgency ('Completed')
 */
export function getAutomaticPriority(assignment: {
  due_date?: string | null;
  completed?: boolean;
  uploaded_to_erp?: boolean;
  professor_checked?: boolean;
  progress_status?: ProgressStatus;
}): AutoPriority {
  // If entirely checked through the 5-stage pipeline, no active urgency remains
  if (assignment.completed && assignment.uploaded_to_erp && assignment.professor_checked) {
    return 'Completed';
  }

  // Base priority derived from due date
  let base: AutoPriority = 'Normal';
  if (!assignment.due_date) {
    base = 'Unscheduled';
  } else {
    // Import date calculation helper logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(assignment.due_date);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      base = 'Critical';
    } else if (diffDays <= 1) {
      base = 'Urgent';
    } else if (diffDays <= 2) {
      base = 'High';
    } else if (diffDays <= 5) {
      base = 'Medium';
    } else {
      base = 'Normal';
    }
  }

  // Apply workflow weighting
  if (assignment.completed) {
    if (!assignment.uploaded_to_erp) {
      // ERP upload pending -> increase urgency (minimum High, or elevate to Urgent)
      if (base === 'Normal' || base === 'Unscheduled' || base === 'Medium') {
        return 'High';
      }
      return 'Urgent';
    }

    if (!assignment.professor_checked) {
      // Professor verification pending -> slight urgency increase (minimum Medium)
      if (base === 'Normal' || base === 'Unscheduled') {
        return 'Medium';
      }
      return base;
    }

    return 'Completed';
  }

  return base;
}

export function getAutomaticPriorityWeight(priority: AutoPriority | PriorityLevel | string): number {
  switch (priority) {
    case 'Critical':
      return 5;
    case 'Urgent':
      return 4;
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Normal':
    case 'Low':
      return 1;
    case 'Unscheduled':
      return 0;
    case 'Completed':
    default:
      return -1;
  }
}

/**
 * Automatic Task Intelligence: Recommended Next Action based on 5-stage workflow
 */
export function getRecommendedNextAction(assignment: {
  progress_status?: ProgressStatus;
  completed?: boolean;
  uploaded_to_erp?: boolean;
  professor_checked?: boolean;
}): {
  label: string;
  stage: DerivedWorkflowStage;
  actionType: 'start' | 'continue' | 'upload_erp' | 'await_check' | 'completed';
} {
  const stage = getDerivedWorkflowStage({
    progress_status: assignment.progress_status || 'not_started',
    completed: !!assignment.completed,
    uploaded_to_erp: !!assignment.uploaded_to_erp,
    professor_checked: !!assignment.professor_checked,
  });

  switch (stage) {
    case 'checked':
      return { label: 'Completed', stage: 'checked', actionType: 'completed' };
    case 'uploaded':
      return { label: 'Await professor check', stage: 'uploaded', actionType: 'await_check' };
    case 'completed':
      return { label: 'Upload to ERP', stage: 'completed', actionType: 'upload_erp' };
    case 'in_progress':
      return { label: 'Continue assignment', stage: 'in_progress', actionType: 'continue' };
    case 'not_started':
    default:
      return { label: 'Start assignment', stage: 'not_started', actionType: 'start' };
  }
}

export function getPriorityColor(priority: AutoPriority | PriorityLevel | string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-600',
      };
    case 'Urgent':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800/60',
        dot: 'bg-orange-500',
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
    case 'Completed':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      };
    case 'Normal':
    case 'Unscheduled':
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

export type IncompleteWorkflowType = 'none' | 'pending_erp' | 'pending_check';

export function getIncompleteWorkflowStatus(assignment: {
  completed: boolean;
  uploaded_to_erp: boolean;
  professor_checked: boolean;
}): {
  type: IncompleteWorkflowType;
  label: string | null;
  description: string | null;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  if (assignment.completed && !assignment.uploaded_to_erp) {
    return {
      type: 'pending_erp',
      label: 'Needs ERP Upload',
      description: 'Assignment completed but not yet uploaded to ERP portal.',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800/60',
    };
  }

  if (assignment.completed && assignment.uploaded_to_erp && !assignment.professor_checked) {
    return {
      type: 'pending_check',
      label: 'Awaiting Check',
      description: 'Uploaded to ERP, awaiting professor evaluation.',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-200 dark:border-purple-800/60',
    };
  }

  return {
    type: 'none',
    label: null,
    description: null,
    badgeBg: '',
    badgeText: '',
    badgeBorder: '',
  };
}

