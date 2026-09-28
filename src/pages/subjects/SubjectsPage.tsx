import React, { useState, useEffect, useCallback } from 'react';
import { Subject, SubjectWithStats } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getSubjectsWithStats, archiveSubject } from '@/services/subjectService';
import { SubjectModal } from '@/components/subjects/SubjectModal';
import { DeleteSubjectModal } from '@/components/subjects/DeleteSubjectModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
} from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { refreshData: refreshGlobalData } = useAssignments();
  const [subjectsWithStats, setSubjectsWithStats] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Modal states
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjectsWithStats();
      setSubjectsWithStats(data);
    } catch (err: unknown) {
      console.error('Error loading subjects:', err);
      setError((err as Error).message || 'Unable to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleArchiveToggle = async (subject: Subject) => {
    try {
      await archiveSubject(subject.id, !subject.is_archived);
      await loadData();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error toggling subject archive:', err);
    }
  };

  const displayedSubjects = subjectsWithStats.filter((s) =>
    showArchived ? true : !s.is_archived
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure subjects, course codes, and review per-subject performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              showArchived
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>

          <button
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setSubjectModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading && subjectsWithStats.length === 0 ? (
        <LoadingSpinner message="Loading subjects..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedSubjects.map((sub) => {
            const completionPercent =
              sub.total_assignments > 0
                ? Math.round((sub.completed_assignments / sub.total_assignments) * 100)
                : 0;

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                  sub.is_archived
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: sub.color }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {sub.name}
                        </h3>
                        {sub.code && (
                          <span className="text-[11px] font-mono text-slate-400">
                            Code: {sub.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setSubjectModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title={sub.is_archived ? 'Unarchive Subject' : 'Archive Subject'}
                      >
                        {sub.is_archived ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectToDelete(sub);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {completionPercent}% ({sub.completed_assignments}/{sub.total_assignments})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${completionPercent}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Overdue</span>
                      <span
                        className={`text-sm font-bold ${
                          sub.overdue_assignments > 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.overdue_assignments}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">ERP Pend.</span>
                      <span
                        className={`text-sm font-bold ${
                          sub.pending_erp_assignments > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.pending_erp_assignments}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Chk. Pend.</span>
                      <span
                        className={`text-sm font-bold ${
                          sub.pending_check_assignments > 0 ? 'text-purple-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.pending_check_assignments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => {
          setSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
        subjectToEdit={subjectToEdit}
        onSuccess={() => {
          loadData();
          refreshGlobalData();
        }}
      />

      {/* Safe Delete Modal */}
      <DeleteSubjectModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
        subject={subjectToDelete}
        allSubjects={subjectsWithStats.filter((s) => !s.is_archived)}
        onSuccess={() => {
          loadData();
          refreshGlobalData();
        }}
      />
    </div>
  );
};
