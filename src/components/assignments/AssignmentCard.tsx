import React, { useState } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { WorkflowBadge } from '@/components/common/WorkflowBadge';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatFriendlyDate,
  getCalendarDaysDiff,
  getDeadlineUrgency,
} from '@/utils/dateUtils';
import {
  CheckSquare,
  Square,
  UploadCloud,
  CheckCheck,
  Calendar,
  Paperclip,
  Link2,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Eye,
  FileText,
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

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={() => onOpenDetails(assignment)}
      className={`group relative rounded-2xl glass-card transition-colors duration-200 cursor-pointer p-4 sm:p-5 shadow-xs hover:shadow-md ${
        assignment.completed
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-85'
          : urgency === 'Overdue'
          ? 'border-red-200/80 dark:border-red-900/60 hover:border-red-400/80 dark:hover:border-red-700/80'
          : urgency === 'Critical'
          ? 'border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400/80 dark:hover:border-rose-700/80'
          : 'hover:border-brand-300/80 dark:hover:border-brand-700/80'
      }`}
    >
      {/* Top Header: Subject + Badges + Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectBadge subject={assignment.subject} />
          <PriorityBadge priority={assignment.priority} size="sm" />
          <UrgencyBadge urgency={urgency} daysRemaining={daysDiff} size="sm" />
        </div>

        {/* Action Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-40 glass-card rounded-xl shadow-xl py-1.5 z-20 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDetails(assignment);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(assignment);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Edit Assignment
                </button>
                <button
                  onClick={handleArchive}
                  className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
                  Archive
                </button>
                <div className="h-px bg-slate-100 dark:border-slate-800 my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  Move to Trash
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h4
          className={`text-base font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1 line-clamp-2 ${
            assignment.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
          }`}
        >
          {assignment.title}
        </h4>
        {assignment.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {assignment.description}
          </p>
        )}
      </div>

      {/* Metadata Row: Due Date + Indicators */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Due: {formatFriendlyDate(assignment.due_date)}</span>
        </div>

        <div className="flex items-center gap-3">
          {assignment.notes && (
            <span className="flex items-center gap-1 text-slate-400" title="Has notes">
              <FileText className="w-3.5 h-3.5" />
            </span>
          )}
          {assignment.links && assignment.links.length > 0 && (
            <span
              className="flex items-center gap-1 text-slate-400"
              title={`${assignment.links.length} Useful Links`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{assignment.links.length}</span>
            </span>
          )}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <span
              className="flex items-center gap-1 text-slate-400"
              title={`${assignment.attachments.length} Attachments`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>{assignment.attachments.length}</span>
            </span>
          )}
          <WorkflowBadge stage={derivedStage} size="sm" />
        </div>
      </div>

      {/* Quick Workflow Checkboxes */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Completed Checkbox */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          disabled={isUpdating}
          onClick={handleCompleteToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.completed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs'
              : 'bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          {assignment.completed ? (
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          <div className="truncate">
            <span className="block font-semibold">Completed</span>
            {assignment.completed_at && (
              <span className="text-[10px] opacity-75 truncate block">
                {formatFriendlyDate(assignment.completed_at.split('T')[0])}
              </span>
            )}
          </div>
        </motion.button>

        {/* ERP Upload Checkbox */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          disabled={isUpdating}
          onClick={handleErpToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.uploaded_to_erp
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs'
              : 'bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          <UploadCloud
            className={`w-4 h-4 flex-shrink-0 ${
              assignment.uploaded_to_erp
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400'
            }`}
          />
          <div className="truncate">
            <span className="block font-semibold">ERP Upload</span>
            {assignment.erp_upload_date ? (
              <span className="text-[10px] opacity-75 truncate block">
                {formatFriendlyDate(assignment.erp_upload_date.split('T')[0])}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 truncate block">Pending</span>
            )}
          </div>
        </motion.button>

        {/* Professor Checked Checkbox */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          disabled={isUpdating}
          onClick={handleCheckToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.professor_checked
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-xs'
              : 'bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          <CheckCheck
            className={`w-4 h-4 flex-shrink-0 ${
              assignment.professor_checked
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-slate-400'
            }`}
          />
          <div className="truncate">
            <span className="block font-semibold">Checked</span>
            {assignment.checked_at ? (
              <span className="text-[10px] opacity-75 truncate block">
                {formatFriendlyDate(assignment.checked_at.split('T')[0])}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 truncate block">Pending</span>
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
