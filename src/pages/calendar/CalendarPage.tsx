import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { AssignmentWithDetails } from '@/types';
import {
  formatDateToIsoDate,
  getTodayDateString,
  getDeadlineUrgency,
  formatFriendlyDate,
} from '@/utils/dateUtils';
import { getDerivedWorkflowStage } from '@/utils/workflowUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  Circle,
  Eye,
  Edit2,
  UploadCloud,
  CheckCheck,
  Flame,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const CalendarPage: React.FC = () => {
  const {
    assignments,
    toggleComplete,
    toggleErpUpload,
    toggleProfessorCheck,
  } = useAssignments();

  const { onOpenAddModal, onEditAssignment, onOpenDetails } =
    useOutletContext<LayoutContextType>();

  const todayStr = getTodayDateString();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [monthDirection, setMonthDirection] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(todayStr);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handlePrevMonth = () => {
    setMonthDirection(-1);
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setMonthDirection(1);
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const handleGoToday = () => {
    const today = new Date();
    setMonthDirection(0);
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Build calendar grid days
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday as 0
  const daysInMonth = lastDayOfMonth.getDate();

  const daysArray: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    daysArray.push({
      dateStr: formatDateToIsoDate(d),
      dayNum: d.getDate(),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    daysArray.push({
      dateStr: formatDateToIsoDate(d),
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete the 35 or 42 grid cells
  const remainingCells = (7 - (daysArray.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    daysArray.push({
      dateStr: formatDateToIsoDate(d),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  // Group daysArray into weeks of 7 days each
  const weeks = useMemo(() => {
    const result: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[][] = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      result.push(daysArray.slice(i, i + 7));
    }
    return result;
  }, [daysArray]);

  // Determine which week row currently contains the selected date
  const selectedWeekIndex = useMemo(() => {
    if (!selectedDateStr) return -1;
    return weeks.findIndex((week) =>
      week.some((day) => day.dateStr === selectedDateStr)
    );
  }, [weeks, selectedDateStr]);

  const selectedDateAssignments = useMemo(() => {
    if (!selectedDateStr) return [];
    return assignments.filter(
      (a) => !a.is_deleted && !a.is_archived && a.due_date === selectedDateStr
    );
  }, [assignments, selectedDateStr]);

  const handleDateClick = (dateStr: string) => {
    if (selectedDateStr === dateStr) {
      // Clicking already open date collapses it
      setSelectedDateStr(null);
    } else {
      setSelectedDateStr(dateStr);
    }
  };

  const handleToggleTaskComplete = async (e: React.MouseEvent, assignment: AssignmentWithDetails) => {
    e.stopPropagation();
    setActionLoadingId(assignment.id);
    try {
      const nextStatus = !assignment.completed;
      await toggleComplete(assignment.id, nextStatus);
      if (nextStatus) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#16B8D4', '#5B4DF5', '#19A974'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleTaskErp = async (e: React.MouseEvent, assignment: AssignmentWithDetails) => {
    e.stopPropagation();
    setActionLoadingId(assignment.id);
    try {
      await toggleErpUpload(assignment.id, !assignment.uploaded_to_erp);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleTaskCheck = async (e: React.MouseEvent, assignment: AssignmentWithDetails) => {
    e.stopPropagation();
    setActionLoadingId(assignment.id);
    try {
      const nextCheck = !assignment.professor_checked;
      await toggleProfessorCheck(assignment.id, nextCheck);
      if (nextCheck) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#19A974', '#5B4DF5'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const monthKey = `${currentMonthDate.getFullYear()}-${currentMonthDate.getMonth()}`;

  const friendlySelectedDate = selectedDateStr
    ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
      className="space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden"
    >
      {/* 1. Calendar Header & Controls (Figma 08 — Calendar / Default Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#5C6175] dark:text-[#94A3B8] tracking-wider uppercase mb-1">
            Workspace <span className="mx-1 text-[#9499AB]">/</span> Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171A2E] dark:text-white tracking-tight">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1">
            A clear view of what’s coming. Click any date for inline agenda expansion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] rounded-xl p-1 shadow-tf-subtle">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#5C6175] hover:text-[#171A2E] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#15172F] transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-heading font-bold text-[#171A2E] dark:text-white min-w-[120px] text-center">
              {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#5C6175] hover:text-[#171A2E] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#15172F] transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] hover:bg-[#F5F7FB] dark:hover:bg-[#15172F] text-[#171A2E] dark:text-white transition-colors cursor-pointer shadow-tf-subtle"
          >
            Today
          </motion.button>

          {/* View Mode Tag */}
          <div className="hidden sm:flex px-3 py-2 text-xs font-semibold rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] text-[#5C6175] dark:text-[#94A3B8] shadow-tf-subtle items-center gap-1">
            <span>Month view</span>
          </div>

          {/* Add Assignment Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white shadow-tf-subtle transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add assignment</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Full-Width Calendar with Figma In-Grid Expansion */}
      <div className="bg-white dark:bg-[#11142B] p-2.5 sm:p-6 rounded-2xl border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card overflow-hidden w-full min-w-0">
        {/* Weekday headers: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
        <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-heading font-extrabold text-[#5C6175] dark:text-[#94A3B8] uppercase tracking-wider py-2 sm:py-2.5 border-b border-[#E6E9F2]/80 dark:border-slate-800">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Animated Month Weeks Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: monthDirection * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: monthDirection * -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-1.5 sm:space-y-2 mt-2"
          >
            {weeks.map((week, weekIdx) => {
              const isExpansionActiveInThisWeek =
                selectedWeekIndex === weekIdx && selectedDateStr !== null;

              return (
                <div key={`week-row-${weekIdx}`} className="space-y-2">
                  {/* 7-Day Week Row */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {week.map((cell) => {
                      const cellAssignments = assignments.filter(
                        (a) => !a.is_deleted && !a.is_archived && a.due_date === cell.dateStr
                      );
                      const isSelected = selectedDateStr === cell.dateStr;
                      const isToday = todayStr === cell.dateStr;

                      return (
                        <motion.div
                          key={cell.dateStr}
                          whileHover={{ scale: 1.015, y: -1 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleDateClick(cell.dateStr)}
                          className={`min-h-[64px] sm:min-h-[96px] p-1 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#5B4DF5] ring-2 ring-[#5B4DF5]/20 bg-[#EEECFF]/40 dark:bg-[#5B4DF5]/15 shadow-tf-subtle'
                              : isToday
                              ? 'border-[#5B4DF5]/60 bg-[#EEECFF]/15 dark:bg-[#5B4DF5]/5 hover:border-[#5B4DF5]'
                              : 'border-[#E6E9F2] dark:border-[#1E293B] hover:border-[#5B4DF5]/40 bg-white dark:bg-[#11142B]'
                          } ${!cell.isCurrentMonth ? 'opacity-30' : ''}`}
                        >
                          {/* Day Number and Count Pill */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                isToday
                                  ? 'bg-[#5B4DF5] text-white shadow-xs'
                                  : isSelected
                                  ? 'text-[#5B4DF5] dark:text-[#A49DFC] font-extrabold'
                                  : 'text-[#171A2E] dark:text-white'
                              }`}
                            >
                              {cell.dayNum}
                            </span>

                            {cellAssignments.length > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                  isSelected
                                    ? 'bg-[#5B4DF5] text-white border-[#5B4DF5]'
                                    : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 border-[#E6E9F2] dark:border-slate-700'
                                }`}
                              >
                                {cellAssignments.length}
                              </span>
                            )}
                          </div>

                          {/* Task Badges Inside Cell */}
                          <div className="space-y-1 mt-1 overflow-hidden">
                            {cellAssignments.slice(0, 2).map((task) => {
                              const urgency = getDeadlineUrgency(task.due_date, task.completed);
                              return (
                                <div
                                  key={task.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDetails(task.id);
                                  }}
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate border transition-transform hover:scale-[1.02] ${
                                    task.completed
                                      ? 'bg-[#E8F8F1] text-[#19A974] border-[#19A974]/30 line-through dark:bg-emerald-950/30 dark:text-emerald-300'
                                      : urgency === 'Overdue'
                                      ? 'bg-[#FFF0F1] text-[#E04F5F] border-[#E04F5F]/30 dark:bg-rose-950/30 dark:text-rose-300'
                                      : 'bg-[#F5F7FB] text-[#171A2E] border-[#E6E9F2] dark:bg-slate-800 dark:text-white dark:border-slate-700'
                                  }`}
                                  title={task.title}
                                >
                                  {task.title}
                                </div>
                              );
                            })}
                            {cellAssignments.length > 2 && (
                              <p className="text-[9px] font-semibold text-[#9499AB] pl-1">
                                +{cellAssignments.length - 2} more
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 3. Figma IN-GRID Inline Expansion (420ms expansion · 120ms delay · 10px rise · 60ms stagger) */}
                  <AnimatePresence>
                    {isExpansionActiveInThisWeek && (
                      <motion.div
                        key={`inline-expansion-week-${weekIdx}-${selectedDateStr}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="relative rounded-2xl bg-[#F5F7FB] dark:bg-[#0B1020] border border-[#5B4DF5]/30 p-4 sm:p-5 shadow-tf-card space-y-4 my-2 overflow-hidden">
                          {/* Figma Signature Rail on left */}
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-rail" />

                          {/* Expansion Row Header */}
                          <div className="pl-3 sm:pl-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E9F2] dark:border-slate-800 pb-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-[#5B4DF5]" />
                                <span className="text-[11px] font-bold text-[#5B4DF5] dark:text-[#A49DFC] uppercase tracking-wider">
                                  Agenda for {friendlySelectedDate}
                                </span>
                              </div>
                              <h3 className="font-heading font-extrabold text-base text-[#171A2E] dark:text-white">
                                {selectedDateAssignments.length === 0
                                  ? 'No assignments due on this date'
                                  : selectedDateAssignments.length === 1
                                  ? '1 assignment due on this day'
                                  : `${selectedDateAssignments.length} assignments due on this day`}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98, y: 1 }}
                                transition={{ duration: 0.2 }}
                                type="button"
                                onClick={onOpenAddModal}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold shadow-tf-subtle transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to this date</span>
                              </motion.button>

                              <button
                                type="button"
                                onClick={() => setSelectedDateStr(null)}
                                className="p-1.5 rounded-xl text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Close day view"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expansion Content (120ms delay · 10px rise · 60ms stagger) */}
                          <div className="pl-3 sm:pl-4">
                            {selectedDateAssignments.length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.12 }}
                                className="py-8 text-center rounded-xl bg-white/60 dark:bg-[#11142B]/60 border border-dashed border-[#E6E9F2] dark:border-slate-800 space-y-2"
                              >
                                <Sparkles className="w-6 h-6 text-[#5B4DF5] mx-auto" />
                                <p className="text-xs font-bold text-[#171A2E] dark:text-white">
                                  Your schedule is completely clear for this date!
                                </p>
                                <p className="text-[11px] text-[#5C6175] dark:text-[#94A3B8] max-w-sm mx-auto">
                                  Use the "+ Add to this date" button above to schedule homework,
                                  a lab report, or a professor review milestone.
                                </p>
                              </motion.div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {selectedDateAssignments.map((assignment, idx) => {
                                  const stage = getDerivedWorkflowStage(assignment);
                                  const urgency = getDeadlineUrgency(
                                    assignment.due_date,
                                    assignment.completed
                                  );
                                  const isLoading = actionLoadingId === assignment.id;

                                  const progressPct = assignment.professor_checked
                                    ? 100
                                    : assignment.uploaded_to_erp
                                    ? 90
                                    : assignment.completed
                                    ? 75
                                    : stage === 'in_progress'
                                    ? 40
                                    : 10;

                                  return (
                                    <motion.div
                                      key={assignment.id}
                                      initial={{ opacity: 0, y: 10, scale: 0.985 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      transition={{
                                        duration: 0.42,
                                        delay: 0.12 + idx * 0.06,
                                        ease: [0.16, 1, 0.3, 1],
                                      }}
                                      className="p-4 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-subtle space-y-3 flex flex-col justify-between"
                                    >
                                      <div className="space-y-2">
                                        {/* Top Badges */}
                                        <div className="flex items-center justify-between gap-1.5">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <SubjectBadge subject={assignment.subject} size="sm" />
                                            <PriorityBadge priority={assignment.priority} size="sm" />
                                            {urgency === 'Overdue' && (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F1] text-[#E04F5F] border border-[#E04F5F]/20">
                                                <Flame className="w-2.5 h-2.5" />
                                                Overdue
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => onOpenDetails(assignment.id)}
                                              className="p-1 rounded-lg text-[#9499AB] hover:text-[#5B4DF5] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors"
                                              title="View Details"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => onEditAssignment(assignment)}
                                              className="p-1 rounded-lg text-[#9499AB] hover:text-[#5B4DF5] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors"
                                              title="Edit Task"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Title */}
                                        <h4
                                          onClick={() => onOpenDetails(assignment.id)}
                                          className={`font-heading font-bold text-sm text-[#171A2E] dark:text-white line-clamp-2 cursor-pointer hover:text-[#5B4DF5] transition-colors ${
                                            assignment.completed
                                              ? 'line-through text-[#9499AB] dark:text-[#94A3B8]'
                                              : ''
                                          }`}
                                        >
                                          {assignment.title}
                                        </h4>

                                        {assignment.description && (
                                          <p className="text-[11px] text-[#5C6175] dark:text-[#94A3B8] line-clamp-2">
                                            {assignment.description}
                                          </p>
                                        )}

                                        {/* 550ms Animated Progress Track */}
                                        <div className="space-y-1 pt-1">
                                          <div className="flex items-center justify-between text-[10px] text-[#9499AB]">
                                            <span>Progress</span>
                                            <span className="font-bold text-[#171A2E] dark:text-white">
                                              {progressPct}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-[#F5F7FB] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-[#E6E9F2] dark:border-slate-700">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${progressPct}%` }}
                                              transition={{ duration: 0.55, ease: 'easeOut' }}
                                              className="h-full rounded-full bg-gradient-to-r from-[#5B4DF5] to-[#16B8D4]"
                                            />
                                          </div>
                                        </div>

                                        {/* Interactive Milestones */}
                                        <div className="pt-2 border-t border-[#E6E9F2]/80 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                          <div
                                            onClick={(e) => handleToggleTaskErp(e, assignment)}
                                            className="flex items-center gap-1 cursor-pointer hover:text-[#5B4DF5] transition-colors"
                                            title="Click to toggle ERP upload"
                                          >
                                            <UploadCloud
                                              className={`w-3.5 h-3.5 ${
                                                assignment.uploaded_to_erp
                                                  ? 'text-[#7970D9]'
                                                  : 'text-[#9499AB]'
                                              }`}
                                            />
                                            <span
                                              className={
                                                assignment.uploaded_to_erp
                                                  ? 'font-bold text-[#7970D9]'
                                                  : 'text-[#9499AB]'
                                              }
                                            >
                                              {assignment.uploaded_to_erp ? 'ERP ✓' : 'ERP'}
                                            </span>
                                          </div>

                                          <div
                                            onClick={(e) => handleToggleTaskCheck(e, assignment)}
                                            className="flex items-center gap-1 cursor-pointer hover:text-[#19A974] transition-colors"
                                            title="Click to toggle Professor check"
                                          >
                                            <CheckCheck
                                              className={`w-3.5 h-3.5 ${
                                                assignment.professor_checked
                                                  ? 'text-[#19A974]'
                                                  : 'text-[#9499AB]'
                                              }`}
                                            />
                                            <span
                                              className={
                                                assignment.professor_checked
                                                  ? 'font-bold text-[#19A974]'
                                                  : 'text-[#9499AB]'
                                              }
                                            >
                                              {assignment.professor_checked ? 'Checked ✓' : 'Check'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Complete / Status Action Button */}
                                      <div className="pt-2 border-t border-[#E6E9F2]/80 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-[10px] text-[#9499AB]">
                                          Due {formatFriendlyDate(assignment.due_date)}
                                        </span>

                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98, y: 1 }}
                                          transition={{ duration: 0.2 }}
                                          type="button"
                                          disabled={isLoading}
                                          onClick={(e) => handleToggleTaskComplete(e, assignment)}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            assignment.completed
                                              ? 'bg-[#E8F8F1] text-[#19A974] hover:bg-[#d5f3e5]'
                                              : 'bg-[#5B4DF5] text-white hover:bg-[#4B3CE0]'
                                          }`}
                                        >
                                          {isLoading ? (
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : assignment.completed ? (
                                            <>
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              <span>Completed</span>
                                            </>
                                          ) : (
                                            <>
                                              <Circle className="w-3.5 h-3.5" />
                                              <span>Mark Done</span>
                                            </>
                                          )}
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
