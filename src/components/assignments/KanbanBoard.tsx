import React from 'react';
import { AssignmentWithDetails, DerivedWorkflowStage } from '@/types';
import { AssignmentCard } from './AssignmentCard';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import { Circle, PlayCircle, CheckCircle2, UploadCloud, CheckCheck } from 'lucide-react';

interface KanbanBoardProps {
  assignments: AssignmentWithDetails[];
  onOpenDetails: (assignment: AssignmentWithDetails) => void;
  onEdit: (assignment: AssignmentWithDetails) => void;
}

interface ColumnDef {
  id: DerivedWorkflowStage;
  title: string;
  icon: React.ReactNode;
  headerBg: string;
  badgeBg: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'not_started',
    title: 'Not Started',
    icon: <Circle className="w-4 h-4 text-slate-400" />,
    headerBg: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: <PlayCircle className="w-4 h-4 text-sky-500" />,
    headerBg: 'border-sky-300 dark:border-sky-800',
    badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    headerBg: 'border-emerald-300 dark:border-emerald-800',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  {
    id: 'uploaded',
    title: 'Uploaded (ERP)',
    icon: <UploadCloud className="w-4 h-4 text-indigo-500" />,
    headerBg: 'border-indigo-300 dark:border-indigo-800',
    badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  },
  {
    id: 'checked',
    title: 'Checked',
    icon: <CheckCheck className="w-4 h-4 text-purple-500" />,
    headerBg: 'border-purple-300 dark:border-purple-800',
    badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  assignments,
  onOpenDetails,
  onEdit,
}) => {
  // Group assignments by derived stage
  const grouped = assignments.reduce<Record<DerivedWorkflowStage, AssignmentWithDetails[]>>(
    (acc, curr) => {
      const stage = getDerivedWorkflowStage(curr);
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(curr);
      return acc;
    },
    {
      not_started: [],
      in_progress: [],
      completed: [],
      uploaded: [],
      checked: [],
    }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnAssignments = grouped[col.id] || [];

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-3 min-w-[280px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-3">
              <div className="flex items-center gap-2">
                {col.icon}
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {col.title}
                </h4>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                {columnAssignments.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {columnAssignments.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl text-xs text-slate-400">
                  No assignments
                </div>
              ) : (
                columnAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
