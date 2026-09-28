import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { KanbanBoard } from '@/components/assignments/KanbanBoard';
import { FilterBar } from '@/components/assignments/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AssignmentWithDetails } from '@/types';
import { Plus, ListTodo, Search } from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const AssignmentsPage: React.FC = () => {
  const { assignments, loading, filters, resetFilters } = useAssignments();
  const { onOpenAddModal, onEditAssignment, onOpenDetails } =
    useOutletContext<LayoutContextType>();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const hasSearchOrFilter =
    filters.searchQuery !== '' ||
    filters.statusWorkflow !== 'all' ||
    filters.subjectId !== 'all' ||
    filters.priority !== 'all' ||
    filters.uploadedToErp !== 'all' ||
    filters.professorChecked !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Assignments & Tutorials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your academic workload, submissions, and evaluation status
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Filter & Sort Controls */}
      <FilterBar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Content Area */}
      {loading && assignments.length === 0 ? (
        <LoadingSpinner message="Loading assignments..." />
      ) : assignments.length === 0 ? (
        hasSearchOrFilter ? (
          <EmptyState
            icon={Search}
            title="No matching assignments"
            description="No assignments matched your active search query or selected filter criteria."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        ) : (
          <EmptyState
            icon={ListTodo}
            title="No assignments yet"
            description="You haven't created any assignments or tutorials. Start tracking your academic work now!"
            actionLabel="+ Create Assignment"
            onAction={onOpenAddModal}
          />
        )
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onOpenDetails={() => onOpenDetails(assignment.id)}
              onEdit={() => onEditAssignment(assignment)}
            />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <KanbanBoard
            assignments={assignments}
            onOpenDetails={(a) => onOpenDetails(a.id)}
            onEdit={onEditAssignment}
          />
        </div>
      )}
    </div>
  );
};
