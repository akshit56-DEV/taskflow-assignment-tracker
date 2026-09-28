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
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatFriendlyDate } from '@/utils/dateUtils';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

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
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export const TrashPage: React.FC = () => {
  const { refreshData: refreshGlobalData } = useAssignments();
  const [deletedAssignments, setDeletedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Recycle Bin / Trash
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Trash2 className="w-3 h-3" />
            {deletedAssignments.length} Items
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Items in trash can be restored back to your active list or permanently erased from database
        </p>
      </div>

      {loading && deletedAssignments.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="p-4 rounded-2xl glass-card space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ) : deletedAssignments.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Deleted assignments and tutorials will appear here so you can recover them if removed accidentally."
        />
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>
              Permanent deletion will completely remove records and purge uploaded attachments from cloud storage.
            </span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 glass-card overflow-hidden shadow-sm"
          >
            <AnimatePresence mode="popLayout">
              {deletedAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  variants={itemVariants}
                  layout
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SubjectBadge subject={assignment.subject} size="sm" />
                      <span className="text-xs text-slate-400 font-mono">
                        Due: {formatFriendlyDate(assignment.due_date)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {assignment.title}
                    </h4>
                    {assignment.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRestore(assignment.id)}
                      disabled={restoringId === assignment.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/60 dark:text-brand-400 rounded-xl transition-all shadow-sm border border-brand-500/20"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${restoringId === assignment.id ? 'animate-spin' : ''}`} />
                      Restore
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setTargetToDelete(assignment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl transition-all border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Forever
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
    </motion.div>
  );
};
