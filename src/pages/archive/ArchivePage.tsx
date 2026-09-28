import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignments, archiveAssignment } from '@/services/assignmentService';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { Archive, Search, RotateCcw, Filter } from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const ArchivePage: React.FC = () => {
  const { subjects, refreshData: refreshGlobalData } = useAssignments();
  const { onEditAssignment, onOpenDetails } = useOutletContext<LayoutContextType>();

  const [archivedAssignments, setArchivedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadArchived = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignments({
        isArchived: true,
        isDeleted: false,
        filters: {
          searchQuery,
          subjectId: selectedSubjectId,
        },
      });
      setArchivedAssignments(data);
    } catch (err) {
      console.error('Error loading archive:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubjectId]);

  useEffect(() => {
    loadArchived();
  }, [loadArchived]);

  const handleUnarchive = async (id: string) => {
    setRestoringId(id);
    try {
      await archiveAssignment(id, false);
      await loadArchived();
      await refreshGlobalData();
    } catch (err) {
      console.error('Error unarchiving:', err);
    } finally {
      setRestoringId(null);
    }
  };

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
              Academic Archive
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
              <Archive className="w-3 h-3" />
              {archivedAssignments.length} Archived
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Completed tutorial sheets, projects, and assignments preserved for academic reference
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 glass-card p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search archived assignments, notes, or solutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading && archivedAssignments.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card space-y-3">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : archivedAssignments.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived assignments"
          description="Assignments you archive will appear here so you can revisit past tutorials, solutions, and files anytime."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {archivedAssignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                layout
                className="relative group flex flex-col justify-between"
              >
                <AssignmentCard
                  assignment={assignment}
                  onOpenDetails={() => onOpenDetails(assignment.id)}
                  onEdit={() => onEditAssignment(assignment)}
                />
                <div className="mt-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleUnarchive(assignment.id)}
                    disabled={restoringId === assignment.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-xl transition-all border border-transparent hover:border-brand-500/20"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${restoringId === assignment.id ? 'animate-spin' : ''}`} />
                    Restore to active tasks
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};
