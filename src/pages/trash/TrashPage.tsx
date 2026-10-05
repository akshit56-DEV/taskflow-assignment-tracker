import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import {
  getAssignments,
  restoreAssignment,
  permanentDeleteAssignment,
} from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { formatFriendlyDate } from '@/utils/dateUtils';
import { Trash2, RotateCcw, Info } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export const TrashPage: React.FC = () => {
  const { refreshData: refreshGlobalData } = useAssignments();
  const [deletedAssignments, setDeletedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Confirm delete state (Figma CONFIRMATION STATE)
  const [targetToDelete, setTargetToDelete] = useState<AssignmentWithDetails | null>(null);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

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
    setRestoringId(id);
    try {
      await restoreAssignment(id);
      await loadDeleted();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error restoring assignment:', err);
    } finally {
      setRestoringId(null);
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

  const handleEmptyTrash = async () => {
    if (deletedAssignments.length === 0) return;
    if (window.confirm('Permanently delete all items in trash? This cannot be undone.')) {
      setIsEmptyingTrash(true);
      try {
        for (const item of deletedAssignments) {
          await permanentDeleteAssignment(item.id);
        }
        await loadDeleted();
        await refreshGlobalData();
      } catch (err) {
        console.error('Error emptying trash:', err);
      } finally {
        setIsEmptyingTrash(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header (Figma #3:74074: Trash / A second chance before a final goodbye.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Trash
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            A second chance before a final goodbye.
          </p>
        </div>

        {deletedAssignments.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            disabled={isEmptyingTrash}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#FDEEF1] dark:bg-[#D34D61]/15 text-[#D34D61] hover:bg-[#FDEEF1]/80 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty trash</span>
          </button>
        )}
      </div>

      {/* Subheader Note (Figma #3:74074) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle flex items-center gap-3 text-xs text-[#66718C] dark:text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#4355ED] shrink-0" />
        <span>Restore deleted items anytime. Permanent deletion removes the item and its history forever.</span>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#18223F] dark:text-white">
        <span>Deleted items · {deletedAssignments.length} items</span>
      </div>

      {loading && deletedAssignments.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ) : deletedAssignments.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is clean"
          description="Your trash is completely empty. Deleted items will be preserved here safely until you choose to empty it."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-[#E5E9F3] dark:divide-[#1E293B] rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] shadow-tf-subtle overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            {deletedAssignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                layout
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F7FC]/60 dark:hover:bg-[#1E293B]/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SubjectBadge subject={assignment.subject} size="sm" />
                    <span className="text-xs text-[#939CB1]">
                      Due: {formatFriendlyDate(assignment.due_date)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#18223F] dark:text-white">
                    {assignment.title}
                  </h3>
                  {assignment.description && (
                    <p className="text-xs text-[#66718C] dark:text-[#94A3B8] line-clamp-1">
                      {assignment.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleRestore(assignment.id)}
                    disabled={restoringId === assignment.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4355ED] hover:bg-[#EEF0FF] dark:hover:bg-[#4355ED]/20 rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${restoringId === assignment.id ? 'animate-spin' : ''}`} />
                    <span>Restore</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setTargetToDelete(assignment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete permanently</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirmation Modal for Permanent Delete (Figma CONFIRMATION STATE #3:74074) */}
      {targetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E5E9F3] dark:border-[#1E293B] shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDEEF1] dark:bg-[#D34D61]/20 flex items-center justify-center text-[#D34D61]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18223F] dark:text-white">
                  Permanently delete {targetToDelete.title}?
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              This action cannot be undone. All attachments and milestone history will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTargetToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#66718C] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] cursor-pointer"
              >
                Keep item
              </button>
              <button
                type="button"
                disabled={isDeletingPermanently}
                onClick={handlePermanentDelete}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D34D61] hover:bg-[#D34D61]/90 text-white cursor-pointer"
              >
                {isDeletingPermanently ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
