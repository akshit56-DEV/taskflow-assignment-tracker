import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { motion } from 'framer-motion';
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
      bg: 'bg-brand-50/80 dark:bg-brand-950/40',
      border: 'border-brand-200/80 dark:border-brand-900/50',
      gradient: 'from-brand-500/10 via-transparent to-transparent',
      line: 'bg-brand-500',
      action: () => handleStatClick('all'),
    },
    {
      label: 'Due Today',
      value: stats.dueToday,
      subtext: stats.dueToday === 0 ? 'All done for today' : 'Requires immediate attention',
      icon: Calendar,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50/80 dark:bg-rose-950/40',
      border: 'border-rose-200/80 dark:border-rose-900/50',
      gradient: 'from-rose-500/10 via-transparent to-transparent',
      line: 'bg-rose-500',
      action: () => handleStatClick('due_today'),
    },
    {
      label: 'Due This Week',
      value: stats.dueThisWeek,
      subtext: 'Next 7 days schedule',
      icon: TrendingUp,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50/80 dark:bg-sky-950/40',
      border: 'border-sky-200/80 dark:border-sky-900/50',
      gradient: 'from-sky-500/10 via-transparent to-transparent',
      line: 'bg-sky-500',
      action: () => handleStatClick('due_this_week'),
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      subtext: stats.overdue > 0 ? 'Needs submission' : 'No overdue tasks',
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50/80 dark:bg-red-950/40',
      border: 'border-red-200/80 dark:border-red-900/50',
      gradient: 'from-red-500/10 via-transparent to-transparent',
      line: 'bg-red-500',
      action: () => handleStatClick('overdue'),
    },
    {
      label: 'Completed',
      value: stats.completed,
      subtext: `${stats.completionPercentage}% overall completion`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      border: 'border-emerald-200/80 dark:border-emerald-900/50',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
      line: 'bg-emerald-500',
      action: () => handleStatClick('completed'),
    },
    {
      label: 'Pending ERP Upload',
      value: stats.completedNotErp,
      subtext: 'Completed, pending ERP',
      icon: UploadCloud,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
      line: 'bg-amber-500',
      action: () => {
        setFilters((prev) => ({
          ...prev,
          statusWorkflow: 'completed',
          uploadedToErp: 'no',
        }));
      },
    },
    {
      label: 'Pending Prof Check',
      value: stats.pendingCheck,
      subtext: 'Uploaded, awaiting check',
      icon: CheckCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50/80 dark:bg-purple-950/40',
      border: 'border-purple-200/80 dark:border-purple-900/50',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
      line: 'bg-purple-500',
      action: () => {
        setFilters((prev) => ({
          ...prev,
          uploadedToErp: 'yes',
          professorChecked: 'no',
        }));
      },
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.button
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={card.action}
            className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl glass-card text-left transition-shadow duration-200 group flex flex-col justify-between ${card.border}`}
          >
            {/* Ambient inner subtle gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
            />

            {/* Top accent glow line */}
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 ${card.line} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-0.5 tracking-tight">
                <AnimatedCounter value={card.value} />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">
                {card.subtext}
              </p>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
