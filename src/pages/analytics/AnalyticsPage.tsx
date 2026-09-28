import React from 'react';
import { motion } from 'framer-motion';
import { useAssignments } from '@/context/AssignmentContext';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

const STAGE_COLORS = {
  not_started: '#94a3b8',
  in_progress: '#38bdf8',
  completed: '#10b981',
  uploaded: '#6366f1',
  checked: '#a855f7',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
};

export const AnalyticsPage: React.FC = () => {
  const { assignments, subjects, stats } = useAssignments();

  // 1. Data by Subject
  const subjectChartData = subjects.map((sub) => {
    const subAssignments = assignments.filter((a) => a.subject_id === sub.id);
    const completed = subAssignments.filter((a) => a.completed).length;
    const pending = subAssignments.length - completed;

    return {
      name: sub.name,
      Completed: completed,
      Pending: pending,
      color: sub.color,
    };
  });

  // 2. Data by Workflow Stage
  const stageCounts = assignments.reduce(
    (acc, curr) => {
      const stage = getDerivedWorkflowStage(curr);
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    },
    {
      not_started: 0,
      in_progress: 0,
      completed: 0,
      uploaded: 0,
      checked: 0,
    } as Record<string, number>
  );

  const stageChartData = [
    { name: 'Not Started', value: stageCounts.not_started, color: STAGE_COLORS.not_started },
    { name: 'In Progress', value: stageCounts.in_progress, color: STAGE_COLORS.in_progress },
    { name: 'Completed', value: stageCounts.completed, color: STAGE_COLORS.completed },
    { name: 'Uploaded to ERP', value: stageCounts.uploaded, color: STAGE_COLORS.uploaded },
    { name: 'Professor Checked', value: stageCounts.checked, color: STAGE_COLORS.checked },
  ].filter((item) => item.value > 0);

  // 3. Priority Distribution
  const priorityData = [
    { name: 'Urgent', count: assignments.filter((a) => a.priority === 'Urgent').length, fill: '#f43f5e' },
    { name: 'High', count: assignments.filter((a) => a.priority === 'High').length, fill: '#f59e0b' },
    { name: 'Medium', count: assignments.filter((a) => a.priority === 'Medium').length, fill: '#3b82f6' },
    { name: 'Low', count: assignments.filter((a) => a.priority === 'Low').length, fill: '#94a3b8' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Analytics & Metrics
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            Live Insights
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive statistics on workload completion, ERP submission compliance, and faculty evaluation rates
        </p>
      </div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            <AnimatedCounter value={stats.completionPercentage} suffix="%" />
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed} of {stats.total} assignments finished
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ERP Upload Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            <AnimatedCounter value={stats.erpUploadRate} suffix="%" />
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed - stats.pendingErp} of {stats.completed} uploaded
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Prof. Check Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            <AnimatedCounter value={stats.professorCheckRate} suffix="%" />
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed - stats.pendingCheck} assignments evaluated
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            <AnimatedCounter value={stats.overdue} />
          </div>
          <p className="text-xs text-slate-400">
            {stats.overdue === 0 ? 'Zero overdue tasks!' : 'Requires urgent catch-up'}
          </p>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Assignments by Subject */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Workload by Subject
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Completed vs Pending tasks per academic subject</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Workflow Stage Distribution */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Workflow Stage Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Distribution across execution lifecycle</p>
          </div>

          <div className="h-72 w-full">
            {stageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No assignments to display.
              </div>
            )}
          </div>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Priority Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Assignments grouped by urgency level</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
