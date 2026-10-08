import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const SubjectOverviewSection: React.FC = () => {
  const { subjects, assignments, setFilters } = useAssignments();

  const handleSubjectClick = (subjectId: string) => {
    setFilters((prev) => ({
      ...prev,
      subjectId,
      statusWorkflow: 'all',
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Subject Progress
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completion rates across your academic subjects
          </p>
        </div>
        <Link
          to="/subjects"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {subjects.map((sub) => {
          const subAssignments = assignments.filter((a) => a.subject_id === sub.id);
          const total = subAssignments.length;
          const completed = subAssignments.filter((a) => a.completed).length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={sub.id}
              onClick={() => handleSubjectClick(sub.id)}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {sub.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: sub.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {completed}/{total} tasks done
                </span>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No subjects configured yet.
          </div>
        )}
      </div>
    </div>
  );
};
