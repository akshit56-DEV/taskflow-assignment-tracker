import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { AssignmentWithDetails } from '@/types';
import {
  formatDateToIsoDate,
  getTodayDateString,
  getDeadlineUrgency,
  formatFriendlyDate,
} from '@/utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const CalendarPage: React.FC = () => {
  const { assignments } = useAssignments();
  const { onOpenAddModal, onEditAssignment, onOpenDetails } =
    useOutletContext<LayoutContextType>();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [monthDirection, setMonthDirection] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

  const todayStr = getTodayDateString();

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

  const selectedDateAssignments = assignments.filter(
    (a) => a.due_date === selectedDateStr
  );

  const monthKey = `${currentMonthDate.getFullYear()}-${currentMonthDate.getMonth()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deadlines and due dates across the semester
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            Today
          </motion.button>
          <div className="flex items-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 shadow-xs overflow-hidden">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
              {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Day Cells Grid with animated month transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={monthKey}
              initial={{ opacity: 0, x: monthDirection * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: monthDirection * -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-7 gap-1 sm:gap-2 mt-2"
            >
              {daysArray.map((cell) => {
                const cellAssignments = assignments.filter((a) => a.due_date === cell.dateStr);
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = todayStr === cell.dateStr;

                return (
                  <motion.div
                    key={cell.dateStr}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[70px] sm:min-h-[90px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/40 dark:bg-brand-950/30 shadow-xs'
                        : isToday
                        ? 'border-brand-300 dark:border-brand-800/80 bg-brand-50/15 dark:bg-brand-950/10'
                        : 'border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                    } ${!cell.isCurrentMonth ? 'opacity-35' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-brand-600 text-white shadow-xs'
                            : isSelected
                            ? 'text-brand-600 dark:text-brand-400 font-extrabold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {cellAssignments.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                          {cellAssignments.length}
                        </span>
                      )}
                    </div>

                    {/* Micro Task Pills */}
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
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate border transition-transform hover:scale-[1.02] ${
                              task.completed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                                : urgency === 'Overdue'
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                                : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        );
                      })}
                      {cellAssignments.length > 2 && (
                        <p className="text-[9px] text-slate-400 pl-1">
                          +{cellAssignments.length - 2} more
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected Date Schedule Sidebar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Selected Date
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {formatFriendlyDate(selectedDateStr)}
              </h3>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenAddModal}
              className="p-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-400 rounded-xl transition-colors shadow-xs"
              title="Add task on this date"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {selectedDateAssignments.length > 0 ? (
              <motion.div
                key={selectedDateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 max-h-[500px] overflow-y-auto pr-1 flex-1"
              >
                {selectedDateAssignments.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <AssignmentCard
                      assignment={a}
                      onOpenDetails={() => onOpenDetails(a.id)}
                      onEdit={() => onEditAssignment(a)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`empty-${selectedDateStr}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-xs text-slate-400 space-y-2 flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1">
                  <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No deadlines on this date
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Click below to create an assignment or tutorial for this day.
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenAddModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm shadow-brand-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
