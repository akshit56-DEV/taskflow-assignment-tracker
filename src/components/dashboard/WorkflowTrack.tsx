import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import { getCalendarDaysDiff } from '@/utils/dateUtils';
import { ShieldCheck, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const WorkflowTrack: React.FC = () => {
  const { assignments, setFilters } = useAssignments();
  const navigate = useNavigate();

  // Compute live counts for all 5 stages from real assignments
  const activeAssignments = assignments.filter((a) => !a.is_deleted && !a.is_archived);

  const counts = {
    not_started: 0,
    in_progress: 0,
    completed: 0,
    uploaded: 0,
    checked: 0,
  };

  activeAssignments.forEach((a) => {
    const stage = getDerivedWorkflowStage(a);
    counts[stage]++;
  });

  const overdueCount = activeAssignments.filter(
    (a) => !a.completed && getCalendarDaysDiff(a.due_date) < 0
  ).length;

  const pendingFinalSteps = counts.completed + counts.uploaded;

  const handleStageClick = (stage: string) => {
    setFilters((prev) => ({
      ...prev,
      statusWorkflow: stage as typeof prev.statusWorkflow,
    }));
    navigate('/assignments');
  };

  const stages = [
    {
      id: 'not_started',
      label: 'Not Started',
      count: counts.not_started,
      badgeColor: 'bg-slate-400',
      activeBg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: counts.in_progress,
      badgeColor: 'bg-[#5B4DF5]',
      activeBg: 'bg-[#EEECFF]/60 dark:bg-[#5B4DF5]/15 border-[#5B4DF5]/20',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      badgeColor: 'bg-[#19A974]',
      activeBg: 'bg-[#E8F8F1]/60 dark:bg-emerald-950/20 border-[#19A974]/20',
    },
    {
      id: 'uploaded',
      label: 'ERP Uploaded',
      count: counts.uploaded,
      badgeColor: 'bg-[#0D9488]',
      activeBg: 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-200/30',
      isErp: true,
    },
    {
      id: 'checked',
      label: 'Prof. Checked',
      count: counts.checked,
      badgeColor: 'bg-[#19A974]',
      activeBg: 'bg-[#E8F8F1]/60 dark:bg-emerald-950/20 border-[#19A974]/20',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-4 sm:p-6 shadow-sm overflow-hidden w-full min-w-0 max-w-full"
    >
      {/* Top Brief Header */}
      <div className="space-y-3.5 sm:space-y-4 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#5B4DF5] dark:text-[#A49DFC] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#5B4DF5]" />
            <span>Academic Workflow Status</span>
          </div>
          <span className="text-[11px] font-semibold text-[#5C6175] dark:text-[#94A3B8]">
            {activeAssignments.length} total active tracked
          </span>
        </div>

        <div>
          <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-[#171A2E] dark:text-white leading-tight break-words">
            {overdueCount > 0
              ? `Attention needed. ${overdueCount} ${
                  overdueCount === 1 ? 'assignment is overdue' : 'assignments are overdue'
                }.`
              : pendingFinalSteps > 0
              ? `You're on track. ${pendingFinalSteps} ${
                  pendingFinalSteps === 1 ? 'submission needs' : 'submissions need'
                } a final step.`
              : 'All caught up! Every assignment has closed the verification loop.'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1 leading-relaxed">
            TaskFlow ensures your work is not just finished on your laptop, but officially uploaded
            and professor-verified.
          </p>
        </div>

        {/* Semantic Workflow Signals Badges */}
        {(overdueCount > 0 || counts.uploaded > 0 || counts.completed > 0 || (activeAssignments.length > 0 && pendingFinalSteps === 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
            {overdueCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, statusWorkflow: 'all' }));
                  navigate('/assignments');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F1] dark:bg-rose-950/40 text-[#E04F5F] dark:text-rose-300 border border-[#E04F5F]/30 text-xs font-semibold cursor-pointer hover:bg-[#FDE2E4] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E04F5F]" />
                <span>{overdueCount} Overdue</span>
              </button>
            )}

            {counts.completed > 0 && (
              <button
                type="button"
                onClick={() => handleStageClick('completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5DF] dark:bg-amber-950/40 text-[#D68A16] dark:text-amber-300 border border-[#D68A16]/30 text-xs font-semibold cursor-pointer hover:bg-[#FDECC8] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D68A16]" />
                <span>{counts.completed} Needs ERP Upload</span>
              </button>
            )}

            {counts.uploaded > 0 && (
              <button
                type="button"
                onClick={() => handleStageClick('uploaded')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] dark:text-[#A49DFC] border border-[#5B4DF5]/30 text-xs font-semibold cursor-pointer hover:bg-[#E4E0FF] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DF5]" />
                <span>{counts.uploaded} Awaiting Prof Check</span>
              </button>
            )}

            {activeAssignments.length > 0 && pendingFinalSteps === 0 && overdueCount === 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8F1] dark:bg-emerald-950/40 text-[#19A974] dark:text-emerald-300 border border-[#19A974]/30 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#19A974]" />
                <span>All Verified & Up to Date</span>
              </span>
            )}
          </div>
        )}

        {/* 5-Stage Interactive Pipeline Sequence */}
        <div className="pt-3 border-t border-[#E6E9F2]/80 dark:border-slate-800 w-full min-w-0 max-w-full">
          <div className="w-full min-w-0 max-w-full overflow-x-auto no-scrollbar touch-pan-x py-1">
            <div className="flex items-center justify-between min-w-[480px] sm:min-w-0 sm:w-full py-1">
              {stages.map((stage, idx) => (
                <React.Fragment key={stage.id}>
                  <div
                    onClick={() => handleStageClick(stage.id)}
                    className={`flex flex-col items-center flex-1 cursor-pointer p-1.5 sm:p-2 rounded-xl border transition-all ${
                      stage.count > 0
                        ? `${stage.activeBg} hover:opacity-90`
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                    title={`Filter by ${stage.label}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs ${
                          stage.count > 0 ? stage.badgeColor : 'bg-[#E6E9F2] dark:bg-slate-700 text-[#9499AB]'
                        }`}
                      >
                        {stage.id === 'checked' && stage.count > 0 ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : stage.count > 0 ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="font-heading font-extrabold text-xs sm:text-sm text-[#171A2E] dark:text-white">
                        {stage.count}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-[#171A2E] dark:text-slate-200 text-center whitespace-nowrap">
                      {stage.label}
                    </span>
                  </div>

                  {idx < stages.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 mx-0.5 sm:mx-1 rounded-full ${
                        stage.count > 0 && stages[idx + 1].count > 0
                          ? 'bg-[#5B4DF5]'
                          : 'bg-[#E6E9F2] dark:bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Mobile swipe helper */}
          <div className="sm:hidden text-right pt-1">
            <span className="text-[10px] font-medium text-[#9499AB]">
              Swipe to see all five stages →
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
