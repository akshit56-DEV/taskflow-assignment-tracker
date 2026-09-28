import React, { useState } from 'react';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { WorkflowBadge } from '@/components/common/WorkflowBadge';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
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
    <div
      onClick={() => onOpenDetails(assignment)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer p-4 sm:p-5 ${
        assignment.completed
          ? 'border-slate-200/70 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 opacity-90'
          : urgency === 'Overdue'
          ? 'border-red-200 dark:border-red-900/60 hover:border-red-300'
          : urgency === 'Critical'
          ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
          : 'border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900'
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
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-20 animate-fade-in">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenDetails(assignment);
                }}
                className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                View Details
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(assignment);
                }}
                className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                Edit Assignment
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                Archive
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h4
          className={`text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-1 line-clamp-2 ${
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
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Completed Checkbox */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleCompleteToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.completed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
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
        </button>

        {/* ERP Upload Checkbox */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleErpToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.uploaded_to_erp
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
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
        </button>

        {/* Professor Checked Checkbox */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleCheckToggle}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left ${
            assignment.professor_checked
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
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
        </button>
      </div>
    </div>
  );
};
