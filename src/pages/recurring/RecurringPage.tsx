import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { formatFriendlyDate } from '@/utils/dateUtils';
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
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
};

export const RecurringPage: React.FC = () => {
  const { subjects, refreshData: refreshAssignments } = useAssignments();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Recurring Tutorials & Series
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Repeat className="w-3 h-3" />
              {seriesList.length} Active Series
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automate weekly tutorial sheets, lab reports, and recurring recurring academic milestones
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => {
            setSeriesToEdit(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Series</span>
        </motion.button>
      </div>

      {loading && seriesList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring tutorial series"
          description="Create recurring weekly tutorials to automatically populate your schedule and dashboard."
          actionLabel="+ Add Tutorial Series"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {seriesList.map((series) => {
            const subject = getSubject(series.subject_id);

            return (
              <motion.div
                key={series.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative p-5 rounded-2xl border transition-all glass-card glass-card-hover flex flex-col justify-between overflow-hidden ${
                  series.is_active
                    ? 'border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5'
                    : 'border-slate-200/50 dark:border-slate-800/50 opacity-70 bg-slate-50/40 dark:bg-slate-900/30'
                }`}
              >
                {/* Top decorative accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                    series.is_active ? 'bg-gradient-to-r from-brand-500 to-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <SubjectBadge subject={subject} />
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={series.priority} size="sm" />
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          series.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {series.is_active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {series.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {series.title}
                  </h3>
                  {series.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {series.description}
                    </p>
                  )}

                  {/* Frequency & Details Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs space-y-2 text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                        {series.frequency === 'biweekly'
                          ? 'Every 2 Weeks'
                          : series.frequency}
                      </span>
                    </div>
                    {series.day_of_week !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Weekly Day:</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {DAYS_MAP[series.day_of_week] || 'Not specified'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Timeline:</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {formatFriendlyDate(series.start_date)}
                        {series.end_date ? ` → ${formatFriendlyDate(series.end_date)}` : ' (Ongoing)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleToggleActive(series)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shadow-sm ${
                      series.is_active
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-500/20'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 border border-emerald-500/20'
                    }`}
                  >
                    {series.is_active ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Resume
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleGenerateMore(series.id)}
                      disabled={generatingId === series.id}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg transition-colors"
                      title="Generate next 12-week instances"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generatingId === series.id ? 'animate-spin text-brand-600' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        setSeriesToEdit(series);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Series"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setDeleteTarget(series)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Series"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
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

      {/* Delete Series Workflow Modal with AnimatePresence */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Delete Recurring Tutorial Series
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                How would you like to handle existing occurrences for "{deleteTarget.title}"?
              </p>

              <div className="space-y-2 mb-6">
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    deleteMode === 'stop_future'
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="delMode"
                    checked={deleteMode === 'stop_future'}
                    onChange={() => setDeleteMode('stop_future')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Stop future occurrences (Recommended)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Keeps completed past tutorials, removes upcoming uncompleted instances.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    deleteMode === 'series_only'
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="delMode"
                    checked={deleteMode === 'series_only'}
                    onChange={() => setDeleteMode('series_only')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Delete series definition only
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Leaves all already generated tasks in your assignments list as standalone tasks.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    deleteMode === 'delete_all'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="delMode"
                    checked={deleteMode === 'delete_all'}
                    onChange={() => setDeleteMode('delete_all')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                      Delete everything
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Permanently deletes the series and all linked assignment instances.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
