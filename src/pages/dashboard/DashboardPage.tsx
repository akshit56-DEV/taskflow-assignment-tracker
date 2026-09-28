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
import {
  AssignmentWithDetails,
} from '@/types';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Overview
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting},{' '}
            {profile?.full_name ||
              user?.user_metadata?.full_name ||
              user?.user_metadata?.name ||
              (user?.email ? user.email.split('@')[0] : 'Student')}
            !
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your academic overview and upcoming submission deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Interactive Statistics Grid */}
      <DashboardStats onFilterClick={handleStatFilterNavigate} />

      {/* Overdue Urgent Alert Section (If any) */}
      {overdueAssignments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                Overdue Assignments ({overdueAssignments.length})
              </h3>
            </div>
            <Link
              to="/assignments"
              onClick={() => handleStatFilterNavigate('statusWorkflow', 'overdue')}
              className="text-xs font-semibold text-red-700 dark:text-red-300 hover:underline inline-flex items-center gap-1"
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
        </div>
      )}

      {/* Main Grid: Today's Tasks + Upcoming + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Tasks & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today's Tasks & Deadlines
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
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
              <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No assignments due today!
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  You're all caught up for today's deadlines.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines (Next 7 days) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Upcoming This Week
              </h3>
              <Link
                to="/assignments"
                onClick={() => handleStatFilterNavigate('statusWorkflow', 'due_this_week')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
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
          </div>

          {/* Weekly Progress Visual Chart */}
          <WeeklyProgressChart />
        </div>

        {/* Right Column (1 col): Subject Overview & Recent Activity */}
        <div className="space-y-6">
          <SubjectOverviewSection />
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};
