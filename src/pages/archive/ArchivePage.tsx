import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignments, archiveAssignment } from '@/services/assignmentService';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Archive, Search, RotateCcw } from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const ArchivePage: React.FC = () => {
  const { subjects, refreshData: refreshGlobalData } = useAssignments();
  const { onEditAssignment, onOpenDetails } = useOutletContext<LayoutContextType>();

  const [archivedAssignments, setArchivedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  const loadArchived = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignments({
        isArchived: true,
        isDeleted: false,
        filters: {
          searchQuery,
          subjectId: selectedSubjectId,
        },
      });
      setArchivedAssignments(data);
    } catch (err) {
      console.error('Error loading archive:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubjectId]);

  useEffect(() => {
    loadArchived();
  }, [loadArchived]);

  const handleUnarchive = async (id: string) => {
    try {
      await archiveAssignment(id, false);
      await loadArchived();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error unarchiving:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Archived tasks and completed submissions preserved for future academic reference
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search archived assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading && archivedAssignments.length === 0 ? (
        <LoadingSpinner message="Loading academic archive..." />
      ) : archivedAssignments.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived assignments"
          description="Assignments you archive will appear here so you can revisit past tutorials, solutions, and files anytime."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedAssignments.map((assignment) => (
            <div key={assignment.id} className="relative group">
              <AssignmentCard
                assignment={assignment}
                onOpenDetails={() => onOpenDetails(assignment.id)}
                onEdit={() => onEditAssignment(assignment)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleUnarchive(assignment.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore to active tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
