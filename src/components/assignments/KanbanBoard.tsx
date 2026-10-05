import React, { useState } from 'react';
import { AssignmentWithDetails, DerivedWorkflowStage } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
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
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16B8D4]" />,
    accentColor: '#16B8D4',
    accentBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    accentBorder: 'border-[#16B8D4]/30',
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
    icon: <UploadCloud className="w-3.5 h-3.5 text-[#7970D9]" />,
    accentColor: '#7970D9',
    accentBg: 'bg-[#F2EFFE] dark:bg-[#7970D9]/20',
    accentBorder: 'border-[#7970D9]/30',
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
    accentBg: 'bg-[#E8F8F1] dark:bg-emerald-950/30',
    accentBorder: 'border-[#19A974]/30',
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

    // Approximate completion progress for visual feedback
    const progressPercent = assignment.professor_checked
      ? 100
      : assignment.uploaded_to_erp
      ? 90
      : assignment.completed
      ? 75
      : currentStage === 'in_progress'
      ? 45
      : 0;

    return (
      <motion.div
        key={assignment.id}
        layout
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.45,
          delay: Math.min(index * 0.04, 0.25),
          ease: [0.16, 1, 0.3, 1],
        }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, assignment.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onOpenDetails(assignment)}
        className={`group relative rounded-[14px] bg-white dark:bg-[#11142B] border transition-all cursor-pointer p-4 shadow-tf-subtle hover:shadow-tf-card space-y-3 select-none ${
          draggedAssignmentId === assignment.id
            ? 'opacity-40 border-dashed border-[#5B4DF5]'
            : 'border-[#E6E9F2] dark:border-[#1E293B] hover:border-[#5B4DF5]/40'
        }`}
      >
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <SubjectBadge subject={assignment.subject} size="sm" />
            <PriorityBadge priority={assignment.priority} size="sm" />
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

        {/* Progress line */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#9499AB]">
            <span>Workflow Completion</span>
            <span className="font-bold text-[#171A2E] dark:text-slate-200">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#F5F7FB] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-[#E6E9F2]/80 dark:border-slate-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: column.accentColor,
              }}
            />
          </div>
        </div>

        {/* 5-Stage Mini Dot Tracker (Figma WorkflowTracker inside card) */}
        <div className="pt-2 border-t border-[#E6E9F2]/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {COLUMNS.map((col, idx) => {
              const isCurrent = col.id === currentStage;
              const isPast = col.stepNumber < column.stepNumber;
              return (
                <div key={col.id} className="flex items-center">
                  <div
                    title={`${col.title} (${col.subtitle})`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'w-2.5 h-2.5 shadow-xs'
                        : isPast
                        ? 'opacity-80'
                        : 'opacity-25'
                    }`}
                    style={{ backgroundColor: col.accentColor }}
                  />
                  {idx < COLUMNS.length - 1 && (
                    <div
                      className={`w-2 h-[1px] ${
                        isPast ? 'bg-[#5B4DF5]' : 'bg-[#E6E9F2] dark:bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Step Advance Button */}
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {column.prevStage && (
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleMoveToStage(assignment.id, column.prevStage!, e)}
                className="p-1 rounded-lg text-[#9499AB] hover:text-[#171A2E] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Move back to ${column.prevStage}`}
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            {column.nextStage ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97, y: 1 }}
                transition={{ duration: 0.2 }}
                type="button"
                disabled={isLoading}
                onClick={(e) => handleMoveToStage(assignment.id, column.nextStage!, e)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer shadow-2xs"
                style={{ backgroundColor: column.accentColor }}
              >
                {isLoading ? (
                  <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{column.nextActionLabel}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </>
                )}
              </motion.button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#19A974] bg-[#E8F8F1] dark:bg-emerald-950/40">
                <CheckCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mobile Stage Selector Tabs (Figma 16 — Mobile Kanban) */}
      <div className="xl:hidden flex items-center gap-1 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] overflow-x-auto no-scrollbar">
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

      {/* Kanban Columns Grid (Figma 09 — Three to Five columns board) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-6 no-scrollbar">
        {COLUMNS.map((column, colIndex) => {
          const columnAssignments = grouped[column.id] || [];
          const isDragOver = dragOverColumn === column.id;
          const isHiddenOnMobile = activeMobileStage !== column.id;

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: colIndex * 0.05 }}
              onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, column.id)}
              onDragLeave={() => handleDragLeave(column.id)}
              onDrop={(e) => handleDrop(e as unknown as React.DragEvent, column.id)}
              className={`flex flex-col rounded-2xl p-3 sm:p-3.5 transition-all min-w-[270px] ${
                isHiddenOnMobile ? 'hidden xl:flex' : 'flex'
              } ${
                isDragOver
                  ? 'bg-[#EEECFF]/70 dark:bg-[#5B4DF5]/15 border-2 border-dashed border-[#5B4DF5] shadow-tf-card scale-[1.01]'
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
  );
};
