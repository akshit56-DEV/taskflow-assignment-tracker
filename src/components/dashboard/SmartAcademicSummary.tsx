import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { getCalendarDaysDiff, getTodayDateString } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  UploadCloud,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';

export const SmartAcademicSummary: React.FC = () => {
  const { assignments } = useAssignments();
  const todayStr = getTodayDateString();

  // Active unarchived assignments
  const activeAssignments = assignments.filter((a) => !a.is_deleted && !a.is_archived);

  // 1. Current Week calculation (due within 7 days or overdue)
  const thisWeekAssignments = activeAssignments.filter((a) => {
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= -14 && diff <= 7;
  });

  const totalThisWeek = thisWeekAssignments.length;
  const completedThisWeek = thisWeekAssignments.filter((a) => a.completed).length;
  const overdueThisWeek = thisWeekAssignments.filter(
    (a) => !a.completed && a.due_date < todayStr
  ).length;
  const dueSoonThisWeek = thisWeekAssignments.filter((a) => {
    if (a.completed) return false;
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= 0 && diff <= 2;
  }).length;
  const pendingErpThisWeek = thisWeekAssignments.filter(
    (a) => a.completed && !a.uploaded_to_erp
  ).length;
  const pendingCheckThisWeek = thisWeekAssignments.filter(
    (a) => a.completed && a.uploaded_to_erp && !a.professor_checked
  ).length;

  const weeklyCompletionRate =
    totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 100;

  // Generate intelligent contextual academic insight
  const getContextualInsight = () => {
    if (activeAssignments.length === 0) {
      return {
        title: 'Ready for the Semester',
        description: 'No active assignments tracked yet. Add your course tasks to activate automatic urgency and deadline intelligence.',
        icon: Sparkles,
        color: 'text-[#5B4DF5] dark:text-[#A49DFC]',
        bg: 'bg-[#EEECFF] dark:bg-[#5B4DF5]/20',
        border: 'border-[#5B4DF5]/20',
      };
    }

    if (overdueThisWeek > 0) {
      return {
        title: 'Immediate Attention Required',
        description: `You have ${overdueThisWeek} overdue ${
          overdueThisWeek === 1 ? 'assignment' : 'assignments'
        }. Complete and submit them to prevent academic backlog.`,
        icon: AlertTriangle,
        color: 'text-[#E04F5F] dark:text-rose-300',
        bg: 'bg-[#FFF0F1] dark:bg-rose-950/40',
        border: 'border-[#E04F5F]/30',
      };
    }

    if (pendingErpThisWeek > 0) {
      return {
        title: 'ERP Synchronization Pending',
        description: `${pendingErpThisWeek} ${
          pendingErpThisWeek === 1 ? 'assignment is' : 'assignments are'
        } completed but awaiting final upload to your student ERP portal.`,
        icon: UploadCloud,
        color: 'text-[#D68A16] dark:text-amber-300',
        bg: 'bg-[#FFF5DF] dark:bg-amber-950/40',
        border: 'border-[#D68A16]/30',
      };
    }

    if (dueSoonThisWeek > 0) {
      return {
        title: 'Deadlines Approaching Soon',
        description: `${dueSoonThisWeek} ${
          dueSoonThisWeek === 1 ? 'assignment is' : 'assignments are'
        } due within the next 48 hours. Focus on finishing these submissions first.`,
        icon: Info,
        color: 'text-[#16B8D4] dark:text-cyan-300',
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        border: 'border-[#16B8D4]/30',
      };
    }

    if (weeklyCompletionRate === 100 && totalThisWeek > 0) {
      return {
        title: 'Peak Academic Performance 🎉',
        description: 'All tracked tasks for this week are 100% completed and synced. Excellent work staying ahead of schedule!',
        icon: Award,
        color: 'text-[#19A974] dark:text-emerald-300',
        bg: 'bg-[#E8F8F1] dark:bg-emerald-950/40',
        border: 'border-[#19A974]/30',
      };
    }

    return {
      title: 'Academic Flow on Track',
      description: `You are maintaining a ${weeklyCompletionRate}% completion pace this week. Keep up the solid steady progress!`,
      icon: TrendingUp,
      color: 'text-[#5B4DF5] dark:text-[#A49DFC]',
      bg: 'bg-[#EEECFF] dark:bg-[#5B4DF5]/20',
      border: 'border-[#5B4DF5]/20',
    };
  };

  const insight = getContextualInsight();
  const InsightIcon = insight.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-tf-card space-y-4 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-[#171A2E] dark:text-white">
              Academic Summary
            </h3>
            <span className="text-[11px] text-[#5C6175] dark:text-[#94A3B8]">
              Weekly Performance & Workflow Health
            </span>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 text-[#171A2E] dark:text-slate-300 border border-[#E6E9F2] dark:border-slate-700">
          This Week
        </span>
      </div>

      {/* Dynamic Academic Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Active Tasks
          </span>
          <span className="text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
            {totalThisWeek}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Due Soon (48h)
          </span>
          <span
            className={`text-lg font-heading font-extrabold ${
              dueSoonThisWeek > 0 ? 'text-[#D68A16]' : 'text-[#171A2E] dark:text-white'
            }`}
          >
            {dueSoonThisWeek}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Overdue
          </span>
          <span
            className={`text-lg font-heading font-extrabold ${
              overdueThisWeek > 0 ? 'text-[#E04F5F]' : 'text-[#171A2E] dark:text-white'
            }`}
          >
            {overdueThisWeek}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Weekly Rate
          </span>
          <span className="text-lg font-heading font-extrabold text-[#19A974]">
            {weeklyCompletionRate}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Pending ERP
          </span>
          <span
            className={`text-lg font-heading font-extrabold ${
              pendingErpThisWeek > 0 ? 'text-[#7970D9]' : 'text-[#171A2E] dark:text-white'
            }`}
          >
            {pendingErpThisWeek}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#9499AB] block mb-0.5">
            Pending Check
          </span>
          <span
            className={`text-lg font-heading font-extrabold ${
              pendingCheckThisWeek > 0 ? 'text-[#19A974]' : 'text-[#171A2E] dark:text-white'
            }`}
          >
            {pendingCheckThisWeek}
          </span>
        </div>
      </div>

      {/* Contextual Smart Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3.5 rounded-xl border ${insight.bg} ${insight.border} flex items-start gap-3`}
      >
        <div className={`p-1.5 rounded-lg bg-white/90 dark:bg-[#11142B] ${insight.color} shadow-xs flex-shrink-0 mt-0.5`}>
          <InsightIcon className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-bold ${insight.color}`}>
            {insight.title}
          </h4>
          <p className="text-[11px] text-[#5C6175] dark:text-slate-300 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
