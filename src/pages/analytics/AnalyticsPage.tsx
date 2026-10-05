import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAssignments } from '@/context/AssignmentContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AnalyticsPage: React.FC = () => {
  const { assignments, subjects } = useAssignments();

  const activeAssignments = useMemo(
    () => assignments.filter((a) => !a.is_deleted && !a.is_archived),
    [assignments]
  );

  const completedCount = useMemo(
    () => activeAssignments.filter((a) => a.completed).length,
    [activeAssignments]
  );

  const erpCount = useMemo(
    () => activeAssignments.filter((a) => a.uploaded_to_erp).length,
    [activeAssignments]
  );

  const checkedCount = useMemo(
    () => activeAssignments.filter((a) => a.professor_checked).length,
    [activeAssignments]
  );

  const totalCount = activeAssignments.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingCount = totalCount - completedCount;
  const leakageErp = Math.max(0, completedCount - erpCount);
  const leakageChecked = Math.max(0, erpCount - checkedCount);

  // Weekday distribution of deadlines
  const weekdayWorkload = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon - Sun
    activeAssignments.forEach((a) => {
      if (a.due_date) {
        const d = new Date(a.due_date + 'T00:00:00');
        const dayIdx = (d.getDay() + 6) % 7; // Mon = 0, Sun = 6
        counts[dayIdx]++;
      }
    });
    return counts;
  }, [activeAssignments]);

  const maxWeekdayCount = Math.max(1, ...weekdayWorkload);
  const busiestDayIdx = weekdayWorkload.indexOf(Math.max(...weekdayWorkload));
  const busiestDayName = FULL_DAY_NAMES[busiestDayIdx];

  // Subject completion breakdown
  const subjectProgress = useMemo(() => {
    return subjects.map((sub) => {
      const subTasks = activeAssignments.filter((a) => a.subject_id === sub.id);
      const subCompleted = subTasks.filter((a) => a.completed).length;
      const pct = subTasks.length > 0 ? Math.round((subCompleted / subTasks.length) * 100) : 0;
      return {
        id: sub.id,
        name: sub.name,
        color: sub.color || '#4355ED',
        total: subTasks.length,
        completed: subCompleted,
        pct,
      };
    });
  }, [subjects, activeAssignments]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header (Figma #3:73612: Analytics / Understand your effort. Protect your momentum.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            Understand your effort. Protect your momentum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] text-[#18223F] dark:text-white border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle">
            Semester 03 · {totalCount} assignments
          </span>
          <div className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#66718C] dark:text-[#94A3B8] shadow-tf-subtle cursor-pointer">
            This semester ⌄
          </div>
        </div>
      </div>

      {/* Hero Card: Assignment Completion (Figma #3:73612) */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
              Assignment completion
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#18223F] dark:text-white tracking-tight">
                {completionPct}%
              </span>
              <span className="text-xs text-[#188A68] font-semibold bg-[#E9F6F0] dark:bg-[#188A68]/20 px-2.5 py-1 rounded-full">
                {completedCount} completed · {pendingCount} pending
              </span>
            </div>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] pt-1">
              {erpCount} ERP uploaded · {checkedCount} professor checked.{' '}
              {leakageErp > 0 || leakageChecked > 0 ? (
                <span className="text-[#4355ED] font-medium">
                  {leakageErp} uploads and {leakageChecked} checks remain.
                </span>
              ) : (
                <span className="text-[#188A68] font-medium">All completed work verified!</span>
              )}
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 self-stretch md:self-auto min-w-[280px]">
            <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] text-center">
              <span className="text-[10px] text-[#66718C] uppercase font-bold block mb-1">Done</span>
              <span className="text-lg font-bold text-[#188A68]">{completedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] text-center">
              <span className="text-[10px] text-[#66718C] uppercase font-bold block mb-1">Uploaded</span>
              <span className="text-lg font-bold text-[#4355ED]">{erpCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] text-center">
              <span className="text-[10px] text-[#66718C] uppercase font-bold block mb-1">Checked</span>
              <span className="text-lg font-bold text-[#7970D9]">{checkedCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#F5F7FC] dark:bg-[#1E293B] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4355ED] rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </motion.div>

      {/* Row 2: Monthly Trend / Weekday Distribution & Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Workload Distribution */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#18223F] dark:text-white">
                Workload distribution
              </h3>
              <span className="text-xs text-[#66718C] dark:text-[#94A3B8]">
                {totalCount > 0 ? `${busiestDayName} is busiest` : 'Deadlines scheduled'}
              </span>
            </div>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mb-6">
              Deliverables distributed across the days of the week
            </p>

            <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4">
              {DAY_LABELS.map((day, idx) => {
                const count = weekdayWorkload[idx];
                const heightPct = Math.max(12, Math.round((count / maxWeekdayCount) * 100));
                const isBusiest = idx === busiestDayIdx && count > 0;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-[#18223F] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                    <div className="w-full max-w-[42px] bg-[#F5F7FC] dark:bg-[#1E293B] rounded-t-lg h-32 flex items-end p-1">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-md transition-all duration-500 ${
                          isBusiest
                            ? 'bg-[#4355ED]'
                            : count > 0
                            ? 'bg-[#7970D9]'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isBusiest ? 'text-[#4355ED] font-bold' : 'text-[#66718C] dark:text-[#94A3B8]'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E9F3] dark:border-[#1E293B] flex items-center justify-between text-xs text-[#66718C] dark:text-[#94A3B8] mt-4">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#4355ED]" />
              <span>Current semester distribution</span>
            </span>
            <span>Total: {totalCount} deliverables</span>
          </div>
        </motion.div>

        {/* Subject Progress */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-4"
        >
          <div>
            <h3 className="text-base font-bold text-[#18223F] dark:text-white mb-1">
              Subject completion
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8]">
              Completion rates per enrolled subject
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {subjectProgress.length === 0 ? (
              <p className="text-xs text-[#939CB1] py-4">No subjects registered yet.</p>
            ) : (
              subjectProgress.map((sub) => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#18223F] dark:text-white">
                      {sub.name}
                    </span>
                    <span className="font-bold text-[#66718C] dark:text-[#94A3B8]">
                      {sub.pct}% ({sub.completed}/{sub.total})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F5F7FC] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${sub.pct}%`, backgroundColor: sub.color }}
                      className="h-full rounded-full transition-all duration-700"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
