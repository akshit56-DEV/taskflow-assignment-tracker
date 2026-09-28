import React, { useState, useEffect } from 'react';
import { Subject } from '@/types';
import { createSubject, updateSubject } from '@/services/subjectService';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
  onSuccess: () => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#84cc16', // Lime
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code || '');
      setColor(subjectToEdit.color || COLOR_OPTIONS[0]);
    } else {
      setName('');
      setCode('');
      setColor(COLOR_OPTIONS[0]);
    }
    setError(null);
  }, [subjectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (subjectToEdit) {
        await updateSubject(subjectToEdit.id, {
          name: name.trim(),
          code: code.trim() || null,
          color,
        });
      } else {
        await createSubject({
          name: name.trim(),
          code: code.trim() || null,
          color,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving subject:', err);
      setError((err as Error).message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {subjectToEdit ? 'Edit Subject' : 'Add Subject'}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Data Structures"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Subject Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PHY101, CS202"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_OPTIONS.map((c) => (
                    <motion.button
                      key={c}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-shadow ${
                        color === c ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-md' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{subjectToEdit ? 'Save Changes' : 'Create Subject'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
