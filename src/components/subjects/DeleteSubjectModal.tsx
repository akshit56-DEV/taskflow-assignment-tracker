import React, { useState, useEffect } from 'react';
import { Subject } from '@/types';
import {
  getSubjectAssignmentCount,
  deleteSubject,
  archiveSubject,
} from '@/services/subjectService';
import { AlertTriangle, X, Archive, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  allSubjects: Subject[];
  onSuccess: () => void;
}

export const DeleteSubjectModal: React.FC<DeleteSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  allSubjects,
  onSuccess,
}) => {
  const [assignmentCount, setAssignmentCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reassignSubjectId, setReassignSubjectId] = useState<string>('');
  const [mode, setMode] = useState<'reassign' | 'archive' | 'direct'>('reassign');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && subject) {
      setLoadingCount(true);
      setError(null);
      getSubjectAssignmentCount(subject.id)
        .then((count) => {
          setAssignmentCount(count);
          if (count > 0) {
            setMode('reassign');
            const other = allSubjects.find((s) => s.id !== subject.id);
            if (other) setReassignSubjectId(other.id);
          } else {
            setMode('direct');
          }
        })
        .finally(() => setLoadingCount(false));
    }
  }, [isOpen, subject, allSubjects]);

  const otherSubjects = allSubjects.filter((s) => s.id !== (subject?.id || ''));

  const handleExecute = async () => {
    if (!subject) return;
    setActionLoading(true);
    setError(null);

    try {
      if (mode === 'archive') {
        await archiveSubject(subject.id, true);
      } else if (mode === 'reassign') {
        if (!reassignSubjectId) {
          throw new Error('Please select a subject to reassign assignments to.');
        }
        await deleteSubject(subject.id, reassignSubjectId);
      } else {
        await deleteSubject(subject.id);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error handling subject deletion/archive:', err);
      setError((err as Error).message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && subject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delete Subject: {subject.name}
                </h3>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {loadingCount ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking assignments...
              </div>
            ) : assignmentCount > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>{subject.name}</strong> currently has{' '}
                  <span className="font-bold underline">{assignmentCount} active assignments</span>. To
                  protect your academic records, please select a safe workflow:
                </div>

                <div className="space-y-2">
                  {/* Option 1: Reassign */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'reassign'
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deleteMode"
                      value="reassign"
                      checked={mode === 'reassign'}
                      onChange={() => setMode('reassign')}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                        Reassign all {assignmentCount} assignments to another subject
                      </span>
                      {mode === 'reassign' && (
                        <select
                          value={reassignSubjectId}
                          onChange={(e) => setReassignSubjectId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          {otherSubjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code || 'No code'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>

                  {/* Option 2: Archive */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'archive'
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deleteMode"
                      value="archive"
                      checked={mode === 'archive'}
                      onChange={() => setMode('archive')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Archive className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        Archive subject instead (Recommended)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Hides it from the main subject list while preserving all past assignments and
                        history.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 py-2">
                Are you sure you want to delete <strong>{subject.name}</strong>? This subject has no
                associated assignments.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecute}
                disabled={actionLoading || loadingCount}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'archive' ? (
                  <Archive className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{mode === 'archive' ? 'Archive Subject' : 'Delete & Complete'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
