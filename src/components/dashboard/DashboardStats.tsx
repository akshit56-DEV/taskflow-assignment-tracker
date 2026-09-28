import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import {
  ListTodo,
  Calendar,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  TrendingUp,
} from 'lucide-react';

interface DashboardStatsProps {
  onFilterClick?: (filterType: string, value: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onFilterClick }) => {
  const { stats, setFilters } = useAssignments();

  const handleStatClick = (workflowStage: string) => {
    if (onFilterClick) {
      onFilterClick('statusWorkflow', workflowStage);
    } else {
      setFilters((prev) => ({
        ...prev,
        statusWorkflow: workflowStage as typeof prev.statusWorkflow,
      }));
    }
  };

  const statCards = [
    {
      label: 'Total Assignments',
      value: stats.total,
      subtext: `${stats.completed} completed`,
      icon: ListTodo,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/40',
      border: 'border-brand-200/80 dark:border-brand-900/60',
      action: () => handleStatClick('all'),
    },
    {
      label: 'Due Today',
      value: stats.dueToday,
      subtext: stats.dueToday === 0 ? 'All done for today' : 'Requires immediate attention',
      icon: Calendar,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200/80 dark:border-rose-900/60',
      action: () => handleStatClick('due_today'),
    },
    {
      label: 'Due This Week',
      value: stats.dueThisWeek,
      subtext: 'Next 7 days',
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200/80 dark:border-blue-900/60',
      action: () => handleStatClick('due_this_week'),
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      subtext: stats.overdue > 0 ? 'Needs submission' : 'No overdue tasks',
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200/80 dark:border-red-900/60',
      action: () => handleStatClick('overdue'),
    },
    {
      label: 'Completed',
      value: stats.completed,
      subtext: `${stats.completionPercentage}% overall completion`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200/80 dark:border-emerald-900/60',
      action: () => handleStatClick('completed'),
    },
    {
      label: 'Pending ERP Upload',
      value: stats.completedNotErp,
      subtext: 'Completed but not on ERP',
      icon: UploadCloud,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200/80 dark:border-amber-900/60',
      action: () => {
        setFilters((prev) => ({
          ...prev,
          statusWorkflow: 'completed',
          uploadedToErp: 'no',
        }));
      },
    },
    {
      label: 'Pending Professor Check',
      value: stats.pendingCheck,
      subtext: 'Uploaded, awaiting signoff',
      icon: CheckCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200/80 dark:border-purple-900/60',
      action: () => {
        setFilters((prev) => ({
          ...prev,
          uploadedToErp: 'yes',
          professorChecked: 'no',
        }));
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={card.action}
            className={`p-4 rounded-2xl border text-left bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-200 group flex flex-col justify-between ${card.border}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {card.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
