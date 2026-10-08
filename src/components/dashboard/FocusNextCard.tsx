import React, { useState } from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { getFocusNextAssignment } from '@/utils/smartAutomationUtils';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { formatFriendlyDate } from '@/utils/dateUtils';
import { getAutomaticPriority } from '@/utils/workflowUtils';
import { erpService } from '@/services/erpService';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Eye,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface FocusNextCardProps {
  onOpenDetails: (assignmentId: string) => void;
}

export const FocusNextCard: React.FC<FocusNextCardProps> = ({ onOpenDetails }) => {
  const {
    assignments,
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
  } = useAssignments();

  const [actionLoading, setActionLoading] = useState(false);

  const focusItem = getFocusNextAssignment(assignments);

  const handleQuickAction = async () => {
    if (!focusItem) return;
    setActionLoading(true);
    try {
      if (focusItem.actionType === 'complete') {
        await toggleComplete(focusItem.assignment.id, true);
      } else if (focusItem.actionType === 'upload_erp') {
        await toggleErpUpload(focusItem.assignment.id, true);
      } else if (focusItem.actionType === 'professor_check') {
        await toggleProfessorCheck(focusItem.assignment.id, true);
      }
    } catch (err) {
      console.error('Focus quick action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!focusItem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="p-5 sm:p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm relative overflow-hidden flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F1] dark:bg-emerald-950/60 text-[#19A974] flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#19A974]">
                Focus Clear
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#171A2E] dark:text-white">
              No Urgent Tasks Pending
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] mt-0.5">
              You are completely caught up on your assignments, ERP uploads, and verification steps.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const { assignment } = focusItem;

  const actionBtnClass =
    focusItem.actionType === 'upload_erp'
      ? 'bg-[#0D9488] hover:bg-[#0F766E]'
      : focusItem.actionType === 'professor_check'
      ? 'bg-[#19A974] hover:bg-[#14835A]'
      : 'bg-[#5B4DF5] hover:bg-[#4B3CE0]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm relative overflow-hidden space-y-3.5 sm:space-y-4 w-full min-w-0"
    >
      {/* Top Badges & Due Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC]">
            <Compass className="w-4 h-4 text-[#5B4DF5]" />
            Focus Priority
          </span>
          <span className="text-[#9499AB]">·</span>
          <SubjectBadge subject={assignment.subject} />
          <PriorityBadge priority={getAutomaticPriority(assignment)} size="sm" />
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${focusItem.badgeColor}`}
          >
            {focusItem.badgeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#9499AB] flex-shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#5B4DF5]" />
          <span>Due: {formatFriendlyDate(assignment.due_date)}</span>
        </div>
      </div>

      {/* Main Focus Title & Intelligence Recommendation (Full Width, never collapses horizontally) */}
      <div className="space-y-1 w-full min-w-0">
        <h3 className="text-base sm:text-lg font-heading font-bold text-[#171A2E] dark:text-white tracking-tight leading-snug">
          {assignment.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] leading-relaxed">
          {focusItem.recommendationText}
        </p>
      </div>

      {/* Action Controls Row (Dedicated horizontal breathing room, properly sized buttons) */}
      <div className="pt-3 border-t border-[#E6E9F2]/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 w-full min-w-0">
        <button
          type="button"
          onClick={() => onOpenDetails(assignment.id)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] text-[#171A2E] dark:text-slate-200 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5 text-[#5C6175]" />
          <span>Details</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {focusItem.actionType === 'upload_erp' ? (
            <>
              <button
                type="button"
                onClick={() => erpService.openERP()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                title="Launch official JECRC MasterSoft ERP portal in new tab"
              >
                <span>Upload to JECRC ERP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleQuickAction}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EEECFF] dark:bg-slate-800 text-[#5B4DF5] dark:text-slate-200 hover:bg-[#e4dfff] transition-colors cursor-pointer border border-[#5B4DF5]/20 flex items-center gap-1.5 whitespace-nowrap"
                title="Mark as uploaded once submitted on ERP"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />}
                <span>Mark ERP Uploaded</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleQuickAction}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap ${actionBtnClass}`}
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{focusItem.actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
