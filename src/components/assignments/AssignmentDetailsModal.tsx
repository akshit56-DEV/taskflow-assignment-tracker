import React, { useState, useEffect, useCallback } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignmentById } from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { WorkflowBadge } from '@/components/common/WorkflowBadge';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';
import { LinkManager } from '@/components/links/LinkManager';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import {
  formatFriendlyDate,
  formatFriendlyDateTime,
  getCalendarDaysDiff,
  getDeadlineUrgency,
  formatDateToIsoDate,
} from '@/utils/dateUtils';
import {
  X,
  CheckSquare,
  Square,
  UploadCloud,
  CheckCheck,
  Edit2,
  Trash2,
  Archive,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssignmentDetailsModalProps {
  assignmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (assignment: AssignmentWithDetails) => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  assignmentId,
  isOpen,
  onClose,
  onEdit,
}) => {
  const {
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
    deleteAssignmentQuick,
    archiveAssignmentQuick,
  } = useAssignments();

  const [assignment, setAssignment] = useState<AssignmentWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Editable dates
  const [editingErpDate, setEditingErpDate] = useState(false);
  const [erpDateInput, setErpDateInput] = useState('');

  const [editingCheckDate, setEditingCheckDate] = useState(false);
  const [checkDateInput, setCheckDateInput] = useState('');

  const loadDetails = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    try {
      const data = await getAssignmentById(assignmentId);
      setAssignment(data);
      if (data?.erp_upload_date) {
        setErpDateInput(data.erp_upload_date.split('T')[0]);
      }
      if (data?.checked_at) {
        setCheckDateInput(data.checked_at.split('T')[0]);
      }
    } catch (err) {
      console.error('Error loading assignment details:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (isOpen && assignmentId) {
      loadDetails();
    } else {
      setAssignment(null);
    }
  }, [isOpen, assignmentId, loadDetails]);

  if (!isOpen || !assignmentId) return null;

  const derivedStage = assignment ? getDerivedWorkflowStage(assignment) : 'not_started';
  const daysDiff = assignment ? getCalendarDaysDiff(assignment.due_date) : 0;
  const urgency = assignment ? getDeadlineUrgency(assignment.due_date, assignment.completed) : 'Normal';

  const handleCompleteToggle = async () => {
    if (!assignment) return;
    setIsActionLoading(true);
    try {
      await toggleComplete(assignment.id, !assignment.completed);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleErpToggle = async () => {
    if (!assignment) return;
    setIsActionLoading(true);
    try {
      await toggleErpUpload(assignment.id, !assignment.uploaded_to_erp);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveCustomErpDate = async () => {
    if (!assignment) return;
    setIsActionLoading(true);
    try {
      await toggleErpUpload(assignment.id, true, erpDateInput || formatDateToIsoDate(new Date()));
      setEditingErpDate(false);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckToggle = async () => {
    if (!assignment) return;
    setIsActionLoading(true);
    try {
      await toggleProfessorCheck(assignment.id, !assignment.professor_checked);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveCustomCheckDate = async () => {
    if (!assignment) return;
    setIsActionLoading(true);
    try {
      await toggleProfessorCheck(assignment.id, true, checkDateInput || formatDateToIsoDate(new Date()));
      setEditingCheckDate(false);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;
    if (window.confirm(`Move "${assignment.title}" to trash?`)) {
      await deleteAssignmentQuick(assignment.id);
      onClose();
    }
  };

  const handleArchive = async () => {
    if (!assignment) return;
    await archiveAssignmentQuick(assignment.id, true);
    onClose();
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 my-8 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {loading || !assignment ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
                <p className="text-sm text-slate-500">Loading assignment details...</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SubjectBadge subject={assignment.subject} />
                      <PriorityBadge priority={assignment.priority} />
                      <UrgencyBadge urgency={urgency} daysRemaining={daysDiff} />
                      <WorkflowBadge stage={derivedStage} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {assignment.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        onClose();
                        onEdit(assignment);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleArchive}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Archive Assignment"
                    >
                      <Archive className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDelete}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Workflow Pipeline Controls */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Completed */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Stage 1</span>
                        <span className="text-[11px] text-slate-400">Work Done</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleCompleteToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                          assignment.completed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {assignment.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{assignment.completed ? 'Completed' : 'Mark Completed'}</span>
                      </motion.button>
                      {assignment.completed_at && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatFriendlyDateTime(assignment.completed_at)}
                        </p>
                      )}
                    </div>

                    {/* 2. ERP Upload */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Stage 2</span>
                        <span className="text-[11px] text-slate-400">Submission</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleErpToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                          assignment.uploaded_to_erp
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>{assignment.uploaded_to_erp ? 'Uploaded to ERP' : 'Mark Uploaded'}</span>
                      </motion.button>

                      {assignment.uploaded_to_erp && (
                        <div>
                          {editingErpDate ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="date"
                                value={erpDateInput}
                                onChange={(e) => setErpDateInput(e.target.value)}
                                className="w-full text-[11px] px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              />
                              <button
                                type="button"
                                onClick={handleSaveCustomErpDate}
                                className="px-2 py-1 bg-brand-600 text-white rounded text-[11px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span>Date: {formatFriendlyDate(assignment.erp_upload_date?.split('T')[0])}</span>
                              <button
                                type="button"
                                onClick={() => setEditingErpDate(true)}
                                className="text-brand-600 hover:underline font-semibold"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Professor Checked */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Stage 3</span>
                        <span className="text-[11px] text-slate-400">Evaluation</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleCheckToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                          assignment.professor_checked
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>{assignment.professor_checked ? 'Professor Checked' : 'Mark Checked'}</span>
                      </motion.button>

                      {assignment.professor_checked && (
                        <div>
                          {editingCheckDate ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="date"
                                value={checkDateInput}
                                onChange={(e) => setCheckDateInput(e.target.value)}
                                className="w-full text-[11px] px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              />
                              <button
                                type="button"
                                onClick={handleSaveCustomCheckDate}
                                className="px-2 py-1 bg-brand-600 text-white rounded text-[11px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span>Checked: {formatFriendlyDate(assignment.checked_at?.split('T')[0])}</span>
                              <button
                                type="button"
                                onClick={() => setEditingCheckDate(true)}
                                className="text-brand-600 hover:underline font-semibold"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Description
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {assignment.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Personal Notes & Formulas
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {assignment.notes || 'No personal notes attached.'}
                      </p>
                    </div>
                  </div>

                  {/* Useful Links Manager */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <LinkManager
                      assignmentId={assignment.id}
                      links={assignment.links || []}
                      onLinksUpdated={loadDetails}
                    />
                  </div>

                  {/* Storage Attachments Manager */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <AttachmentUploader
                      assignmentId={assignment.id}
                      attachments={assignment.attachments || []}
                      onAttachmentsUpdated={loadDetails}
                    />
                  </div>

                  {/* Metadata Timestamps Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                    <div className="flex items-center gap-4">
                      {assignment.assigned_date && (
                        <span>Assigned: {formatFriendlyDate(assignment.assigned_date)}</span>
                      )}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Due: {formatFriendlyDate(assignment.due_date)}
                      </span>
                    </div>
                    <span>Created: {formatFriendlyDateTime(assignment.created_at)}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
