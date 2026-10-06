import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RecurringAssignment } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import {
  getRecurringAssignments,
  toggleRecurringActive,
  deleteRecurringSeries,
  generateInstancesForSeries,
} from '@/services/recurringService';
import { RecurringModal } from '@/components/recurring/RecurringModal';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const DAYS_MAP: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export const RecurringPage: React.FC = () => {
  const { subjects, assignments, refreshData: refreshAssignments } = useAssignments();
  const [seriesList, setSeriesList] = useState<RecurringAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [seriesToEdit, setSeriesToEdit] = useState<RecurringAssignment | null>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<RecurringAssignment | null>(null);
  const [deleteMode, setDeleteMode] = useState<'stop_future' | 'delete_all' | 'series_only'>('stop_future');

  const loadSeries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecurringAssignments();
      setSeriesList(data);
    } catch (err) {
      console.error('Error loading recurring series:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const handleToggleActive = async (series: RecurringAssignment) => {
    try {
      await toggleRecurringActive(series.id, !series.is_active);
      await loadSeries();
      await refreshAssignments();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const handleGenerateMore = async (seriesId: string) => {
    setGeneratingId(seriesId);
    try {
      await generateInstancesForSeries(seriesId, 12);
      await refreshAssignments();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecurringSeries(deleteTarget.id, deleteMode);
      setDeleteTarget(null);
      await loadSeries();
      await refreshAssignments();
    } catch (err) {
      console.error('Error deleting recurring series:', err);
    }
  };

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  // Calculate upcoming occurrence date across active series
  const activeCount = seriesList.filter((s) => s.is_active).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5 sm:space-y-6 w-full min-w-0 overflow-x-hidden"
    >
      {/* Page Header (Figma #3:73545: Tutorials / Recurring work, without recurring mental effort.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Tutorials
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            Recurring work, without recurring mental effort.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => {
            setSeriesToEdit(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4355ED] hover:bg-[#3646D7] text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add tutorial</span>
        </motion.button>
      </div>

      {/* Hero Banner: Build a rhythm that lasts (Figma #3:73545) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 flex items-center justify-center text-[#4355ED] dark:text-[#7970D9] shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18223F] dark:text-white">
              Build a rhythm that lasts.
            </h3>
            <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-0.5">
              {activeCount} recurring tutorials active · occurrences auto-generated for your semester schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5F7FC] dark:bg-[#1E293B] text-[#18223F] dark:text-white border border-[#E5E9F3] dark:border-[#1E293B]">
            {seriesList.length} Total Series
          </span>
        </div>
      </div>

      {loading && seriesList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] space-y-4 w-full min-w-0">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring tutorial series yet"
          description="Set up recurring tutorial sheets or weekly lab submissions once, and TaskFlow will automatically schedule and generate upcoming occurrences for the semester."
          actionLabel="+ Add tutorial"
          onAction={() => {
            setSeriesToEdit(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0"
        >
          {seriesList.map((series) => {
            const subject = getSubject(series.subject_id);

            // Calculate completed instances
            const seriesInstances = assignments.filter((a) => a.recurring_assignment_id === series.id);
            const completedInstances = seriesInstances.filter((a) => a.completed).length;
            const totalInstances = seriesInstances.length;

            return (
              <motion.div
                key={series.id}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border transition-all flex flex-col justify-between shadow-tf-subtle hover:border-[#4355ED]/40 w-full min-w-0 ${
                  series.is_active
                    ? 'border-[#E5E9F3] dark:border-[#1E293B]'
                    : 'border-[#E5E9F3] dark:border-[#1E293B] opacity-75'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <SubjectBadge subject={subject} />
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={series.priority} size="sm" />
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          series.is_active
                            ? 'bg-[#E9F6F0] text-[#188A68] dark:bg-[#188A68]/20 dark:text-[#34D399]'
                            : 'bg-[#F5F7FC] text-[#66718C] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                        }`}
                      >
                        {series.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Frequency Line (Figma #3:73545) */}
                  <h3 className="text-base font-bold text-[#18223F] dark:text-white mb-1 flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-[#4355ED] shrink-0" />
                    <span>{series.title}</span>
                  </h3>

                  <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mb-3">
                    {subject?.name || 'Academic'} · Every{' '}
                    {series.day_of_week !== null ? DAYS_MAP[series.day_of_week] : series.frequency}
                  </p>

                  {series.description && (
                    <p className="text-xs text-[#66718C] dark:text-[#94A3B8] line-clamp-2 mb-3 leading-relaxed">
                      {series.description}
                    </p>
                  )}

                  {/* Progress Line (Figma: "3 of 4 completed") */}
                  {totalInstances > 0 && (
                    <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#18223F] dark:text-white">
                          {completedInstances} of {totalInstances} completed
                        </span>
                        <span className="text-[#66718C] dark:text-[#94A3B8]">
                          {Math.round((completedInstances / totalInstances) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5E9F3] dark:bg-[#1E293B] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#188A68] rounded-full transition-all"
                          style={{ width: `${(completedInstances / totalInstances) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E9F3] dark:border-[#1E293B] text-xs">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleToggleActive(series)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      series.is_active
                        ? 'text-[#B97915] bg-[#FFF5E2] dark:bg-[#B97915]/20 hover:bg-[#FFF5E2]/80'
                        : 'text-[#188A68] bg-[#E9F6F0] dark:bg-[#188A68]/20 hover:bg-[#E9F6F0]/80'
                    }`}
                  >
                    {series.is_active ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> <span>Resume</span>
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleGenerateMore(series.id)}
                      disabled={generatingId === series.id}
                      className="p-1.5 text-[#939CB1] hover:text-[#4355ED] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                      title="Generate more occurrences"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generatingId === series.id ? 'animate-spin text-[#4355ED]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSeriesToEdit(series);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-[#939CB1] hover:text-[#18223F] dark:hover:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                      title="Edit Series"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(series)}
                      className="p-1.5 text-[#939CB1] hover:text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Series"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Series Modal */}
      <RecurringModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSeriesToEdit(null);
        }}
        seriesToEdit={seriesToEdit}
        onSuccess={loadSeries}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E5E9F3] dark:border-[#1E293B] shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDEEF1] dark:bg-[#D34D61]/20 flex items-center justify-center text-[#D34D61]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18223F] dark:text-white">
                  Delete Recurring Series
                </h3>
                <p className="text-xs text-[#66718C] dark:text-[#94A3B8]">
                  "{deleteTarget.title}"
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] cursor-pointer hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]/50">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'stop_future'}
                  onChange={() => setDeleteMode('stop_future')}
                  className="text-[#4355ED]"
                />
                <span className="text-[#18223F] dark:text-white font-medium">
                  Stop future occurrences (keep completed)
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] cursor-pointer hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]/50">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'delete_all'}
                  onChange={() => setDeleteMode('delete_all')}
                  className="text-[#D34D61]"
                />
                <span className="text-[#D34D61] font-medium">
                  Delete entire series and all occurrences
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#66718C] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D34D61] hover:bg-[#D34D61]/90 text-white cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
