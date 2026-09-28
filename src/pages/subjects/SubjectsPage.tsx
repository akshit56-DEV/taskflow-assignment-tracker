import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Subject, SubjectWithStats } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getSubjectsWithStats, archiveSubject } from '@/services/subjectService';
import { SubjectModal } from '@/components/subjects/SubjectModal';
import { DeleteSubjectModal } from '@/components/subjects/DeleteSubjectModal';
import { Skeleton } from '@/components/common/Skeleton';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Layers,
  GraduationCap,
} from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Academic Subjects
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <Layers className="w-3 h-3" />
              {displayedSubjects.length} Courses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure curriculum courses, subject colors, codes, and monitor completion metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              showArchived
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-sm'
                : 'glass-card border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setSubjectModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300 shadow-sm"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs"
          >
            Retry
          </button>
        </motion.div>
      )}

      {loading && subjectsWithStats.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedSubjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No subjects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Add your courses and academic subjects to organize assignments, deadlines, and grades.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setSubjectModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Your First Subject
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {displayedSubjects.map((sub) => {
            const completionPercent =
              sub.total_assignments > 0
                ? Math.round((sub.completed_assignments / sub.total_assignments) * 100)
                : 0;

            return (
              <motion.div
                key={sub.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative p-5 rounded-2xl border transition-all glass-card glass-card-hover flex flex-col justify-between overflow-hidden ${
                  sub.is_archived
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-65'
                    : 'border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:shadow-slate-500/5'
                }`}
              >
                {/* Subtle top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: sub.color }}
                />

                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: sub.color,
                          boxShadow: `0 4px 14px ${sub.color}33`,
                        }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {sub.name}
                        </h3>
                        {sub.code && (
                          <span className="inline-block text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-md mt-0.5">
                            {sub.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setSubjectModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleArchiveToggle(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={sub.is_archived ? 'Unarchive Subject' : 'Archive Subject'}
                      >
                        {sub.is_archived ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setSubjectToDelete(sub);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Completion</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {completionPercent}%{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          ({sub.completed_assignments}/{sub.total_assignments})
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden p-0.5">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overdue</span>
                      <span
                        className={`text-sm font-bold ${
                          sub.overdue_assignments > 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.overdue_assignments}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">ERP Pend.</span>
                      <span
                        className={`text-sm font-bold ${
                          sub.pending_erp_assignments > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.pending_erp_assignments}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chk. Pend.</span>
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
              </motion.div>
            );
          })}
        </motion.div>
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
    </motion.div>
  );
};
