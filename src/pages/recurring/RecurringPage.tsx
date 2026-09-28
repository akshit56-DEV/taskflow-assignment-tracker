import React, { useState, useEffect, useCallback } from 'react';
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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

export const RecurringPage: React.FC = () => {
  const { subjects, refreshData: refreshAssignments } = useAssignments();
  const [seriesList, setSeriesList] = useState<RecurringAssignment[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await generateInstancesForSeries(seriesId, 12);
      await refreshAssignments();
      alert('Generated next 12-week instances successfully!');
    } catch (err) {
      console.error(err);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Recurring Tutorials & Series
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automate weekly tutorials, lab reports, and recurring academic deadlines
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSeriesToEdit(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Series</span>
        </button>
      </div>

      {loading && seriesList.length === 0 ? (
        <LoadingSpinner message="Loading recurring tutorial series..." />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seriesList.map((series) => {
            const subject = getSubject(series.subject_id);

            return (
              <div
                key={series.id}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                  series.is_active
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-200/60 dark:border-slate-800/60 opacity-75 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <SubjectBadge subject={subject} />
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={series.priority} size="sm" />
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          series.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {series.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {series.title}
                  </h3>
                  {series.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {series.description}
                    </p>
                  )}

                  {/* Frequency & Details */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold capitalize">
                        {series.frequency === 'biweekly'
                          ? 'Every 2 Weeks'
                          : series.frequency}
                      </span>
                    </div>
                    {series.day_of_week !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Day:</span>
                        <span className="font-semibold">
                          {DAYS_MAP[series.day_of_week] || 'Not specified'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Started:</span>
                      <span>{formatFriendlyDate(series.start_date)}</span>
                    </div>
                    {series.end_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Ends:</span>
                        <span>{formatFriendlyDate(series.end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(series)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      series.is_active
                        ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleGenerateMore(series.id)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Generate more future weeks"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSeriesToEdit(series);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Edit Series"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(series)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      title="Delete Series"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Delete Series Workflow Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Recurring Tutorial Series
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How would you like to handle existing occurrences for "{deleteTarget.title}"?
            </p>

            <div className="space-y-2 mb-6">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                  deleteMode === 'stop_future'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-800'
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
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                  deleteMode === 'series_only'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-800'
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
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                  deleteMode === 'delete_all'
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30'
                    : 'border-slate-200 dark:border-slate-800'
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
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
