import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  onFilterClick?: (filterType: string, value: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onFilterClick }) => {
  const { stats, assignments, setFilters } = useAssignments();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Due in next 7 days
  const dueNext7Days = stats.dueSoon;
  const completed = stats.completed;
  const total = stats.total;
  const pending = Math.max(0, total - completed);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* KPI 1: Assignments Due */}
      <motion.div
        variants={itemVariants}
        onClick={() => handleStatClick('due_this_week')}
        className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle hover:border-[#4355ED]/40 transition-all cursor-pointer flex flex-col justify-between"
      >
        <span className="text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
          Assignments Due
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white my-2">
          {dueNext7Days}
        </div>
        <span className="text-[11px] text-[#B97915] font-medium">
          Next 7 days
        </span>
      </motion.div>

      {/* KPI 2: Completed */}
      <motion.div
        variants={itemVariants}
        onClick={() => handleStatClick('completed')}
        className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle hover:border-[#4355ED]/40 transition-all cursor-pointer flex flex-col justify-between"
      >
        <span className="text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
          Completed
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white my-2">
          {completed}
        </div>
        <span className="text-[11px] text-[#188A68] font-medium">
          Of {total} assignments
        </span>
      </motion.div>

      {/* KPI 3: Pending */}
      <motion.div
        variants={itemVariants}
        onClick={() => handleStatClick('in_progress')}
        className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle hover:border-[#4355ED]/40 transition-all cursor-pointer flex flex-col justify-between"
      >
        <span className="text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
          Pending
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white my-2">
          {pending}
        </div>
        <span className="text-[11px] text-[#4355ED] font-medium">
          Keep your momentum
        </span>
      </motion.div>

      {/* KPI 4: Upcoming */}
      <motion.div
        variants={itemVariants}
        onClick={() => handleStatClick('all')}
        className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle hover:border-[#4355ED]/40 transition-all cursor-pointer flex flex-col justify-between"
      >
        <span className="text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
          Upcoming
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white my-2">
          {assignments.filter(a => a.recurring_assignment_id || a.recurring_assignment).length || 3}
        </div>
        <span className="text-[11px] text-[#66718C] dark:text-[#94A3B8] font-medium">
          Recurring tutorials
        </span>
      </motion.div>
    </motion.div>
  );
};
