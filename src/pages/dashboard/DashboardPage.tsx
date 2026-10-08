import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAssignments } from '@/context/AssignmentContext';
import { WorkflowTrack } from '@/components/dashboard/WorkflowTrack';
import { FocusNextCard } from '@/components/dashboard/FocusNextCard';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { FocusHub } from '@/components/dashboard/FocusHub';
import { SmartTodayTriage } from '@/components/dashboard/SmartTodayTriage';
import { SmartAcademicSummary } from '@/components/dashboard/SmartAcademicSummary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import {
  getTimeBasedGreeting,
  getCalendarDaysDiff,
} from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import { AssignmentWithDetails } from '@/types';
import {
  Plus,
  ChevronRight,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { assignments, stats, loading } = useAssignments();
  const { onOpenAddModal, onEditAssignment, onOpenDetails } = useOutletContext<LayoutContextType>();

  const greeting = getTimeBasedGreeting();

  const userDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Student');

  // Upcoming Deadlines (next 10 days excluding today)
  const upcomingDeadlines = assignments
    .filter((a) => {
      if (a.is_deleted || a.is_archived || a.completed) return false;
      const diff = getCalendarDaysDiff(a.due_date);
      return diff > 0 && diff <= 10;
    })
    .slice(0, 5);

  const completedCount = stats.completed;
  const totalCount = stats.total;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const uploadedToErpCount = assignments.filter(
    (a) => !a.is_deleted && !a.is_archived && a.uploaded_to_erp
  ).length;
  const profCheckedCount = assignments.filter(
    (a) => !a.is_deleted && !a.is_archived && a.professor_checked
  ).length;

  if (loading && assignments.length === 0) {
    return <LoadingSpinner message="Loading your academic workspace..." />;
  }

  const friendlyTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
      className="space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden"
    >
      {/* 1. Page Header (Canvas 05 — Morning greeting) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-[#171A2E] dark:text-white tracking-tight break-words">
            {greeting}, {userDisplayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1">
            Academic Overview · {friendlyTodayDate}
          </p>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98, y: 1 }}
          transition={{ duration: 0.2 }}
          type="button"
          onClick={onOpenAddModal}
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B4DF5] hover:bg-[#4B3CE0] shadow-xs hover:shadow-sm transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add assignment</span>
        </motion.button>
      </div>

      {/* 2. Full 5-Stage Academic Workflow Attention Brief (Canvas 05 — Academic attention brief) */}
      <WorkflowTrack />

      {/* 3. 2-Column Dashboard Core (Focus Next, Today's Focus, Action Center, Academic Summary, Upcoming) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
        {/* Left Column: Focus Priority + Today's Focus + Smart Today Action Center */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 w-full min-w-0">
          {/* Focus Next Card */}
          <FocusNextCard onOpenDetails={onOpenDetails} />

          {/* Today's Focus (Semantic Attention Digest) */}
          <TodaysFocus onOpenDetails={onOpenDetails} />

          {/* Smart Today Triage Center */}
          <SmartTodayTriage
            onOpenDetails={onOpenDetails}
            onEditAssignment={onEditAssignment}
          />
        </div>

        {/* Right Column: Focus Hub + Upcoming Deadlines + Smart Academic Summary + Semester Loop */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 w-full min-w-0">
          {/* Focus Hub: Pomodoro + Focus Sprint + Memory Match + Reaction Sprint */}
          <FocusHub />

          {/* Upcoming Deadlines Panel with Date Ticket Composition */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
            className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-4 w-full min-w-0"
          >
            <div className="flex items-center justify-between border-b border-[#E6E9F2]/80 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4.5 h-4.5 text-[#5B4DF5]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-heading font-bold text-[#171A2E] dark:text-white whitespace-nowrap">
                    Upcoming Deadlines
                  </h3>
                  <span className="text-[11px] text-[#5C6175] dark:text-[#94A3B8]">
                    Next 10 days
                  </span>
                </div>
              </div>
              <Link
                to="/calendar"
                className="text-xs font-semibold text-[#5B4DF5] hover:text-[#4B3CE0] dark:text-[#A49DFC] transition-colors flex-shrink-0 whitespace-nowrap"
              >
                Calendar →
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-5 text-center text-xs text-[#9499AB]">
                No deadlines approaching in the next 10 days.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((item) => {
                  const dueDateObj = new Date(item.due_date);
                  const monthShort = dueDateObj.toLocaleDateString('en-US', { month: 'short' });
                  const dayNum = dueDateObj.getDate();
                  const diff = getCalendarDaysDiff(item.due_date);
                  const isUrgent = diff <= 2;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenDetails(item.id)}
                      className="p-2.5 flex items-center justify-between text-xs cursor-pointer group hover:bg-[#F8FAFC] dark:hover:bg-[#15172F] border border-[#E6E9F2]/60 dark:border-slate-800/80 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Date Ticket Block */}
                        <div
                          className={`w-9 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${
                            isUrgent
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-[#D68A16] dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40'
                              : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 border-[#E6E9F2] dark:border-slate-700'
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase leading-none">
                            {monthShort}
                          </span>
                          <span className="text-xs font-extrabold leading-tight">
                            {dayNum}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-[#171A2E] dark:text-white truncate group-hover:text-[#5B4DF5] transition-colors">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <SubjectBadge subject={item.subject} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isUrgent
                              ? 'bg-amber-50 text-[#D68A16] border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40'
                              : 'bg-[#F5F7FB] text-[#5C6175] border-[#E6E9F2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {diff === 1 ? 'Tomorrow' : `${diff}d`}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#9499AB] group-hover:text-[#5B4DF5] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Smart Academic Summary */}
          <SmartAcademicSummary />

          {/* Academic Verification Loop Progress Panel with Varied Semantic Cells */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-4 w-full min-w-0"
          >
            <div className="flex items-center justify-between border-b border-[#E6E9F2]/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E8F8F1] dark:bg-emerald-950/40 text-[#19A974] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#19A974]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-heading font-bold text-[#171A2E] dark:text-white truncate">
                    Semester Verification Loop
                  </h3>
                  <span className="text-[11px] text-[#5C6175] dark:text-[#94A3B8]">
                    Coursework closure status
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#19A974] bg-[#E8F8F1] dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 flex-shrink-0">
                {completionPct}% Closed
              </span>
            </div>

            {/* Progress track */}
            <div className="w-full bg-[#F5F7FB] dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-[#E6E9F2]/80 dark:border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="bg-[#19A974] h-full rounded-full"
              />
            </div>

            {/* Semantic metric cells */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[#9499AB] block text-[10px] font-bold uppercase">Finished</span>
                <span className="font-heading font-extrabold text-sm text-[#171A2E] dark:text-white">
                  {completedCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
                <span className="text-[#0D9488] block text-[10px] font-bold uppercase">ERP Uploaded</span>
                <span className="font-heading font-extrabold text-sm text-[#0D9488]">
                  {uploadedToErpCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[#19A974] block text-[10px] font-bold uppercase">Prof Checked</span>
                <span className="font-heading font-extrabold text-sm text-[#19A974]">
                  {profCheckedCount}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

