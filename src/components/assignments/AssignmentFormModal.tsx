import React, { useState, useEffect } from 'react';
import { AssignmentWithDetails, PriorityLevel, ProgressStatus, FrequencyType } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { createAssignment, updateAssignment } from '@/services/assignmentService';
import { createRecurringSeries } from '@/services/recurringService';
import { getTodayDateString } from '@/utils/dateUtils';
import {
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Repeat,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: AssignmentWithDetails | null;
  defaultDate?: string;
  defaultSubjectId?: string;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  assignmentToEdit,
  defaultDate,
  defaultSubjectId,
}) => {
  const { subjects, refreshData } = useAssignments();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('not_started');
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);

  // Recurrence option for new assignment
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<FrequencyType>('weekly');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title);
      setSubjectId(assignmentToEdit.subject_id);
      setDescription(assignmentToEdit.description || '');
      setAssignedDate(assignmentToEdit.assigned_date || '');
      setDueDate(assignmentToEdit.due_date);
      setPriority(assignmentToEdit.priority);
      setProgressStatus(assignmentToEdit.progress_status);
      setNotes(assignmentToEdit.notes || '');
      setLinks(
        assignmentToEdit.links?.map((l) => ({ title: l.title, url: l.url })) || []
      );
      setIsRecurring(false);
    } else {
      setTitle('');
      setSubjectId(defaultSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
      setDescription('');
      setAssignedDate(getTodayDateString());
      setDueDate(defaultDate || getTodayDateString());
      setPriority('Medium');
      setProgressStatus('not_started');
      setNotes('');
      setLinks([]);
      setIsRecurring(false);
    }
    setError(null);
  }, [assignmentToEdit, defaultDate, defaultSubjectId, subjects, isOpen]);

  if (!isOpen) return null;

  // Warning when due date is before assigned date
  const isDueBeforeAssigned =
    assignedDate && dueDate && dueDate < assignedDate;

  const handleAddLinkRow = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const handleRemoveLinkRow = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!subjectId) {
      setError('Subject is required');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    setLoading(true);

    try {
      if (assignmentToEdit) {
        // Edit existing assignment
        await updateAssignment(assignmentToEdit.id, {
          title: title.trim(),
          subject_id: subjectId,
          description: description.trim() || null,
          assigned_date: assignedDate || null,
          due_date: dueDate,
          priority,
          progress_status: progressStatus,
          notes: notes.trim() || null,
        });
      } else {
        if (isRecurring) {
          // Create recurring tutorial series (generates instances automatically)
          await createRecurringSeries({
            subject_id: subjectId,
            title: title.trim(),
            description: description.trim() || null,
            frequency: recurringFrequency,
            priority,
            start_date: dueDate,
          });
        } else {
          // Create standalone assignment
          await createAssignment({
            title: title.trim(),
            subject_id: subjectId,
            description: description.trim() || null,
            assigned_date: assignedDate || null,
            due_date: dueDate,
            priority,
            progress_status: progressStatus,
            notes: notes.trim() || null,
            links: links.filter((l) => l.url.trim().length > 0),
          });
        }
      }

      await refreshData();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving assignment:', err);
      setError((err as Error).message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 my-8 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {assignmentToEdit ? 'Edit Assignment' : 'Add New Assignment'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {assignmentToEdit
                    ? 'Update assignment details and settings'
                    : 'Track tutorials, assignments, deadlines and progress'}
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Tutorial 4, CPLT Assignment 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                />
              </div>

              {/* Subject & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Manual Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Assigned Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Assigned Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={assignedDate}
                      onChange={(e) => setAssignedDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {isDueBeforeAssigned && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>Warning: Due date is set earlier than assigned date.</span>
                </div>
              )}

              {/* Progress Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Initial Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      progressStatus === 'not_started'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="progressStatus"
                      value="not_started"
                      checked={progressStatus === 'not_started'}
                      onChange={() => setProgressStatus('not_started')}
                      className="sr-only"
                    />
                    <span>Not Started</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      progressStatus === 'in_progress'
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="progressStatus"
                      value="in_progress"
                      checked={progressStatus === 'in_progress'}
                      onChange={() => setProgressStatus('in_progress')}
                      className="sr-only"
                    />
                    <span>In Progress</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief details about the task, requirements, or chapter..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Important hints, professor instructions, formulas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Useful Links (For new assignments) */}
              {!assignmentToEdit && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Useful Links
                    </span>
                    <button
                      type="button"
                      onClick={handleAddLinkRow}
                      className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Link
                    </button>
                  </div>

                  {links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Title (e.g. ERP, Drive)"
                        value={link.title}
                        onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                        className="w-1/3 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recurring Assignment Option (Only for new) */}
              {!assignmentToEdit && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Repeat className="w-3.5 h-3.5 text-brand-500" />
                      <span>Make this a recurring series (e.g. weekly tutorial)</span>
                    </div>
                  </label>

                  {isRecurring && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Frequency:</span>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as FrequencyType)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 Weeks</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <span className="text-[11px] text-slate-400">
                        (Generates instances for the next 10 weeks)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{assignmentToEdit ? 'Save Changes' : 'Create Assignment'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
