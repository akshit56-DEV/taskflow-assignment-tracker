import React, { useState } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { getDerivedWorkflowStage, getAutomaticPriority, getRecommendedNextAction } from '@/utils/workflowUtils';
import { erpService } from '@/services/erpService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatFriendlyDate,
  getCalendarDaysDiff,
  getDeadlineUrgency,
} from '@/utils/dateUtils';
import {
  CheckSquare,
  Square,
  Paperclip,
  Link2,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Eye,
  FileText,
  Circle,
  ExternalLink,
  Check,
} from 'lucide-react';

interface AssignmentCardProps {
  assignment: AssignmentWithDetails;
  onOpenDetails: (assignment: AssignmentWithDetails) => void;
  onEdit: (assignment: AssignmentWithDetails) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onOpenDetails,
  onEdit,
}) => {
  const {
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
    deleteAssignmentQuick,
    archiveAssignmentQuick,
  } = useAssignments();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const derivedStage = getDerivedWorkflowStage(assignment);
  const daysDiff = getCalendarDaysDiff(assignment.due_date);
  const urgency = getDeadlineUrgency(assignment.due_date, assignment.completed);

  const handleCompleteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await toggleComplete(assignment.id, !assignment.completed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleErpToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await toggleErpUpload(assignment.id, !assignment.uploaded_to_erp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await toggleProfessorCheck(assignment.id, !assignment.professor_checked);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Move "${assignment.title}" to trash?`)) {
      await deleteAssignmentQuick(assignment.id);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    await archiveAssignmentQuick(assignment.id, true);
  };

  const getDueLabel = () => {
    if (assignment.completed) return 'Completed';
    if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)}d`;
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return 'Due tomorrow';
    return `Due in ${daysDiff} days`;
  };

    const cardSemanticBorder = assignment.completed
      ? 'border-l-4 border-l-[#19A974]'
      : urgency === 'Overdue'
      ? 'border-l-4 border-l-[#E04F5F]'
      : urgency === 'Critical'
      ? 'border-l-4 border-l-[#D68A16]'
      : 'border-l-4 border-l-transparent';

    return (
      <motion.div
        layout
        whileHover={{ y: -2 }}
        onClick={() => onOpenDetails(assignment)}
        className={`group relative rounded-2xl bg-white dark:bg-[#111827] border transition-all cursor-pointer p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-[#5B4DF5]/30 flex flex-col justify-between min-w-0 w-full ${cardSemanticBorder} ${
          assignment.completed
            ? 'border-[#E5E9F3] dark:border-[#1E293B] opacity-90'
            : urgency === 'Overdue'
            ? 'border-[#E04F5F]/40 dark:border-[#E04F5F]/30 bg-rose-50/10 dark:bg-rose-950/10'
            : 'border-[#E5E9F3] dark:border-[#1E293B]'
        }`}
      >
        <div className="min-w-0 w-full">
          {/* Top Header: Subject + Priority + Status / Menu */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-3 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
              <SubjectBadge subject={assignment.subject} />
              <PriorityBadge priority={getAutomaticPriority(assignment)} size="sm" />
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Status indicator pill */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  assignment.completed
                    ? 'bg-emerald-50 text-[#19A974] border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40'
                    : derivedStage === 'in_progress'
                    ? 'bg-sky-50 text-[#0284C7] border-sky-200/60 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {assignment.completed
                  ? 'Completed'
                  : derivedStage === 'in_progress'
                  ? 'In progress'
                  : 'Not started'}
              </span>

            {/* More Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-[#939CB1] hover:text-[#18223F] dark:hover:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] transition-colors"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] rounded-xl shadow-lg py-1.5 z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenDetails(assignment);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-medium text-[#18223F] dark:text-[#F1F5F9] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#939CB1]" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(assignment);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-medium text-[#18223F] dark:text-[#F1F5F9] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#939CB1]" />
                      Edit Assignment
                    </button>
                    <button
                      onClick={handleArchive}
                      className="w-full px-3 py-1.5 text-xs font-medium text-[#18223F] dark:text-[#F1F5F9] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#939CB1]" />
                      Archive
                    </button>
                    <div className="h-px bg-[#E5E9F3] dark:bg-[#1E293B] my-1" />
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-xs font-medium text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#D34D61]" />
                      Move to Trash
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Title & Due Date */}
        <div className="mb-3">
          <h3
            className={`text-base font-bold text-[#18223F] dark:text-white leading-snug mb-1 line-clamp-2 break-words ${
              assignment.completed ? 'line-through text-[#66718C] dark:text-[#94A3B8]' : ''
            }`}
          >
            {assignment.title}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`font-medium ${
                urgency === 'Overdue'
                  ? 'text-[#D34D61]'
                  : urgency === 'Critical'
                  ? 'text-[#B97915]'
                  : 'text-[#66718C] dark:text-[#94A3B8]'
              }`}
            >
              {getDueLabel()}
            </span>
            <span className="text-[#939CB1]">·</span>
            <span className="text-[#939CB1]">{formatFriendlyDate(assignment.due_date)}</span>
          </div>
        </div>

        {/* Description snippet if any */}
        {assignment.description && (
          <p className="text-xs text-[#66718C] dark:text-[#94A3B8] line-clamp-2 mb-3 leading-relaxed">
            {assignment.description}
          </p>
        )}

        {/* Milestones & ERP Actions */}
        <div className="py-2.5 border-t border-[#E5E9F3] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs text-[#66718C] dark:text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* ERP Link / Status */}
            {assignment.uploaded_to_erp ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 text-[#0D9488] dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/50">
                <Check className="w-3 h-3" />
                <span>✓ ERP Uploaded</span>
              </span>
            ) : assignment.completed ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    erpService.openERP();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EEECFF] text-[#5B4DF5] hover:bg-[#5B4DF5] hover:text-white transition-colors cursor-pointer border border-[#5B4DF5]/20 shadow-2xs whitespace-nowrap flex-shrink-0"
                  title="Launch official JECRC MasterSoft ERP portal in new tab"
                >
                  <span>Upload to JECRC ERP</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleErpToggle(e);
                  }}
                  className="text-[10px] text-[#5C6175] dark:text-[#94A3B8] hover:text-[#0D9488] underline cursor-pointer whitespace-nowrap flex-shrink-0"
                  title="Mark as uploaded once submitted on portal"
                >
                  Mark ERP Uploaded
                </button>
              </div>
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleErpToggle(e);
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:text-[#0D9488] transition-colors"
                title="Click to toggle ERP upload status"
              >
                <Circle className="w-3.5 h-3.5 text-[#939CB1]" />
                <span>ERP upload pending</span>
              </div>
            )}

            {/* Professor Check Status */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleCheckToggle(e);
              }}
              className="flex items-center gap-1.5 cursor-pointer hover:text-[#19A974] transition-colors"
              title="Click to toggle Professor verification status"
            >
              {assignment.professor_checked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-[#19A974] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                  <Check className="w-3 h-3" />
                  <span>✓ Verified</span>
                </span>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-[#939CB1]" />
                  <span>Professor check pending</span>
                </>
              )}
            </div>
          </div>

          {/* Subtle Task Intelligence Recommendation */}
          <div className="text-[11px] text-[#7970D9] dark:text-[#A49DFC] font-medium flex items-center gap-1">
            <span className="opacity-70">Next:</span>
            <span>{getRecommendedNextAction(assignment).label}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata and Complete Button */}
      <div
        className="flex items-center justify-between pt-3 border-t border-[#E5E9F3] dark:border-[#1E293B] mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs text-[#939CB1]">
          {assignment.notes && (
            <span className="flex items-center gap-1" title="Notes included">
              <FileText className="w-3.5 h-3.5" />
            </span>
          )}
          {assignment.links && assignment.links.length > 0 && (
            <span className="flex items-center gap-1" title={`${assignment.links.length} links`}>
              <Link2 className="w-3.5 h-3.5" />
              <span>{assignment.links.length}</span>
            </span>
          )}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <span className="flex items-center gap-1" title={`${assignment.attachments.length} attachments`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>{assignment.attachments.length}</span>
            </span>
          )}
        </div>

        {/* Quick Mark Complete Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={isUpdating}
          onClick={handleCompleteToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            assignment.completed
              ? 'bg-emerald-50 text-[#19A974] border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40'
              : 'bg-[#F5F7FC] hover:bg-[#EEECFF] text-[#5C6175] hover:text-[#5B4DF5] border-[#E6E9F2] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:text-white dark:border-slate-700'
          }`}
        >
          {assignment.completed ? (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-[#19A974]" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5 text-[#939CB1]" />
              <span>Mark Done</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
