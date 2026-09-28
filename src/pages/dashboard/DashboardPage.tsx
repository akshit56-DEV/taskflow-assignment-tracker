import React from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAssignments } from '@/context/AssignmentContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { WeeklyProgressChart } from '@/components/dashboard/WeeklyProgressChart';
import { SubjectOverviewSection } from '@/components/dashboard/SubjectOverviewSection';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getTimeBasedGreeting, getTodayDateString, getCalendarDaysDiff } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import {
  AssignmentWithDetails,
} from '@/types';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
  Flame,
} from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { assignments, loading, setFilters } = useAssignments();
  const { onOpenAddModal, onEditAssignment, onOpenDetails } =
    useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  const greeting = getTimeBasedGreeting();
  const todayStr = getTodayDateString();

  const todayAssignments = assignments.filter((a) => a.due_date === todayStr);
  const overdueAssignments = assignments.filter(
    (a) => !a.completed && a.due_date < todayStr
  );
  const upcomingAssignments = assignments
    .filter((a) => {
      const diff = getCalendarDaysDiff(a.due_date);
      return diff > 0 && diff <= 7 && !a.completed;
    })
    .slice(0, 4);

  const handleStatFilterNavigate = (key: string, val: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
    navigate('/assignments');
  };

  if (loading && assignments.length === 0) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.08 },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8"
    >
      {/* Top Banner & Greeting */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-card relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Sparkles className="w-3 h-3 text-brand-500" />
              Academic Command Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-500 dark:from-brand-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
              {profile?.full_name ||
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                (user?.email ? user.email.split('@')[0] : 'Student')}
            </span>
            !
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Here is your live academic status, submission deadlines, and evaluation tracker.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onOpenAddModal}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:from-brand-800 active:to-indigo-800 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </motion.button>
      </motion.div>

      {/* Interactive Statistics Grid */}
      <motion.div variants={sectionVariants}>
        <DashboardStats onFilterClick={handleStatFilterNavigate} />
      </motion.div>

      {/* Overdue Urgent Alert Section (If any) */}
      {overdueAssignments.length > 0 && (
        <motion.div
          variants={sectionVariants}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50/60 dark:from-red-950/40 dark:to-rose-950/20 border border-red-200/80 dark:border-red-900/60 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400 animate-bounce" />
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                Action Required — Overdue Assignments ({overdueAssignments.length})
              </h3>
            </div>
            <Link
              to="/assignments"
              onClick={() => handleStatFilterNavigate('statusWorkflow', 'overdue')}
              className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueAssignments.slice(0, 3).map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onOpenDetails={() => onOpenDetails(a.id)}
                onEdit={() => onEditAssignment(a)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Grid: Today's Tasks + Upcoming + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Tasks & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <motion.div
            variants={sectionVariants}
            className="glass-card p-5 sm:p-6 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today's Tasks & Deadlines
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {todayAssignments.length} scheduled
              </span>
            </div>

            {todayAssignments.length > 0 ? (
              <div className="space-y-3">
                {todayAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    onOpenDetails={() => onOpenDetails(a.id)}
                    onEdit={() => onEditAssignment(a)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200/70 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No assignments due today!
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  You're all caught up for today's submissions.
                </p>
              </div>
            )}
          </motion.div>

          {/* Upcoming Deadlines (Next 7 days) */}
          <motion.div
            variants={sectionVariants}
            className="glass-card p-5 sm:p-6 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Upcoming This Week
              </h3>
              <Link
                to="/assignments"
                onClick={() => handleStatFilterNavigate('statusWorkflow', 'due_this_week')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                See all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    onOpenDetails={() => onOpenDetails(a.id)}
                    onEdit={() => onEditAssignment(a)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No upcoming deadlines in the next 7 days.
              </p>
            )}
          </motion.div>

          {/* Weekly Progress Visual Chart */}
          <motion.div variants={sectionVariants}>
            <WeeklyProgressChart />
          </motion.div>
        </div>

        {/* Right Column (1 col): Subject Overview & Recent Activity */}
        <div className="space-y-6">
          <motion.div variants={sectionVariants}>
            <SubjectOverviewSection />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <RecentActivityFeed />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
