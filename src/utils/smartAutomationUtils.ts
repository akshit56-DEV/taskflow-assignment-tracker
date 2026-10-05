import { AssignmentWithDetails, DeadlineUrgency, PriorityLevel } from '@/types';
import { getCalendarDaysDiff, getTodayDateString, getDeadlineUrgency } from './dateUtils';

export interface SmartTodayItems {
  overdue: AssignmentWithDetails[];
  dueToday: AssignmentWithDetails[];
  dueTomorrow: AssignmentWithDetails[];
  recentlyCompleted: AssignmentWithDetails[];
  completedNotUploaded: AssignmentWithDetails[];
  uploadedNotChecked: AssignmentWithDetails[];
  totalActionable: number;
}

export interface FocusNextItem {
  assignment: AssignmentWithDetails;
  reason: 'overdue' | 'due_today' | 'due_tomorrow' | 'approaching' | 'needs_erp' | 'needs_check';
  title: string;
  badgeLabel: string;
  badgeColor: string;
  recommendationText: string;
  actionType: 'complete' | 'upload_erp' | 'professor_check';
  actionLabel: string;
}

export interface AcademicSummaryData {
  totalThisWeek: number;
  dueSoon: number;
  overdue: number;
  completed: number;
  completionPercentage: number;
  pendingErp: number;
  pendingCheck: number;
  insight: {
    title: string;
    description: string;
    tone: 'critical' | 'warning' | 'info' | 'success';
  };
}

/**
 * Deterministic automated urgency calculation utility
 */
export function getAssignmentUrgency(assignment: {
  due_date: string;
  completed?: boolean;
}): DeadlineUrgency {
  return getDeadlineUrgency(assignment.due_date, assignment.completed ?? false);
}

/**
 * Extracts and triages all Smart Today items from the active assignment list
 */
export function getSmartTodayItems(assignments: AssignmentWithDetails[]): SmartTodayItems {
  const todayStr = getTodayDateString();
  const active = assignments.filter((a) => !a.is_deleted && !a.is_archived);

  const overdue = active.filter((a) => !a.completed && a.due_date < todayStr);
  const dueToday = active.filter((a) => !a.completed && a.due_date === todayStr);
  const dueTomorrow = active.filter((a) => {
    if (a.completed) return false;
    const diff = getCalendarDaysDiff(a.due_date);
    return diff === 1;
  });

  const recentlyCompleted = active
    .filter((a) => a.completed && a.completed_at)
    .filter((a) => {
      const diff = getCalendarDaysDiff(todayStr, a.completed_at!.split('T')[0]);
      return diff <= 2;
    })
    .slice(0, 3);

  const completedNotUploaded = active.filter((a) => a.completed && !a.uploaded_to_erp);
  const uploadedNotChecked = active.filter(
    (a) => a.completed && a.uploaded_to_erp && !a.professor_checked
  );

  const totalActionable =
    overdue.length +
    dueToday.length +
    dueTomorrow.length +
    completedNotUploaded.length +
    uploadedNotChecked.length;

  return {
    overdue,
    dueToday,
    dueTomorrow,
    recentlyCompleted,
    completedNotUploaded,
    uploadedNotChecked,
    totalActionable,
  };
}

/**
 * Deterministically determines the single highest-priority focus task for the student
 */
export function getFocusNextAssignment(
  assignments: AssignmentWithDetails[]
): FocusNextItem | null {
  const active = assignments.filter((a) => !a.is_deleted && !a.is_archived);
  if (active.length === 0) return null;

  const todayStr = getTodayDateString();

  const priorityScore: Record<PriorityLevel, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // 1. Overdue assignments (highest urgency)
  const overdueItems = active
    .filter((a) => !a.completed && a.due_date < todayStr)
    .sort((a, b) => {
      // Sort by earliest due date, then highest manual priority
      if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
      return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
    });

  if (overdueItems.length > 0) {
    const item = overdueItems[0];
    const days = Math.abs(getCalendarDaysDiff(item.due_date));
    return {
      assignment: item,
      reason: 'overdue',
      title: item.title,
      badgeLabel: `Overdue (${days}d ago)`,
      badgeColor: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
      recommendationText: `Submission deadline has passed. Complete and submit immediately to avoid grade penalties.`,
      actionType: 'complete',
      actionLabel: 'Mark Complete',
    };
  }

  // 2. Due Today uncompleted
  const dueTodayItems = active
    .filter((a) => !a.completed && a.due_date === todayStr)
    .sort((a, b) => (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0));

  if (dueTodayItems.length > 0) {
    const item = dueTodayItems[0];
    return {
      assignment: item,
      reason: 'due_today',
      title: item.title,
      badgeLabel: 'Due Today',
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      recommendationText: `Scheduled for final submission today. Focus your academic effort here first.`,
      actionType: 'complete',
      actionLabel: 'Mark Complete',
    };
  }

  // 3. Due Tomorrow uncompleted
  const dueTomorrowItems = active
    .filter((a) => {
      if (a.completed) return false;
      return getCalendarDaysDiff(a.due_date) === 1;
    })
    .sort((a, b) => (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0));

  if (dueTomorrowItems.length > 0) {
    const item = dueTomorrowItems[0];
    return {
      assignment: item,
      reason: 'due_tomorrow',
      title: item.title,
      badgeLabel: 'Due Tomorrow',
      badgeColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
      recommendationText: `Deadline is tomorrow. Wrap up pending sections or calculations today.`,
      actionType: 'complete',
      actionLabel: 'Mark Complete',
    };
  }

  // 4. Incomplete workflow: Completed but pending ERP upload
  const pendingErpItems = active.filter((a) => a.completed && !a.uploaded_to_erp);
  if (pendingErpItems.length > 0) {
    const item = pendingErpItems[0];
    return {
      assignment: item,
      reason: 'needs_erp',
      title: item.title,
      badgeLabel: 'Needs ERP Upload',
      badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      recommendationText: `You've completed this assignment! Upload the PDF/file to your ERP student portal to lock in your submission.`,
      actionType: 'upload_erp',
      actionLabel: 'Upload to ERP',
    };
  }

  // 5. In-progress or upcoming task within 7 days
  const upcomingItems = active
    .filter((a) => {
      if (a.completed) return false;
      const diff = getCalendarDaysDiff(a.due_date);
      return diff >= 2 && diff <= 7;
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  if (upcomingItems.length > 0) {
    const item = upcomingItems[0];
    const diff = getCalendarDaysDiff(item.due_date);
    return {
      assignment: item,
      reason: 'approaching',
      title: item.title,
      badgeLabel: `Due in ${diff} days`,
      badgeColor: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30',
      recommendationText: `Upcoming course submission. Start working on this early for a stress-free week.`,
      actionType: 'complete',
      actionLabel: 'Mark Complete',
    };
  }

  // 6. Incomplete workflow: Uploaded but pending professor check
  const pendingCheckItems = active.filter(
    (a) => a.completed && a.uploaded_to_erp && !a.professor_checked
  );
  if (pendingCheckItems.length > 0) {
    const item = pendingCheckItems[0];
    return {
      assignment: item,
      reason: 'needs_check',
      title: item.title,
      badgeLabel: 'Awaiting Check',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      recommendationText: `Uploaded to ERP. Remember to show it to your professor for evaluation signature.`,
      actionType: 'professor_check',
      actionLabel: 'Mark Checked',
    };
  }

  return null;
}

/**
 * Calculates a comprehensive academic summary for the user's active week
 */
export function getAcademicSummary(
  assignments: AssignmentWithDetails[]
): AcademicSummaryData {
  const todayStr = getTodayDateString();
  const active = assignments.filter((a) => !a.is_deleted && !a.is_archived);

  const thisWeekAssignments = active.filter((a) => {
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= -14 && diff <= 7;
  });

  const totalThisWeek = thisWeekAssignments.length;
  const completed = thisWeekAssignments.filter((a) => a.completed).length;
  const overdue = thisWeekAssignments.filter(
    (a) => !a.completed && a.due_date < todayStr
  ).length;
  const dueSoon = thisWeekAssignments.filter((a) => {
    if (a.completed) return false;
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= 0 && diff <= 2;
  }).length;
  const pendingErp = thisWeekAssignments.filter(
    (a) => a.completed && !a.uploaded_to_erp
  ).length;
  const pendingCheck = thisWeekAssignments.filter(
    (a) => a.completed && a.uploaded_to_erp && !a.professor_checked
  ).length;

  const completionPercentage =
    totalThisWeek > 0 ? Math.round((completed / totalThisWeek) * 100) : 100;

  let insight: AcademicSummaryData['insight'] = {
    title: 'Academic Flow on Track',
    description: `You are maintaining a ${completionPercentage}% completion rate. Keep up the solid momentum!`,
    tone: 'info',
  };

  if (active.length === 0) {
    insight = {
      title: 'Ready for the Semester',
      description: 'Add your course assignments and TaskFlow will automatically schedule and prioritize your deadlines.',
      tone: 'info',
    };
  } else if (overdue > 0) {
    insight = {
      title: 'Action Required',
      description: `You have ${overdue} overdue ${
        overdue === 1 ? 'assignment' : 'assignments'
      }. Complete and submit to prevent academic backlog.`,
      tone: 'critical',
    };
  } else if (pendingErp > 0) {
    insight = {
      title: 'ERP Synchronization Pending',
      description: `${pendingErp} completed ${
        pendingErp === 1 ? 'assignment is' : 'assignments are'
      } awaiting final upload to the student ERP portal.`,
      tone: 'warning',
    };
  } else if (dueSoon > 0) {
    insight = {
      title: 'Deadlines Approaching',
      description: `${dueSoon} ${
        dueSoon === 1 ? 'assignment is' : 'assignments are'
      } due in the next 48 hours. Focus on finishing these submissions first.`,
      tone: 'warning',
    };
  } else if (completionPercentage === 100 && totalThisWeek > 0) {
    insight = {
      title: 'All Clear This Week! 🎉',
      description: 'All scheduled assignments for this week are completed and synced. Excellent work staying ahead!',
      tone: 'success',
    };
  }

  return {
    totalThisWeek,
    dueSoon,
    overdue,
    completed,
    completionPercentage,
    pendingErp,
    pendingCheck,
    insight,
  };
}
