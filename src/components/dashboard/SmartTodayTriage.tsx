import React, { useState } from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { AssignmentWithDetails } from '@/types';
import { getCalendarDaysDiff, formatFriendlyDate } from '@/utils/dateUtils';
import { getSmartTodayItems } from '@/utils/smartAutomationUtils';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Flame,
  UploadCloud,
  CheckCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface SmartTodayTriageProps {
  onOpenDetails: (assignmentId: string) => void;
  onEditAssignment?: (assignment: AssignmentWithDetails) => void;
}

export const SmartTodayTriage: React.FC<SmartTodayTriageProps> = ({
  onOpenDetails,
}) => {
  const {
    assignments,
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
  } = useAssignments();

  const [activeTab, setActiveTab] = useState<'all' | 'due' | 'erp' | 'check'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const {
    overdue,
    dueToday,
    dueTomorrow,
    completedNotUploaded,
    uploadedNotChecked,
    totalActionable,
  } = getSmartTodayItems(assignments);

  // Filter based on selected sub-tab
  const getDisplayedItems = () => {
    if (activeTab === 'due') {
      return [
        ...overdue.map((a) => ({ item: a, type: 'overdue' as const })),
        ...dueToday.map((a) => ({ item: a, type: 'due_today' as const })),
        ...dueTomorrow.map((a) => ({ item: a, type: 'due_tomorrow' as const })),
      ];
    }
    if (activeTab === 'erp') {
      return completedNotUploaded.map((a) => ({ item: a, type: 'pending_erp' as const }));
    }
    if (activeTab === 'check') {
      return uploadedNotChecked.map((a) => ({ item: a, type: 'pending_check' as const }));
    }
    // 'all' combines all actionable items
    return [
      ...overdue.map((a) => ({ item: a, type: 'overdue' as const })),
      ...dueToday.map((a) => ({ item: a, type: 'due_today' as const })),
      ...dueTomorrow.map((a) => ({ item: a, type: 'due_tomorrow' as const })),
      ...completedNotUploaded.map((a) => ({ item: a, type: 'pending_erp' as const })),
      ...uploadedNotChecked.map((a) => ({ item: a, type: 'pending_check' as const })),
    ];
  };

  const displayedItems = getDisplayedItems();

  const handleQuickAction = async (
    e: React.MouseEvent,
    assignment: AssignmentWithDetails,
    type: 'overdue' | 'due_today' | 'due_tomorrow' | 'pending_erp' | 'pending_check'
  ) => {
    e.stopPropagation();
    setActionLoadingId(assignment.id);
    try {
      if (type === 'overdue' || type === 'due_today' || type === 'due_tomorrow') {
        await toggleComplete(assignment.id, true);
      } else if (type === 'pending_erp') {
        await toggleErpUpload(assignment.id, true);
      } else if (type === 'pending_check') {
        await toggleProfessorCheck(assignment.id, true);
      }
    } catch (err) {
      console.error('Quick action error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4 sm:space-y-5 relative overflow-hidden w-full min-w-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10 w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center shadow-xs flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#171A2E] dark:text-white">
                Today's Action Center
              </h2>
              {totalActionable > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEECFF] text-[#5B4DF5] dark:bg-[#5B4DF5]/20 dark:text-[#A49DFC] border border-[#5B4DF5]/20">
                  {totalActionable} actionable
                </span>
              )}
            </div>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] leading-tight mt-0.5">
              Automated triage of upcoming deadlines and pending academic verifications
            </p>
          </div>
        </div>

        {/* Triage Filter Tabs (Scrollable on mobile) */}
        {totalActionable > 0 && (
          <div className="w-full sm:w-auto max-w-full overflow-x-auto no-scrollbar pb-0.5">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] text-xs font-semibold border border-[#E6E9F2] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-[#171A2E] dark:text-white shadow-tf-subtle'
                    : 'text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white'
                }`}
              >
                All ({totalActionable})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('due')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'due'
                    ? 'bg-white dark:bg-slate-700 text-[#171A2E] dark:text-white shadow-tf-subtle'
                    : 'text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white'
                }`}
              >
                Deadlines ({overdue.length + dueToday.length + dueTomorrow.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('erp')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'erp'
                    ? 'bg-white dark:bg-slate-700 text-[#171A2E] dark:text-white shadow-tf-subtle'
                    : 'text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white'
                }`}
              >
                ERP ({completedNotUploaded.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('check')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'check'
                    ? 'bg-white dark:bg-slate-700 text-[#171A2E] dark:text-white shadow-tf-subtle'
                    : 'text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white'
                }`}
              >
                Check ({uploadedNotChecked.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items List / Triage Cards (Card entry: 450ms · 12px rise · 98.5% scale · 60ms stagger) */}
      <div className="relative z-10">
        {totalActionable === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 px-4 text-center rounded-2xl border-2 border-dashed border-[#19A974]/30 bg-[#E8F8F1]/40 dark:bg-emerald-950/20"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F1] dark:bg-emerald-900/60 text-[#19A974] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#171A2E] dark:text-white">
              You're all caught up! 🎉
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-md mx-auto mt-1 leading-relaxed">
              No overdue tasks, zero pending ERP uploads, and no urgent submissions requiring your
              attention right now.
            </p>
          </motion.div>
        ) : displayedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9499AB] italic">
            No items under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {displayedItems.map(({ item, type }, idx) => {
                const isOverdue = type === 'overdue';
                const isDueToday = type === 'due_today';
                const isDueTomorrow = type === 'due_tomorrow';
                const isPendingErp = type === 'pending_erp';
                const isPendingCheck = type === 'pending_check';

                let statusBadge = null;
                let actionBtnText = 'Complete';
                let actionBtnClass = 'bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white';

                if (isOverdue) {
                  const days = Math.abs(getCalendarDaysDiff(item.due_date));
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F1] text-[#E04F5F] dark:bg-rose-950/60 dark:text-rose-300 border border-[#E04F5F]/20">
                      <Flame className="w-3 h-3" /> Overdue ({days}d)
                    </span>
                  );
                  actionBtnText = 'Mark Done';
                  actionBtnClass = 'bg-[#E04F5F] hover:bg-[#C93B4B] text-white';
                } else if (isDueToday) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F1] text-[#E04F5F] dark:bg-rose-950/60 dark:text-rose-300 border border-[#E04F5F]/20">
                      <Clock className="w-3 h-3" /> Due Today
                    </span>
                  );
                  actionBtnText = 'Mark Done';
                  actionBtnClass = 'bg-[#E04F5F] hover:bg-[#C93B4B] text-white';
                } else if (isDueTomorrow) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5DF] text-[#D68A16] dark:bg-amber-950/60 dark:text-amber-300 border border-[#D68A16]/20">
                      <Calendar className="w-3 h-3" /> Due Tomorrow
                    </span>
                  );
                  actionBtnText = 'Mark Done';
                  actionBtnClass = 'bg-[#D68A16] hover:bg-[#BF780F] text-white';
                } else if (isPendingErp) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEECFF] text-[#5B4DF5] dark:bg-[#5B4DF5]/20 dark:text-[#A49DFC] border border-[#5B4DF5]/20">
                      <UploadCloud className="w-3 h-3" /> Needs ERP Upload
                    </span>
                  );
                  actionBtnText = 'Upload to ERP';
                  actionBtnClass = 'bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white';
                } else if (isPendingCheck) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F1] text-[#19A974] dark:bg-emerald-950/60 dark:text-emerald-300 border border-[#19A974]/20">
                      <CheckCheck className="w-3 h-3" /> Awaiting Check
                    </span>
                  );
                  actionBtnText = 'Mark Checked';
                  actionBtnClass = 'bg-[#19A974] hover:bg-[#158F62] text-white';
                }

                return (
                  <motion.div
                    key={`${item.id}-${type}`}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(idx * 0.06, 0.3),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() => onOpenDetails(item.id)}
                    className="p-4 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] hover:border-[#5B4DF5]/50 transition-all flex flex-col justify-between gap-3 shadow-tf-subtle cursor-pointer group min-w-0 w-full"
                  >
                    <div className="space-y-2 min-w-0 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <SubjectBadge subject={item.subject} />
                        {statusBadge}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-heading font-bold text-[#171A2E] dark:text-white line-clamp-1 break-words group-hover:text-[#5B4DF5] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#5C6175] dark:text-[#94A3B8] mt-0.5">
                          {isPendingErp
                            ? `Completed · Due was ${formatFriendlyDate(item.due_date)}`
                            : isPendingCheck
                            ? `Uploaded · Due: ${formatFriendlyDate(item.due_date)}`
                            : `Due: ${formatFriendlyDate(item.due_date)}`}
                        </p>
                      </div>
                    </div>

                    {/* Quick 1-click action trigger (Button feedback 200ms) */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E6E9F2]/80 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-[#5C6175] dark:text-[#94A3B8] flex items-center gap-1 group-hover:text-[#171A2E] transition-colors">
                        View <ChevronRight className="w-3 h-3 opacity-60" />
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98, y: 1 }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        disabled={actionLoadingId === item.id}
                        onClick={(e) => handleQuickAction(e, item, type)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${actionBtnClass}`}
                      >
                        {actionLoadingId === item.id ? (
                          <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                        <span>{actionBtnText}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
