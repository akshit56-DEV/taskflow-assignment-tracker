import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { formatDateToIsoDate } from '@/utils/dateUtils';

export const WeeklyProgressChart: React.FC = () => {
  const { assignments } = useAssignments();

  // Generate 7 days of current week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sun
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek + 1); // Monday start

  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDateToIsoDate(dayDate);
    const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

    const dueCount = assignments.filter((a) => a.due_date === dateStr).length;
    const completedCount = assignments.filter(
      (a) => a.completed_at && a.completed_at.startsWith(dateStr)
    ).length;

    return {
      day: dayLabel,
      date: dateStr,
      Due: dueCount,
      Completed: completedCount,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Weekly Activity & Deadlines
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deadlines and completions across the current week
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
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
            <Bar dataKey="Due" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
