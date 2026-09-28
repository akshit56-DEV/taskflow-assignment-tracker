import React, { useState, useEffect, useCallback } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import {
  getAssignments,
  restoreAssignment,
  permanentDeleteAssignment,
} from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatFriendlyDate } from '@/utils/dateUtils';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export const TrashPage: React.FC = () => {
  const { refreshData: refreshGlobalData } = useAssignments();
  const [deletedAssignments, setDeletedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm delete state
  const [targetToDelete, setTargetToDelete] = useState<AssignmentWithDetails | null>(null);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);

  const loadDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignments({
        isDeleted: true,
      });
      setDeletedAssignments(data);
    } catch (err) {
      console.error('Error loading trash:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeleted();
  }, [loadDeleted]);

  const handleRestore = async (id: string) => {
    try {
      await restoreAssignment(id);
      await loadDeleted();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error restoring assignment:', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!targetToDelete) return;
    setIsDeletingPermanently(true);
    try {
      await permanentDeleteAssignment(targetToDelete.id);
      setTargetToDelete(null);
      await loadDeleted();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error permanently deleting assignment:', err);
    } finally {
      setIsDeletingPermanently(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Recycle Bin / Trash
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Items in trash can be restored back to your active list or permanently erased
        </p>
      </div>

      {loading && deletedAssignments.length === 0 ? (
        <LoadingSpinner message="Loading trash items..." />
      ) : deletedAssignments.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Deleted assignments and tutorials will appear here so you can recover them if removed accidentally."
        />
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>
              Permanent deletion will also remove any uploaded attachments from cloud storage.
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {deletedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SubjectBadge subject={assignment.subject} size="sm" />
                    <span className="text-xs text-slate-400">
                      Due: {formatFriendlyDate(assignment.due_date)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {assignment.title}
                  </h4>
                  {assignment.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {assignment.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleRestore(assignment.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetToDelete(assignment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanent Delete */}
      <ConfirmModal
        isOpen={!!targetToDelete}
        title="Permanently Delete Assignment?"
        message={`Are you sure you want to permanently erase "${targetToDelete?.title}"? This action cannot be undone and will delete all attachments and links.`}
        confirmLabel="Erase Permanently"
        isDestructive
        isLoading={isDeletingPermanently}
        onConfirm={handlePermanentDelete}
        onCancel={() => setTargetToDelete(null)}
      />
    </div>
  );
};
