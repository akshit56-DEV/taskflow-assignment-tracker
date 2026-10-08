import React, { useState } from 'react';
import { AssignmentWithDetails, DerivedWorkflowStage } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getDerivedWorkflowStage, getAutomaticPriority } from '@/utils/workflowUtils';
import { erpService } from '@/services/erpService';
import { updateAssignment } from '@/services/assignmentService';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { formatFriendlyDate, getCalendarDaysDiff, getDeadlineUrgency } from '@/utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Circle,
  PlayCircle,
  CheckCircle2,
  UploadCloud,
  CheckCheck,
  Calendar,
  MoreVertical,
  Eye,
  Edit2,
  Archive,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Flame,
  Clock,
  Sparkles,
  Plus,
  ExternalLink,
  Check,
} from 'lucide-react';

interface KanbanBoardProps {
  assignments: AssignmentWithDetails[];
  onOpenDetails: (assignment: AssignmentWithDetails) => void;
  onEdit: (assignment: AssignmentWithDetails) => void;
  onAddInStage?: (stage: DerivedWorkflowStage) => void;
}

interface ColumnDef {
  id: DerivedWorkflowStage;
  stepNumber: number;
  title: string;
  shortLabel: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  nextStage?: DerivedWorkflowStage;
  nextActionLabel?: string;
  prevStage?: DerivedWorkflowStage;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'not_started',
    stepNumber: 1,
    title: 'To do',
    shortLabel: 'To do',
    subtitle: 'Step 1 · Backlog & fresh assignments',
    icon: <Circle className="w-3.5 h-3.5 text-[#9499AB]" />,
    accentColor: '#9499AB',
    accentBg: 'bg-[#9499AB]/10',
    accentBorder: 'border-[#9499AB]/30',
    nextStage: 'in_progress',
    nextActionLabel: 'Start Work',
  },
  {
    id: 'in_progress',
    stepNumber: 2,
    title: 'In progress',
    shortLabel: 'In prog.',
    subtitle: 'Step 2 · Currently being worked on',
    icon: <PlayCircle className="w-3.5 h-3.5 text-[#5B4DF5]" />,
    accentColor: '#5B4DF5',
    accentBg: 'bg-[#EEECFF] dark:bg-[#5B4DF5]/20',
    accentBorder: 'border-[#5B4DF5]/30',
    nextStage: 'completed',
    nextActionLabel: 'Mark Complete',
    prevStage: 'not_started',
  },
  {
    id: 'completed',
    stepNumber: 3,
    title: 'Completed',
    shortLabel: 'Done',
    subtitle: 'Step 3 · Finished locally · Needs ERP upload next',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#19A974]" />,
    accentColor: '#19A974',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accentBorder: 'border-emerald-200/50 dark:border-emerald-800/40',
    nextStage: 'uploaded',
    nextActionLabel: 'Upload to ERP',
    prevStage: 'in_progress',
  },
  {
    id: 'uploaded',
    stepNumber: 4,
    title: 'ERP Uploaded',
    shortLabel: 'ERP',
    subtitle: 'Step 4 · In student portal · Awaiting check',
    icon: <UploadCloud className="w-3.5 h-3.5 text-[#0D9488]" />,
    accentColor: '#0D9488',
    accentBg: 'bg-teal-50 dark:bg-teal-950/30',
    accentBorder: 'border-teal-200/50 dark:border-teal-800/40',
    nextStage: 'checked',
    nextActionLabel: 'Confirm Checked',
    prevStage: 'completed',
  },
  {
    id: 'checked',
    stepNumber: 5,
    title: 'Prof. Checked',
    shortLabel: 'Checked',
    subtitle: 'Step 5 · Faculty verified · Semester loop closed',
    icon: <CheckCheck className="w-3.5 h-3.5 text-[#19A974]" />,
    accentColor: '#19A974',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accentBorder: 'border-emerald-200/50 dark:border-emerald-800/40',
    prevStage: 'uploaded',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  assignments,
  onOpenDetails,
  onEdit,
  onAddInStage,
}) => {
  const {
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
    deleteAssignmentQuick,
    archiveAssignmentQuick,
    refreshData,
  } = useAssignments();

  const [activeMobileStage, setActiveMobileStage] = useState<DerivedWorkflowStage>('in_progress');
  const [dragOverColumn, setDragOverColumn] = useState<DerivedWorkflowStage | null>(null);
  const [draggedAssignmentId, setDraggedAssignmentId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Group assignments into 5 stages
  const grouped = assignments.reduce<Record<DerivedWorkflowStage, AssignmentWithDetails[]>>(
    (acc, curr) => {
      const stage = getDerivedWorkflowStage(curr);
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(curr);
      return acc;
    },
    {
      not_started: [],
      in_progress: [],
      completed: [],
      uploaded: [],
      checked: [],
    }
  );

  // Transition assignment to target stage
  const handleMoveToStage = async (
    assignmentId: string,
    targetStage: DerivedWorkflowStage,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setActionLoadingId(assignmentId);

    try {
      if (targetStage === 'checked') {
        await toggleComplete(assignmentId, true);
        await toggleErpUpload(assignmentId, true);
        await toggleProfessorCheck(assignmentId, true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#19A974', '#16B8D4', '#5B4DF5'],
        });
      } else if (targetStage === 'uploaded') {
        await toggleComplete(assignmentId, true);
        await toggleErpUpload(assignmentId, true);
        await toggleProfessorCheck(assignmentId, false);
      } else if (targetStage === 'completed') {
        await toggleComplete(assignmentId, true);
        await toggleErpUpload(assignmentId, false);
        await toggleProfessorCheck(assignmentId, false);
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#16B8D4', '#5B4DF5'],
        });
      } else if (targetStage === 'in_progress') {
        await toggleProfessorCheck(assignmentId, false);
        await toggleErpUpload(assignmentId, false);
        await toggleComplete(assignmentId, false);
        try {
          await updateAssignment(assignmentId, { progress_status: 'in_progress' });
          await refreshData();
        } catch (err) {
          console.error(err);
        }
      } else if (targetStage === 'not_started') {
        await toggleProfessorCheck(assignmentId, false);
        await toggleErpUpload(assignmentId, false);
        await toggleComplete(assignmentId, false);
        try {
          await updateAssignment(assignmentId, { progress_status: 'not_started' });
          await refreshData();
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error('Error shifting Kanban stage:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedAssignmentId(id);
  };

  const handleDragEnd = () => {
    setDraggedAssignmentId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: DerivedWorkflowStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== stageId) {
      setDragOverColumn(stageId);
    }
  };

  const handleDragLeave = (stageId: DerivedWorkflowStage) => {
    if (dragOverColumn === stageId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: DerivedWorkflowStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedAssignmentId;
    setDragOverColumn(null);
    setDraggedAssignmentId(null);

    if (!id) return;
    const item = assignments.find((a) => a.id === id);
    if (!item) return;

    const currentStage = getDerivedWorkflowStage(item);
    if (currentStage !== targetStage) {
      await handleMoveToStage(id, targetStage);
    }
  };

  // Card subcomponent
  const renderCard = (assignment: AssignmentWithDetails, column: ColumnDef, index: number) => {
    const currentStage = getDerivedWorkflowStage(assignment);
    const daysDiff = getCalendarDaysDiff(assignment.due_date);
    const urgency = getDeadlineUrgency(assignment.due_date, assignment.completed);
    const isMenuOpen = menuOpenId === assignment.id;
    const isLoading = actionLoadingId === assignment.id;

    const cardSemanticBorder = assignment.completed
      ? 'border-l-4 border-l-[#19A974]'
      : urgency === 'Overdue'
      ? 'border-l-4 border-l-[#E04F5F] bg-rose-50/10 dark:bg-rose-950/10'
      : urgency === 'Critical'
      ? 'border-l-4 border-l-[#D68A16] bg-amber-50/10 dark:bg-amber-950/10'
      : 'border-l-4 border-l-transparent';

    return (
      <motion.div
        key={assignment.id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          delay: Math.min(index * 0.03, 0.15),
          ease: 'easeOut',
        }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, assignment.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onOpenDetails(assignment)}
        className={`group relative rounded-[14px] bg-white dark:bg-[#11142B] border transition-all cursor-pointer p-3.5 shadow-xs hover:shadow-sm space-y-3 select-none ${cardSemanticBorder} ${
          draggedAssignmentId === assignment.id
            ? 'opacity-40 border-dashed border-[#5B4DF5]'
            : 'border-[#E6E9F2] dark:border-[#1E293B] hover:border-[#5B4DF5]/40'
        }`}
      >
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <SubjectBadge subject={assignment.subject} size="sm" />
            <PriorityBadge priority={getAutomaticPriority(assignment)} size="sm" />
            {urgency === 'Overdue' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F1] text-[#E04F5F] dark:bg-rose-950/60 dark:text-rose-300 border border-[#E04F5F]/20">
                <Flame className="w-2.5 h-2.5" />
                Overdue
              </span>
            )}
            {urgency === 'Critical' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F1] text-[#E04F5F] dark:bg-rose-950/60 dark:text-rose-300 border border-[#E04F5F]/20">
                <Clock className="w-2.5 h-2.5" />
                Today
              </span>
            )}
          </div>

          <div
            className="relative flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMenuOpenId(isMenuOpen ? null : assignment.id)}
              className="p-1 rounded-lg text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#15172F] transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] rounded-xl shadow-tf-modal py-1.5 z-30"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpenId(null);
                      onOpenDetails(assignment);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-[#171A2E] dark:text-slate-200 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5C6175]" />
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpenId(null);
                      onEdit(assignment);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-[#171A2E] dark:text-slate-200 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#5C6175]" />
                    Edit Task
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpenId(null);
                      await archiveAssignmentQuick(assignment.id, true);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-[#171A2E] dark:text-slate-200 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#5C6175]" />
                    Archive
                  </button>
                  <div className="h-px bg-[#E6E9F2] dark:bg-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpenId(null);
                      if (window.confirm(`Move "${assignment.title}" to trash?`)) {
                        await deleteAssignmentQuick(assignment.id);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-[#E04F5F] hover:bg-[#FFF0F1] dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#E04F5F]" />
                    Move to Trash
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <div>
          <h4 className="font-heading font-bold text-xs sm:text-sm text-[#171A2E] dark:text-white leading-snug line-clamp-2 group-hover:text-[#5B4DF5] transition-colors">
            {assignment.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9499AB] mt-1">
            <Calendar className="w-3 h-3 text-[#5B4DF5]" />
            <span>
              {daysDiff === 0
                ? 'Due today'
                : daysDiff === 1
                ? 'Due tomorrow'
                : daysDiff < 0
                ? `Overdue (${Math.abs(daysDiff)}d)`
                : `Due ${formatFriendlyDate(assignment.due_date)}`}
            </span>
          </div>
        </div>

        {/* 5-Stage Mini Dot Tracker (Figma WorkflowTracker inside card) */}
        {/* Row 1: Mini Workflow Dots + Step indicator & Back navigation */}
        <div className="pt-2.5 border-t border-[#E6E9F2]/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {COLUMNS.map((col, idx) => {
                const isCurrent = col.id === currentStage;
                const isPast = col.stepNumber < column.stepNumber;
                return (
                  <div key={col.id} className="flex items-center">
                    <div
                      title={`${col.title} (${col.subtitle})`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'w-2.5 h-2.5 shadow-xs ring-2 ring-[#5B4DF5]/20'
                          : isPast
                          ? 'opacity-80'
                          : 'opacity-25'
                      }`}
                      style={{ backgroundColor: col.accentColor }}
                    />
                    {idx < COLUMNS.length - 1 && (
                      <div
                        className={`w-1.5 h-[1px] ${
                          isPast ? 'bg-[#5B4DF5]' : 'bg-[#E6E9F2] dark:bg-slate-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-[#9499AB] font-semibold">
              Step {column.stepNumber}/5
            </span>
          </div>

          {column.prevStage && (
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleMoveToStage(assignment.id, column.prevStage!, e)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white px-1.5 py-0.5 rounded hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Move back to ${column.prevStage}`}
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Row 2: Stage-Specific Action Buttons (Spacious, full-width, perfectly readable) */}
        <div
          className="flex flex-col gap-1.5 w-full min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {column.id === 'completed' ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  erpService.openERP();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5B4DF5] text-white hover:bg-[#4B3CE0] transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                title="Launch official JECRC MasterSoft ERP portal in new tab"
              >
                <span>Upload to JECRC ERP</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                type="button"
                disabled={isLoading}
                onClick={(e) => handleMoveToStage(assignment.id, 'uploaded', e)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D9488] text-white hover:bg-[#0F766E] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                title="Mark this assignment as uploaded to ERP"
              >
                {isLoading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Mark Uploaded to ERP</span>
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                  </>
                )}
              </motion.button>
            </>
          ) : column.id === 'uploaded' ? (
            <div className="flex items-center gap-1.5 w-full">
              <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold bg-teal-50 text-[#0D9488] dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/50 truncate">
                <Check className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">ERP Uploaded</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                type="button"
                disabled={isLoading}
                onClick={(e) => handleMoveToStage(assignment.id, 'checked', e)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#19A974] hover:bg-[#14835A] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                title="Confirm professor has checked this assignment"
              >
                {isLoading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Checked</span>
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                  </>
                )}
              </motion.button>
            </div>
          ) : column.nextStage ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              type="button"
              disabled={isLoading}
              onClick={(e) => handleMoveToStage(assignment.id, column.nextStage!, e)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              style={{ backgroundColor: column.accentColor }}
            >
              {isLoading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{column.nextActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </>
              )}
            </motion.button>
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#19A974] bg-[#E8F8F1] dark:bg-emerald-950/40 border border-emerald-200/60">
              <CheckCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>✓ Verified by Professor</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Mobile Single-Column View with Stage Tabs (< sm) */}
      <div className="sm:hidden space-y-3">
        {/* Mobile Stage Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] overflow-x-auto no-scrollbar">
          {COLUMNS.map((col) => {
            const colAssignments = grouped[col.id] || [];
            const isActive = activeMobileStage === col.id;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveMobileStage(col.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-[#171A2E] dark:text-white shadow-tf-subtle'
                    : 'text-[#5C6175] dark:text-slate-400 hover:text-[#171A2E]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.accentColor }}
                />
                <span>{col.shortLabel}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#EEECFF] text-[#5B4DF5] dark:bg-slate-700 dark:text-white'
                      : 'bg-[#E6E9F2] text-[#5C6175] dark:bg-slate-800'
                  }`}
                >
                  {colAssignments.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Active Column */}
        {COLUMNS.filter((col) => col.id === activeMobileStage).map((column) => {
          const columnAssignments = grouped[column.id] || [];
          return (
            <div
              key={column.id}
              className="flex flex-col rounded-2xl p-3.5 bg-[#F5F7FB]/90 dark:bg-[#0B1020]/70 border border-[#E6E9F2] dark:border-[#1E293B] w-full min-w-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-xs"
                    style={{ backgroundColor: column.accentColor }}
                  />
                  <h3 className="font-heading font-extrabold text-xs tracking-wider uppercase text-[#171A2E] dark:text-white">
                    {column.title}{' '}
                    <span className="text-[#9499AB] normal-case font-bold">
                      · {columnAssignments.length}
                    </span>
                  </h3>
                </div>
                {onAddInStage && (
                  <button
                    type="button"
                    onClick={() => onAddInStage(column.id)}
                    className="p-1 rounded-md text-[#9499AB] hover:text-[#5B4DF5] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Add assignment to ${column.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-[10px] text-[#9499AB] px-1.5 pb-2.5 border-b border-[#E6E9F2]/80 dark:border-slate-800 leading-tight">
                {column.subtitle}
              </p>

              {/* Cards List */}
              <div className="flex-1 space-y-3 pt-3">
                <AnimatePresence mode="popLayout">
                  {columnAssignments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#E6E9F2] dark:border-[#1E293B] rounded-xl text-xs text-[#9499AB] bg-white/50 dark:bg-[#11142B]/40 space-y-1.5">
                      <Sparkles className="w-4 h-4 mx-auto text-[#9499AB]/60" />
                      <p className="text-[11px] font-medium">No tasks in this stage</p>
                    </div>
                  ) : (
                    columnAssignments.map((assignment, index) =>
                      renderCard(assignment, column, index)
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet & Desktop 5-Column Horizontal Board (Smooth horizontal scroll, full visibility, never clipped) */}
      <div className="hidden sm:block w-full max-w-full overflow-x-auto pb-6 pt-1">
        <div className="flex gap-4 items-start min-w-max pe-8 sm:pe-12">
          {COLUMNS.map((column, colIndex) => {
            const columnAssignments = grouped[column.id] || [];
            const isDragOver = dragOverColumn === column.id;

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: colIndex * 0.05 }}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, column.id)}
                onDragLeave={() => handleDragLeave(column.id)}
                onDrop={(e) => handleDrop(e as unknown as React.DragEvent, column.id)}
                className={`flex flex-col rounded-2xl p-3 sm:p-3.5 transition-colors w-[280px] sm:w-[290px] lg:w-[300px] flex-shrink-0 ${
                  isDragOver
                    ? 'bg-[#EEECFF]/70 dark:bg-[#5B4DF5]/15 border-2 border-dashed border-[#5B4DF5]'
                    : 'bg-[#F5F7FB]/90 dark:bg-[#0B1020]/70 border border-[#E6E9F2] dark:border-[#1E293B]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-xs"
                      style={{ backgroundColor: column.accentColor }}
                    />
                    <h3 className="font-heading font-extrabold text-xs tracking-wider uppercase text-[#171A2E] dark:text-white">
                      {column.title}{' '}
                      <span className="text-[#9499AB] normal-case font-bold">
                        · {columnAssignments.length}
                      </span>
                    </h3>
                  </div>

                  {onAddInStage && (
                    <button
                      type="button"
                      onClick={() => onAddInStage(column.id)}
                      className="p-1 rounded-md text-[#9499AB] hover:text-[#5B4DF5] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={`Add assignment to ${column.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Column Role Subtitle */}
                <p className="text-[10px] text-[#9499AB] px-1.5 pb-2.5 border-b border-[#E6E9F2]/80 dark:border-slate-800 leading-tight">
                  {column.subtitle}
                </p>

                {/* Cards List with Entrance Motion */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-290px)] pt-3 pr-0.5">
                  <AnimatePresence mode="popLayout">
                    {columnAssignments.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 text-center border border-dashed border-[#E6E9F2] dark:border-[#1E293B] rounded-xl text-xs text-[#9499AB] bg-white/50 dark:bg-[#11142B]/40 space-y-1.5"
                      >
                        <Sparkles className="w-4 h-4 mx-auto text-[#9499AB]/60" />
                        <p className="text-[11px] font-medium">No tasks in this stage</p>
                        <p className="text-[9px] text-[#9499AB]/80">
                          Drag cards here or advance previous tasks
                        </p>
                      </motion.div>
                    ) : (
                      columnAssignments.map((assignment, index) =>
                        renderCard(assignment, column, index)
                      )
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
