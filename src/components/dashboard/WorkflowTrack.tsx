import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { useNavigate } from 'react-router-dom';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import { Sparkles, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const WorkflowTrack: React.FC = () => {
  const { assignments, setFilters } = useAssignments();
  const navigate = useNavigate();

  // Compute live counts for all 5 stages from real assignments
  const activeAssignments = assignments.filter((a) => !a.is_deleted && !a.is_archived);
  const total = activeAssignments.length || 1;

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
      color: 'bg-[#9499AB]',
      activeColor: 'text-[#9499AB]',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: counts.in_progress,
      color: 'bg-[#5B4DF5]',
      activeColor: 'text-[#5B4DF5]',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      color: 'bg-[#16B8D4]',
      activeColor: 'text-[#16B8D4]',
    },
    {
      id: 'uploaded',
      label: 'ERP Uploaded',
      count: counts.uploaded,
      color: 'bg-[#7970D9]',
      activeColor: 'text-[#7970D9]',
      isErp: true,
    },
    {
      id: 'checked',
      label: 'Prof. Checked',
      count: counts.checked,
      color: 'bg-[#19A974]',
      activeColor: 'text-[#19A974]',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-5 sm:p-6 shadow-tf-card overflow-hidden"
    >
      {/* Figma Signature Gradient Rail on Left */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-rail" />

      {/* Top Brief Header */}
      <div className="pl-3 sm:pl-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#5B4DF5] dark:text-[#A49DFC] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#5B4DF5]" />
            <span>Academic Attention Brief</span>
          </div>
          <span className="text-[11px] font-semibold text-[#5C6175] dark:text-[#94A3B8]">
            {activeAssignments.length} total active tracked
          </span>
        </div>

        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#171A2E] dark:text-white">
            {pendingFinalSteps > 0
              ? `You're on track. ${pendingFinalSteps} ${
                  pendingFinalSteps === 1 ? 'submission needs' : 'submissions need'
                } a final step.`
              : 'All caught up! Every assignment has closed the verification loop.'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1">
            TaskFlow ensures your work is not just finished on your laptop, but officially uploaded
            and professor-verified.
          </p>
        </div>

        {/* Workflow Signals Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {counts.uploaded > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStageClick('uploaded')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] dark:text-[#A49DFC] border border-[#5B4DF5]/20 text-xs font-bold cursor-pointer transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DF5] animate-pulse" />
              <span>{counts.uploaded} Awaiting Professor Check</span>
            </motion.div>
          )}

          {counts.completed > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStageClick('completed')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5DF] dark:bg-amber-950/40 text-[#D68A16] dark:text-amber-300 border border-[#D68A16]/20 text-xs font-bold cursor-pointer transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D68A16]" />
              <span>{counts.completed} Completed locally · Needs ERP upload</span>
            </motion.div>
          )}

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-400 text-xs font-medium border border-[#E6E9F2] dark:border-slate-700">
            <span>Principle: Completed ≠ Submitted ≠ Checked</span>
          </div>
        </div>

        {/* 5-Stage Interactive Pipeline Sequence (Canvas 17 Workflow Stage Spec: 200ms, 3px rise) */}
        <div className="pt-3 border-t border-[#E6E9F2]/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[520px] py-1">
            {stages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleStageClick(stage.id)}
                  className={`flex flex-col items-center flex-1 cursor-pointer p-2.5 rounded-xl transition-all ${
                    stage.count > 0
                      ? 'hover:bg-[#F5F7FB] dark:hover:bg-slate-800/60'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`Filter by ${stage.label}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs ${
                        stage.count > 0 ? stage.color : 'bg-[#E6E9F2] dark:bg-slate-700 text-[#9499AB]'
                      }`}
                    >
                      {stage.id === 'checked' && stage.count > 0 ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : stage.count > 0 ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#171A2E] dark:text-white">
                      {stage.count}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#171A2E] dark:text-slate-200 text-center whitespace-nowrap">
                    {stage.label}
                  </span>
                  <span className="text-[9px] text-[#9499AB]">
                    {Math.round((stage.count / total) * 100)}% of total
                  </span>
                </motion.div>

                {idx < stages.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-1 rounded-full ${
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
      </div>
    </motion.section>
  );
};
