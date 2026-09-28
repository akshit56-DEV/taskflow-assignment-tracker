import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
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
} from 'lucide-react';

const STAGE_COLORS = {
  not_started: '#94a3b8',
  in_progress: '#38bdf8',
  completed: '#10b981',
  uploaded: '#6366f1',
  checked: '#a855f7',
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Academic Analytics & Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive statistics on workload completion, ERP submission rate, and evaluations
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.completionPercentage}%
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed} of {stats.total} assignments finished
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ERP Upload Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.erpUploadRate}%
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed - stats.pendingErp} of {stats.completed} uploaded
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Prof. Check Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.professorCheckRate}%
          </div>
          <p className="text-xs text-slate-400">
            {stats.completed - stats.pendingCheck} assignments evaluated
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.overdue}
          </div>
          <p className="text-xs text-slate-400">
            {stats.overdue === 0 ? 'Zero overdue tasks!' : 'Requires urgent catch-up'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments by Subject */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Workload by Subject
          </h3>
          <p className="text-xs text-slate-500 mb-4">Completed vs Pending tasks per subject</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workflow Stage Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Workflow Stage Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Current progress distribution</p>

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
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
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
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Priority Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Assignments grouped by priority level</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
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
        </div>
      </div>
    </div>
  );
};
