import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { AssignmentWithDetails } from '@/types';
import { getCalendarDaysDiff } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import { Target, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TodaysFocusProps {
  onOpenDetails: (assignmentId: string) => void;
}

export const TodaysFocus: React.FC<TodaysFocusProps> = ({ onOpenDetails }) => {
  const { assignments } = useAssignments();

  // Active unarchived assignments
  const activeAssignments = assignments.filter((a) => !a.is_deleted && !a.is_archived);

  // Categorize real assignments for today's attention
  const overdue = activeAssignments.filter((a) => {
    if (a.completed) return false;
    return getCalendarDaysDiff(a.due_date) < 0;
  });

  const dueToday = activeAssignments.filter((a) => {
    if (a.completed) return false;
    return getCalendarDaysDiff(a.due_date) === 0;
  });

  const dueTomorrow = activeAssignments.filter((a) => {
    if (a.completed) return false;
    return getCalendarDaysDiff(a.due_date) === 1;
  });

  const pendingErp = activeAssignments.filter((a) => a.completed && !a.uploaded_to_erp);

  const completed = activeAssignments.filter((a) => a.completed);

  const attentionCount = overdue.length + dueToday.length + dueTomorrow.length + pendingErp.length;

  // Build the prioritized 3-item list for Today's Focus
  type FocusItem = {
    assignment: AssignmentWithDetails;
    variant: 'red' | 'amber' | 'green' | 'blue';
    badgeLabel: string;
    subLabel: string;
  };

  const focusList: FocusItem[] = [];

  // 1. Add Overdue items (highest priority red)
  overdue.slice(0, 2).forEach((a) => {
    const diff = Math.abs(getCalendarDaysDiff(a.due_date));
    focusList.push({
      assignment: a,
      variant: 'red',
      badgeLabel: 'Overdue',
      subLabel: diff === 1 ? 'Due yesterday' : `Due ${diff}d ago`,
    });
  });

  // 2. Add Due Today items (red / urgent)
  if (focusList.length < 3) {
    dueToday
      .filter((a) => !focusList.some((f) => f.assignment.id === a.id))
      .slice(0, 3 - focusList.length)
      .forEach((a) => {
        focusList.push({
          assignment: a,
          variant: 'red',
          badgeLabel: 'Due Today',
          subLabel: 'Due by 11:59 PM',
        });
      });
  }

  // 3. Add Due Tomorrow items (amber / attention)
  if (focusList.length < 3) {
    dueTomorrow
      .filter((a) => !focusList.some((f) => f.assignment.id === a.id))
      .slice(0, 3 - focusList.length)
      .forEach((a) => {
        focusList.push({
          assignment: a,
          variant: 'amber',
          badgeLabel: 'Due Tomorrow',
          subLabel: 'Due tomorrow',
        });
      });
  }

  // 4. Add Pending ERP items (amber / attention)
  if (focusList.length < 3) {
    pendingErp
      .filter((a) => !focusList.some((f) => f.assignment.id === a.id))
      .slice(0, 3 - focusList.length)
      .forEach((a) => {
        focusList.push({
          assignment: a,
          variant: 'amber',
          badgeLabel: 'Needs ERP',
          subLabel: 'Awaiting portal upload',
        });
      });
  }

  // 5. Add Completed items if space remains (green / completed feedback)
  if (focusList.length < 3) {
    completed
      .filter((a) => !focusList.some((f) => f.assignment.id === a.id))
      .slice(0, 3 - focusList.length)
      .forEach((a) => {
        focusList.push({
          assignment: a,
          variant: 'green',
          badgeLabel: 'Completed',
          subLabel: a.uploaded_to_erp ? 'ERP synced' : 'Work finished',
        });
      });
  }

  // If still empty but active items exist (e.g. upcoming in a few days)
  if (focusList.length < 3) {
    const remaining = activeAssignments
      .filter((a) => !focusList.some((f) => f.assignment.id === a.id))
      .sort((a, b) => getCalendarDaysDiff(a.due_date) - getCalendarDaysDiff(b.due_date));

    remaining.slice(0, 3 - focusList.length).forEach((a) => {
      const diff = getCalendarDaysDiff(a.due_date);
      focusList.push({
        assignment: a,
        variant: 'blue',
        badgeLabel: 'Upcoming',
        subLabel: `Due in ${diff}d`,
      });
    });
  }

  const badgeStyles = {
    red: 'bg-rose-50 text-[#E04F5F] border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40',
    amber: 'bg-amber-50 text-[#D68A16] border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
    green: 'bg-emerald-50 text-[#19A974] border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
    blue: 'bg-sky-50 text-[#0284C7] border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/40',
  };

  const dotStyles = {
    red: 'bg-[#E04F5F]',
    amber: 'bg-[#D68A16]',
    green: 'bg-[#19A974]',
    blue: 'bg-[#0284C7]',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-3.5 w-full min-w-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E6E9F2]/70 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center flex-shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC]">
                Today's Focus
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-heading font-bold text-[#171A2E] dark:text-white leading-tight">
              {attentionCount > 0
                ? `${attentionCount} ${attentionCount === 1 ? 'assignment needs' : 'assignments need'} attention`
                : 'All tracked coursework on schedule'}
            </h3>
          </div>
        </div>

        {attentionCount > 0 ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D68A16] dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex-shrink-0">
            {attentionCount} Action{attentionCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 flex-shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>On Track</span>
          </span>
        )}
      </div>

      {/* Focus List */}
      {focusList.length === 0 ? (
        <div className="py-4 text-center text-xs text-[#9499AB]">
          No active assignments found. Add your tasks to activate daily focus.
        </div>
      ) : (
        <div className="space-y-2">
          {focusList.map(({ assignment, variant, badgeLabel, subLabel }) => {
            const subjectName = assignment.subject?.name || 'General';
            return (
              <div
                key={assignment.id}
                onClick={() => onOpenDetails(assignment.id)}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-[#E6E9F2]/70 dark:border-slate-800/80 hover:border-[#5B4DF5]/30 hover:bg-[#F8FAFC] dark:hover:bg-[#15172F] transition-all cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyles[variant]}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-[#171A2E] dark:text-white truncate group-hover:text-[#5B4DF5] transition-colors">
                        {assignment.title}
                      </span>
                      <span className="text-[10px] text-[#9499AB] hidden sm:inline flex-shrink-0">
                        ({subjectName})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5C6175] dark:text-[#94A3B8]">
                      {subLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyles[variant]}`}
                  >
                    {badgeLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9499AB] group-hover:text-[#5B4DF5] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};
