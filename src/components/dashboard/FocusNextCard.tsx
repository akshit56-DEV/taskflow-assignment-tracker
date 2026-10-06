import React, { useState } from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { getFocusNextAssignment } from '@/utils/smartAutomationUtils';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { formatFriendlyDate } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Eye,
  Loader2,
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
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card relative overflow-hidden flex items-center justify-between gap-4"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card relative overflow-hidden space-y-4 w-full min-w-0"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#5B4DF5]/10 via-[#16B8D4]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
        {/* Left Column: Focus Info */}
        <div className="space-y-2.5 max-w-2xl min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#5B4DF5] text-white shadow-xs">
              <Compass className="w-3.5 h-3.5" />
              Focus Next
            </span>
            <SubjectBadge subject={assignment.subject} />
            <PriorityBadge priority={assignment.priority} size="sm" />
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${focusItem.badgeColor}`}
            >
              {focusItem.badgeLabel}
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-[#171A2E] dark:text-white tracking-tight leading-snug break-words">
              {assignment.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1 leading-relaxed">
              {focusItem.recommendationText}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#9499AB] pt-0.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5B4DF5]" />
              <span>Due: {formatFriendlyDate(assignment.due_date)}</span>
            </span>
          </div>
        </div>

        {/* Right Column: 1-Click Action Buttons (Button feedback 200ms) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto pt-1 md:pt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={() => onOpenDetails(assignment.id)}
            className="flex-1 md:flex-initial px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-[#F5F7FB] dark:bg-[#15172F] text-[#171A2E] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-tf-subtle"
          >
            <Eye className="w-3.5 h-3.5 text-[#5C6175]" />
            <span>Details</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ duration: 0.2 }}
            type="button"
            disabled={actionLoading}
            onClick={handleQuickAction}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs shadow-tf-subtle transition-all disabled:opacity-50 cursor-pointer"
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            <span>{focusItem.actionLabel}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
