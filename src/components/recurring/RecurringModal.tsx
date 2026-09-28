import React, { useState, useEffect } from 'react';
import { RecurringAssignment, FrequencyType, PriorityLevel } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { createRecurringSeries, updateRecurringSeries } from '@/services/recurringService';
import { getTodayDateString } from '@/utils/dateUtils';
import { X, Repeat, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesToEdit?: RecurringAssignment | null;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { val: 1, label: 'Monday' },
  { val: 2, label: 'Tuesday' },
  { val: 3, label: 'Wednesday' },
  { val: 4, label: 'Thursday' },
  { val: 5, label: 'Friday' },
  { val: 6, label: 'Saturday' },
  { val: 0, label: 'Sunday' },
];

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  seriesToEdit,
  onSuccess,
}) => {
  const { subjects, refreshData } = useAssignments();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seriesToEdit) {
      setTitle(seriesToEdit.title);
      setSubjectId(seriesToEdit.subject_id);
      setDescription(seriesToEdit.description || '');
      setFrequency(seriesToEdit.frequency);
      setDayOfWeek(seriesToEdit.day_of_week ?? 1);
      setPriority(seriesToEdit.priority);
      setStartDate(seriesToEdit.start_date);
      setEndDate(seriesToEdit.end_date || '');
    } else {
      setTitle('');
      setSubjectId(subjects.length > 0 ? subjects[0].id : '');
      setDescription('');
      setFrequency('weekly');
      setDayOfWeek(1);
      setPriority('Medium');
      setStartDate(getTodayDateString());
      setEndDate('');
    }
    setError(null);
  }, [seriesToEdit, subjects, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!subjectId) {
      setError('Subject is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (seriesToEdit) {
        await updateRecurringSeries(seriesToEdit.id, {
          title: title.trim(),
          subject_id: subjectId,
          description: description.trim() || null,
          frequency,
          day_of_week: dayOfWeek,
          priority,
          start_date: startDate,
          end_date: endDate || null,
        });
      } else {
        await createRecurringSeries({
          title: title.trim(),
          subject_id: subjectId,
          description: description.trim() || null,
          frequency,
          day_of_week: dayOfWeek,
          priority,
          start_date: startDate,
          end_date: endDate || null,
        });
      }

      await refreshData();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving recurring series:', err);
      setError((err as Error).message || 'Failed to save recurring series');
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
            className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Repeat className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {seriesToEdit ? 'Edit Recurring Tutorial' : 'New Recurring Tutorial Series'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Series Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly CPLT Tutorial, Physics Lab Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.val} value={d.val}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Recurring instructions, submission guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-xl text-[11px] text-brand-800 dark:text-brand-300">
                TaskFlow will automatically generate a finite 10-week window of tutorial tasks,
                preventing infinite database clutter.
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
                  <span>{seriesToEdit ? 'Save Changes' : 'Create Series'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
