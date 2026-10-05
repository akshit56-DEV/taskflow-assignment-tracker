import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignmentById } from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';
import { LinkManager } from '@/components/links/LinkManager';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import {
  formatFriendlyDate,
  formatFriendlyDateTime,
  getCalendarDaysDiff,
  getDeadlineUrgency,
  formatDateToIsoDate,
} from '@/utils/dateUtils';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  UploadCloud,
  CheckCheck,
  Edit2,
  Trash2,
  Archive,
  Calendar,
  Sparkles,
  Clock,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const AssignmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
    deleteAssignmentQuick,
    archiveAssignmentQuick,
  } = useAssignments();

  const { onEditAssignment } = useOutletContext<LayoutContextType>();

  const [assignment, setAssignment] = useState<AssignmentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Editable dates for ERP and Check
  const [editingErpDate, setEditingErpDate] = useState(false);
  const [erpDateInput, setErpDateInput] = useState('');
  const [editingCheckDate, setEditingCheckDate] = useState(false);
  const [checkDateInput, setCheckDateInput] = useState('');

  const loadDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getAssignmentById(id);
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
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading) {
    return <LoadingSpinner message="Loading assignment details..." />;
  }

  if (!assignment) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] dark:bg-rose-950/40 text-[#E04F5F] flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-bold text-lg text-[#171A2E] dark:text-white">
          Assignment not found
        </h2>
        <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
          This assignment may have been deleted, archived, or does not exist.
        </p>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B4DF5] text-white hover:bg-[#4B3CE0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to assignments</span>
        </Link>
      </div>
    );
  }

  const derivedStage = getDerivedWorkflowStage(assignment);
  const daysDiff = getCalendarDaysDiff(assignment.due_date);
  const urgency = getDeadlineUrgency(assignment.due_date, assignment.completed);

  // 5 Stages definitions for the interactive tracker
  const stages = [
    { id: 'not_started', label: 'Not Started', num: 1, active: true },
    {
      id: 'in_progress',
      label: 'In Progress',
      num: 2,
      active: derivedStage !== 'not_started',
    },
    {
      id: 'completed',
      label: 'Completed',
      num: 3,
      active: assignment.completed || assignment.uploaded_to_erp || assignment.professor_checked,
    },
    {
      id: 'uploaded',
      label: 'ERP Uploaded',
      num: 4,
      active: assignment.uploaded_to_erp || assignment.professor_checked,
    },
    {
      id: 'checked',
      label: 'Prof. Checked',
      num: 5,
      active: assignment.professor_checked,
    },
  ];

  const handleCompleteToggle = async () => {
    setIsActionLoading(true);
    try {
      const nextStatus = !assignment.completed;
      await toggleComplete(assignment.id, nextStatus);
      if (nextStatus) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#16B8D4', '#5B4DF5', '#19A974'],
        });
      }
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleErpToggle = async () => {
    setIsActionLoading(true);
    try {
      await toggleErpUpload(assignment.id, !assignment.uploaded_to_erp);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveCustomErpDate = async () => {
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
    setIsActionLoading(true);
    try {
      const nextCheck = !assignment.professor_checked;
      await toggleProfessorCheck(assignment.id, nextCheck);
      if (nextCheck) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#19A974', '#5B4DF5'],
        });
      }
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveCustomCheckDate = async () => {
    setIsActionLoading(true);
    try {
      await toggleProfessorCheck(
        assignment.id,
        true,
        checkDateInput || formatDateToIsoDate(new Date())
      );
      setEditingCheckDate(false);
      await loadDetails();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Move "${assignment.title}" to trash?`)) {
      await deleteAssignmentQuick(assignment.id);
      navigate('/assignments');
    }
  };

  const handleArchive = async () => {
    await archiveAssignmentQuick(assignment.id, !assignment.is_archived);
    navigate('/assignments');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* 1. Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B4DF5] hover:text-[#4B3CE0] dark:text-[#A49DFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to assignments</span>
        </Link>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={() => onEditAssignment(assignment)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] text-[#171A2E] dark:text-slate-200 hover:bg-[#F5F7FB] transition-all cursor-pointer shadow-tf-subtle"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#5C6175]" />
            <span>Edit</span>
          </motion.button>

          <button
            type="button"
            onClick={handleArchive}
            className="p-2 rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white transition-colors cursor-pointer shadow-tf-subtle"
            title="Archive Assignment"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] text-[#E04F5F] hover:bg-[#FFF0F1] dark:hover:bg-rose-950/30 transition-colors cursor-pointer shadow-tf-subtle"
            title="Move to Trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Header Box (Figma 07 — Assignment Details Header) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectBadge subject={assignment.subject} />
          <PriorityBadge priority={assignment.priority} />
          <UrgencyBadge urgency={urgency} daysRemaining={daysDiff} />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171A2E] dark:text-white tracking-tight leading-snug">
            {assignment.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#5B4DF5]" />
            <span>Due {formatFriendlyDateTime(assignment.due_date)}</span>
          </p>
        </div>
      </div>

      {/* 3. TASKFLOW Principle & 5-Stage Workflow Pipeline */}
      <div className="relative rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-5 sm:p-6 shadow-tf-card overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-rail" />

        <div className="pl-3 sm:pl-4 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5B4DF5]" />
            <h2 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white">
              Completed ≠ Submitted ≠ Checked
            </h2>
          </div>
          <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
            Finishing the work is only step three. Upload it to ERP, then confirm your professor has
            checked it.
          </p>
        </div>

        {/* 5-Stage Interactive Flow Track */}
        <div className="pl-3 sm:pl-4 pt-3 border-t border-[#E6E9F2]/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[500px]">
            {stages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all shadow-xs ${
                      stage.active
                        ? stage.id === 'checked'
                          ? 'bg-[#19A974]'
                          : stage.id === 'uploaded'
                          ? 'bg-[#7970D9]'
                          : stage.id === 'completed'
                          ? 'bg-[#16B8D4]'
                          : 'bg-[#5B4DF5]'
                        : 'bg-[#E6E9F2] dark:bg-slate-700 text-[#9499AB]'
                    }`}
                  >
                    {stage.active ? <Check className="w-4 h-4" /> : stage.num}
                  </div>
                  <span className="text-[11px] font-bold text-[#171A2E] dark:text-slate-200 mt-1.5 whitespace-nowrap">
                    {stage.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1.5 rounded-full ${
                      stage.active && stages[idx + 1].active
                        ? 'bg-[#5B4DF5]'
                        : 'bg-[#E6E9F2] dark:bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 2-Column Detail Layout: Work & Resources (Left) vs Summary & Verification (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Description, Checklist, Attachments, Links */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-subtle space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white">
              Description & Instructions
            </h3>
            {assignment.description ? (
              <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
            ) : (
              <p className="text-xs text-[#9499AB] italic">No description provided.</p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-subtle">
            <AttachmentUploader
              assignmentId={assignment.id}
              attachments={assignment.attachments || []}
              onAttachmentsUpdated={loadDetails}
            />
          </div>

          {/* Reference Links Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-subtle">
            <LinkManager
              assignmentId={assignment.id}
              links={assignment.links || []}
              onLinksUpdated={loadDetails}
            />
          </div>
        </div>

        {/* Right Column (5 cols): Milestone Actions & Metadata */}
        <div className="lg:col-span-5 space-y-6">
          {/* Milestone Action Center (Figma 07 — Milestone Verification Loop) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E6E9F2]/80 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#5B4DF5]" />
              <h3 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white">
                Academic Milestones
              </h3>
            </div>

            {/* Step 1: Completion */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#171A2E] dark:text-white block">
                  1. Local Work
                </span>
                <span className="text-[11px] text-[#9499AB]">
                  {assignment.completed ? 'Finished on laptop' : 'In progress'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98, y: 1 }}
                transition={{ duration: 0.2 }}
                type="button"
                disabled={isActionLoading}
                onClick={handleCompleteToggle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  assignment.completed
                    ? 'bg-[#E8F8F1] text-[#19A974] hover:bg-[#d5f3e5]'
                    : 'bg-[#5B4DF5] text-white hover:bg-[#4B3CE0]'
                }`}
              >
                {isActionLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : assignment.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
                <span>{assignment.completed ? 'Completed ✓' : 'Mark Done'}</span>
              </motion.button>
            </div>

            {/* Step 2: ERP Portal Upload */}
            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#171A2E] dark:text-white block">
                    2. ERP Upload
                  </span>
                  <span className="text-[11px] text-[#9499AB]">
                    {assignment.uploaded_to_erp
                      ? `Uploaded ${
                          assignment.erp_upload_date
                            ? formatFriendlyDate(assignment.erp_upload_date)
                            : ''
                        }`
                      : 'Pending portal upload'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98, y: 1 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleErpToggle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assignment.uploaded_to_erp
                      ? 'bg-[#EEECFF] text-[#7970D9] hover:bg-[#e4dfff]'
                      : 'bg-[#7970D9] text-white hover:bg-[#685ec4]'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{assignment.uploaded_to_erp ? 'Uploaded ✓' : 'Upload to ERP'}</span>
                </motion.button>
              </div>

              {editingErpDate ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="date"
                    value={erpDateInput}
                    onChange={(e) => setErpDateInput(e.target.value)}
                    className="text-xs p-1 rounded-md border border-[#E6E9F2] dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={handleSaveCustomErpDate}
                    className="text-[11px] font-bold text-[#5B4DF5] hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingErpDate(false)}
                    className="text-[11px] text-[#9499AB] hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingErpDate(true)}
                  className="text-[10px] text-[#7970D9] hover:underline cursor-pointer block"
                >
                  Edit ERP upload date
                </button>
              )}
            </div>

            {/* Step 3: Professor Verification */}
            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#171A2E] dark:text-white block">
                    3. Professor Check
                  </span>
                  <span className="text-[11px] text-[#9499AB]">
                    {assignment.professor_checked
                      ? `Checked ${
                          assignment.checked_at ? formatFriendlyDate(assignment.checked_at) : ''
                        }`
                      : 'Awaiting faculty review'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98, y: 1 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleCheckToggle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assignment.professor_checked
                      ? 'bg-[#E8F8F1] text-[#19A974] hover:bg-[#d5f3e5]'
                      : 'bg-[#19A974] text-white hover:bg-[#158f62]'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{assignment.professor_checked ? 'Checked ✓' : 'Confirm Checked'}</span>
                </motion.button>
              </div>

              {editingCheckDate ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="date"
                    value={checkDateInput}
                    onChange={(e) => setCheckDateInput(e.target.value)}
                    className="text-xs p-1 rounded-md border border-[#E6E9F2] dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={handleSaveCustomCheckDate}
                    className="text-[11px] font-bold text-[#19A974] hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCheckDate(false)}
                    className="text-[11px] text-[#9499AB] hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingCheckDate(true)}
                  className="text-[10px] text-[#19A974] hover:underline cursor-pointer block"
                >
                  Edit faculty check date
                </button>
              )}
            </div>
          </div>

          {/* Assignment Summary Metadata */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-subtle space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white border-b border-[#E6E9F2]/80 dark:border-slate-800 pb-2">
              Summary & Metadata
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">Subject</span>
                <span className="font-bold text-[#171A2E] dark:text-white">
                  {assignment.subject?.name || 'General'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">Due Date</span>
                <span className="font-bold text-[#171A2E] dark:text-white">
                  {formatFriendlyDate(assignment.due_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">Priority</span>
                <span className="font-bold text-[#171A2E] dark:text-white">
                  {assignment.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">Status</span>
                <span className="font-bold text-[#171A2E] dark:text-white uppercase tracking-wider text-[11px]">
                  {derivedStage.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">ERP Status</span>
                <span
                  className={`font-bold ${
                    assignment.uploaded_to_erp ? 'text-[#7970D9]' : 'text-[#9499AB]'
                  }`}
                >
                  {assignment.uploaded_to_erp ? 'Uploaded' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9499AB]">Professor Review</span>
                <span
                  className={`font-bold ${
                    assignment.professor_checked ? 'text-[#19A974]' : 'text-[#9499AB]'
                  }`}
                >
                  {assignment.professor_checked ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssignmentDetailsPage;
