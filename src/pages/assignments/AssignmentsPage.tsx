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
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Assignments & Tutorials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your academic workload, submissions, and evaluation status
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03, translateY: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </motion.button>
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
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                >
                  <AssignmentCard
                    assignment={assignment}
                    onOpenDetails={() => onOpenDetails(assignment.id)}
                    onEdit={() => onEditAssignment(assignment)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="kanban-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanBoard
                assignments={assignments}
                onOpenDetails={(a) => onOpenDetails(a.id)}
                onEdit={onEditAssignment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
