import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAssignments } from '@/context/AssignmentContext';
import { WorkflowTrack } from '@/components/dashboard/WorkflowTrack';
import { FocusNextCard } from '@/components/dashboard/FocusNextCard';
import { SmartTodayTriage } from '@/components/dashboard/SmartTodayTriage';
import { SmartAcademicSummary } from '@/components/dashboard/SmartAcademicSummary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import {
  getTimeBasedGreeting,
  formatFriendlyDate,
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
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Page Header (Canvas 05 — Morning greeting) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171A2E] dark:text-white tracking-tight">
            {greeting}, {userDisplayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1">
            Academic Overview · {friendlyTodayDate}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, y: 1 }}
          transition={{ duration: 0.2 }}
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B4DF5] hover:bg-[#4B3CE0] shadow-tf-subtle hover:shadow-tf-card transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add assignment</span>
        </motion.button>
      </div>

      {/* 2. Full 5-Stage Academic Workflow Attention Brief (Canvas 05 — Academic attention brief) */}
      <WorkflowTrack />

      {/* 3. 2-Column Dashboard Core (Focus Next, Action Center, Academic Summary, Upcoming) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Focus Priority + Smart Today Action Center */}
        <div className="lg:col-span-7 space-y-6">
          {/* Focus Next Card */}
          <FocusNextCard onOpenDetails={onOpenDetails} />

          {/* Smart Today Triage Center */}
          <SmartTodayTriage
            onOpenDetails={onOpenDetails}
            onEditAssignment={onEditAssignment}
          />
        </div>

        {/* Right Column: Academic Summary + Upcoming Deadlines + Semester Loop */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Academic Summary */}
          <SmartAcademicSummary />

          {/* Upcoming Deadlines Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E6E9F2]/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#5B4DF5]" />
                <h3 className="text-sm font-heading font-bold text-[#171A2E] dark:text-white">
                  Upcoming Deadlines
                </h3>
              </div>
              <Link
                to="/calendar"
                className="text-xs font-semibold text-[#5B4DF5] hover:text-[#4B3CE0] dark:text-[#A49DFC] transition-colors"
              >
                Calendar →
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9499AB]">
                No deadlines approaching in the next 10 days.
              </div>
            ) : (
              <div className="divide-y divide-[#E6E9F2]/80 dark:divide-slate-800/80">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetails(item.id)}
                    className="py-3 flex items-center justify-between text-xs cursor-pointer group hover:bg-[#F5F7FB] dark:hover:bg-[#15172F] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 pr-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <SubjectBadge subject={item.subject} size="sm" />
                        <span className="font-semibold text-[#171A2E] dark:text-white truncate group-hover:text-[#5B4DF5] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#9499AB]">
                        Due {formatFriendlyDate(item.due_date)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9499AB] group-hover:text-[#5B4DF5] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Academic Verification Loop Progress Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#19A974]" />
                <h3 className="text-sm font-heading font-bold text-[#171A2E] dark:text-white">
                  Semester Verification Loop
                </h3>
              </div>
              <span className="text-xs font-bold text-[#5B4DF5] dark:text-[#A49DFC]">
                {completionPct}% Complete
              </span>
            </div>

            {/* Progress track (Progress 550ms easeOut) */}
            <div className="w-full bg-[#F5F7FB] dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-[#E6E9F2]/80 dark:border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="bg-gradient-to-r from-[#5B4DF5] via-[#7970D9] to-[#16B8D4] h-full rounded-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-[#F5F7FB] dark:bg-[#15172F]">
                <span className="text-[#9499AB] block text-[10px]">Finished</span>
                <span className="font-bold text-[#171A2E] dark:text-white">
                  {completedCount}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F5F7FB] dark:bg-[#15172F]">
                <span className="text-[#9499AB] block text-[10px]">ERP Uploaded</span>
                <span className="font-bold text-[#7970D9]">
                  {uploadedToErpCount}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F5F7FB] dark:bg-[#15172F]">
                <span className="text-[#9499AB] block text-[10px]">Prof Checked</span>
                <span className="font-bold text-[#19A974]">
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
