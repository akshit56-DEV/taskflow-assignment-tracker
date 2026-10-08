import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
} from 'lucide-react';

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

export const SubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setFilters, refreshData: refreshGlobalData } = useAssignments();
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

  const totalAssignmentsCount = subjectsWithStats.reduce(
    (sum, s) => sum + (s.total_assignments || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header (Figma #3:73791: Subjects / Six subjects. One organized semester.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Subjects
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            {displayedSubjects.length} subjects. One organized semester.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              showArchived
                ? 'bg-[#4355ED] text-white border-transparent'
                : 'bg-white dark:bg-[#111827] border-[#E5E9F3] dark:border-[#1E293B] text-[#66718C] dark:text-[#94A3B8] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setSubjectModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4355ED] hover:bg-[#3646D7] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add subject</span>
          </motion.button>
        </div>
      </div>

      {/* Subheader info chip (Figma: Semester 03 · 6 subjects · 32 assignments) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle flex items-center justify-between text-xs font-semibold text-[#18223F] dark:text-white">
        <span>Semester 03 · {displayedSubjects.length} subjects · {totalAssignmentsCount} assignments</span>
      </div>

      {error && (
        <div className="p-4 bg-[#FDEEF1] dark:bg-[#D34D61]/20 border border-[#D34D61]/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#D34D61]">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 bg-[#D34D61] text-white font-semibold rounded-xl text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading && subjectsWithStats.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] space-y-4">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : displayedSubjects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#18223F] dark:text-white">No subjects found</h3>
          <p className="text-xs text-[#66718C] dark:text-[#94A3B8] max-w-sm mx-auto mt-1 mb-4">
            Add your subjects to organize assignments, deadlines, and milestones.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setSubjectModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#4355ED] hover:bg-[#3646D7] text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add subject</span>
          </button>
        </div>
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
                whileHover={{ y: -2 }}
                className={`group relative p-5 rounded-2xl bg-white dark:bg-[#111827] border transition-all flex flex-col justify-between shadow-tf-subtle hover:border-[#4355ED]/40 ${
                  sub.is_archived
                    ? 'border-[#E5E9F3] dark:border-[#1E293B] opacity-60'
                    : 'border-[#E5E9F3] dark:border-[#1E293B]'
                }`}
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#18223F] dark:text-white leading-tight">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-0.5">
                          {sub.total_assignments} assignments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setSubjectModalOpen(true);
                        }}
                        className="p-1.5 text-[#939CB1] hover:text-[#18223F] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(sub)}
                        className="p-1.5 text-[#939CB1] hover:text-[#18223F] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title={sub.is_archived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectToDelete(sub);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-[#939CB1] hover:text-[#D34D61] rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Line (Figma: "75% completed") */}
                  <div className="pt-3 pb-1">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#18223F] dark:text-white">
                        {completionPercent}% completed
                      </span>
                      <span className="text-[#66718C] dark:text-[#94A3B8]">
                        {sub.completed_assignments} / {sub.total_assignments}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F7FC] dark:bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%`, backgroundColor: sub.color || '#4355ED' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer action to filter assignments by subject */}
                <div className="pt-3 border-t border-[#E5E9F3] dark:border-[#1E293B] mt-4 flex items-center justify-between text-xs">
                  <span className="text-[#939CB1]">
                    {sub.pending_erp_assignments || 0} ERP pending
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, subjectId: sub.id }));
                      navigate('/assignments');
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-[#4355ED] hover:underline cursor-pointer"
                  >
                    <span>View assignments</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Subject Modal */}
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

      {/* Delete Subject Modal */}
      <DeleteSubjectModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
        subject={subjectToDelete}
        allSubjects={subjectsWithStats}
        onSuccess={() => {
          loadData();
          refreshGlobalData();
        }}
      />
    </motion.div>
  );
};
