import React, { useState, useEffect, useCallback } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignmentById } from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
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
  Check,
  ArrowLeft,
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

  // Calculate milestone index (1 to 5)
  // 1: Not started
  // 2: In progress
  // 3: Completed
  // 4: Uploaded to ERP
  // 5: Professor Checked
  let currentMilestoneStep = 1;
  if (assignment?.professor_checked) {
    currentMilestoneStep = 5;
  } else if (assignment?.uploaded_to_erp) {
    currentMilestoneStep = 4;
  } else if (assignment?.completed) {
    currentMilestoneStep = 3;
  } else if (derivedStage === 'in_progress') {
    currentMilestoneStep = 2;
  }

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
            className="fixed inset-0 bg-[#0B1020]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full max-w-3xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-[#E5E9F3] dark:border-[#1E293B] my-8 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {loading || !assignment ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4355ED] mb-3" />
                <p className="text-xs text-[#66718C]">Loading assignment details...</p>
              </div>
            ) : (
              <>
                {/* Modal Header (Figma style breadcrumb + title + actions) */}
                <div className="px-6 pt-6 pb-4 border-b border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/50 dark:bg-[#0B1020]/50">
                  {/* Top Bar: Breadcrumb + Action buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#66718C] dark:text-[#94A3B8] hover:text-[#4355ED] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Assignments / {assignment.subject?.name || 'Subject'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onClose();
                          onEdit(assignment);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#4355ED] text-white hover:bg-[#3646D7] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit assignment</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={handleArchive}
                        className="p-1.5 rounded-xl text-[#939CB1] hover:text-[#18223F] dark:hover:text-white hover:bg-white dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        className="p-1.5 rounded-xl text-[#939CB1] hover:text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 transition-colors cursor-pointer"
                        title="Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-[#939CB1] hover:text-[#18223F] dark:hover:text-white hover:bg-white dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Metadata Pills */}
                  <h2 className="text-xl sm:text-2xl font-bold text-[#18223F] dark:text-white mb-2.5">
                    {assignment.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <SubjectBadge subject={assignment.subject} />
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] text-[#66718C] dark:text-[#94A3B8] font-medium">
                      Due {formatFriendlyDate(assignment.due_date)}
                    </span>
                    <UrgencyBadge urgency={urgency} daysRemaining={daysDiff} size="sm" />
                    <PriorityBadge priority={assignment.priority} size="sm" />
                  </div>
                </div>

                {/* Milestone Journey Banner (Figma #3:73250) */}
                <div className="px-6 py-4 bg-white dark:bg-[#111827] border-b border-[#E5E9F3] dark:border-[#1E293B]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#18223F] dark:text-white">
                      Your assignment journey ·{' '}
                      <span className="text-[#4355ED]">{currentMilestoneStep} of 5 milestones</span>
                    </span>
                  </div>

                  {/* 5 Milestone Stepper */}
                  <div className="grid grid-cols-5 gap-2 relative">
                    {[
                      { step: 1, label: 'Not Started' },
                      { step: 2, label: 'In Progress' },
                      { step: 3, label: 'Completed' },
                      { step: 4, label: 'Uploaded' },
                      { step: 5, label: 'Checked' },
                    ].map((m) => {
                      const isPast = m.step < currentMilestoneStep;
                      const isCurrent = m.step === currentMilestoneStep;

                      return (
                        <div key={m.step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                              isPast
                                ? 'bg-[#188A68] text-white'
                                : isCurrent
                                ? 'bg-[#4355ED] text-white ring-4 ring-[#4355ED]/20'
                                : 'bg-[#F5F7FC] dark:bg-[#1E293B] text-[#939CB1] border border-[#E5E9F3] dark:border-[#1E293B]'
                            }`}
                          >
                            {isPast ? <Check className="w-3.5 h-3.5" /> : m.step}
                          </div>
                          <span
                            className={`text-[11px] font-medium leading-tight ${
                              isCurrent
                                ? 'text-[#4355ED] font-bold'
                                : isPast
                                ? 'text-[#18223F] dark:text-white'
                                : 'text-[#939CB1]'
                            }`}
                          >
                            {m.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] text-[#4355ED] font-semibold mt-0.5">
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Milestones Action Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Completed */}
                    <div className="p-3.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#66718C] dark:text-[#94A3B8] uppercase">
                          Stage 1
                        </span>
                        <span className="text-[10px] text-[#939CB1]">Work</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleCompleteToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          assignment.completed
                            ? 'bg-[#E9F6F0] text-[#188A68] border border-[#188A68]/30 shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#18223F] dark:text-white border border-[#E5E9F3] dark:border-[#1E293B] hover:border-[#4355ED]/40'
                        }`}
                      >
                        {assignment.completed ? (
                          <CheckSquare className="w-4 h-4 text-[#188A68]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#939CB1]" />
                        )}
                        <span>{assignment.completed ? 'Completed' : 'Mark Completed'}</span>
                      </motion.button>
                      {assignment.completed_at && (
                        <p className="text-[10px] text-[#66718C] dark:text-[#94A3B8] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#939CB1]" />
                          {formatFriendlyDateTime(assignment.completed_at)}
                        </p>
                      )}
                    </div>

                    {/* 2. ERP Upload */}
                    <div className="p-3.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#66718C] dark:text-[#94A3B8] uppercase">
                          Stage 2
                        </span>
                        <span className="text-[10px] text-[#939CB1]">Submission</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleErpToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          assignment.uploaded_to_erp
                            ? 'bg-[#EEF0FF] text-[#4355ED] border border-[#4355ED]/30 shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#18223F] dark:text-white border border-[#E5E9F3] dark:border-[#1E293B] hover:border-[#4355ED]/40'
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
                                className="w-full text-[11px] px-2 py-1 rounded-lg border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827]"
                              />
                              <button
                                type="button"
                                onClick={handleSaveCustomErpDate}
                                className="px-2 py-1 bg-[#4355ED] text-white rounded-lg text-[11px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-[#66718C] dark:text-[#94A3B8]">
                              <span>Date: {formatFriendlyDate(assignment.erp_upload_date?.split('T')[0])}</span>
                              <button
                                type="button"
                                onClick={() => setEditingErpDate(true)}
                                className="text-[#4355ED] hover:underline font-semibold cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Professor Checked */}
                    <div className="p-3.5 rounded-2xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#66718C] dark:text-[#94A3B8] uppercase">
                          Stage 3
                        </span>
                        <span className="text-[10px] text-[#939CB1]">Evaluation</span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isActionLoading}
                        onClick={handleCheckToggle}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          assignment.professor_checked
                            ? 'bg-[#EEF0FF] text-[#7970D9] border border-[#7970D9]/30 shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#18223F] dark:text-white border border-[#E5E9F3] dark:border-[#1E293B] hover:border-[#4355ED]/40'
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
                                className="w-full text-[11px] px-2 py-1 rounded-lg border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827]"
                              />
                              <button
                                type="button"
                                onClick={handleSaveCustomCheckDate}
                                className="px-2 py-1 bg-[#4355ED] text-white rounded-lg text-[11px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-[#66718C] dark:text-[#94A3B8]">
                              <span>Checked: {formatFriendlyDate(assignment.checked_at?.split('T')[0])}</span>
                              <button
                                type="button"
                                onClick={() => setEditingCheckDate(true)}
                                className="text-[#4355ED] hover:underline font-semibold cursor-pointer"
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
                    <div className="p-4 rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] space-y-2">
                      <h4 className="text-xs font-bold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider">
                        Description
                      </h4>
                      <p className="text-xs sm:text-sm text-[#18223F] dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {assignment.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] space-y-2">
                      <h4 className="text-xs font-bold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#939CB1]" />
                        Personal Notes & Formulas
                      </h4>
                      <p className="text-xs sm:text-sm text-[#18223F] dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {assignment.notes || 'No personal notes attached.'}
                      </p>
                    </div>
                  </div>

                  {/* Useful Links Manager */}
                  <div className="p-4 rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827]">
                    <LinkManager
                      assignmentId={assignment.id}
                      links={assignment.links || []}
                      onLinksUpdated={loadDetails}
                    />
                  </div>

                  {/* Storage Attachments Manager */}
                  <div className="p-4 rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827]">
                    <AttachmentUploader
                      assignmentId={assignment.id}
                      attachments={assignment.attachments || []}
                      onAttachmentsUpdated={loadDetails}
                    />
                  </div>

                  {/* Metadata Timestamps Footer */}
                  <div className="pt-4 border-t border-[#E5E9F3] dark:border-[#1E293B] flex flex-wrap items-center justify-between text-xs text-[#939CB1] gap-3">
                    <div className="flex items-center gap-4">
                      {assignment.assigned_date && (
                        <span>Assigned: {formatFriendlyDate(assignment.assigned_date)}</span>
                      )}
                      <span className="font-semibold text-[#18223F] dark:text-[#F1F5F9]">
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
