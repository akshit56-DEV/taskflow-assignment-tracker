import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AssignmentWithDetails } from '@/types';
import { useAssignments } from '@/context/AssignmentContext';
import { getAssignments, archiveAssignment } from '@/services/assignmentService';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { Archive, Search, RotateCcw, Trash2, Info } from 'lucide-react';

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
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export const ArchivePage: React.FC = () => {
  const { refreshData: refreshGlobalData, deleteAssignmentQuick } = useAssignments();
  const { onEditAssignment, onOpenDetails } = useOutletContext<LayoutContextType>();

  const [archivedAssignments, setArchivedAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'assignments' | 'tutorials'>('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadArchived = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignments({
        isArchived: true,
        isDeleted: false,
        filters: {
          searchQuery,
        },
      });
      setArchivedAssignments(data);
    } catch (err) {
      console.error('Error loading archive:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

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

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Move "${title}" to trash?`)) {
      await deleteAssignmentQuick(id);
      await loadArchived();
    }
  };

  const filteredItems = archivedAssignments.filter((a) => {
    if (activeTab === 'assignments') return !a.recurring_assignment_id;
    if (activeTab === 'tutorials') return !!a.recurring_assignment_id;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header (Figma #3:74009: Archive / Finished chapters, safely tucked away.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            Finished chapters, safely tucked away.
          </p>
        </div>
      </div>

      {/* Search Bar & Tabs (Figma #3:74009) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#939CB1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search archived items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white placeholder-[#939CB1] focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none transition-all"
          />
        </div>

        {/* Tabs: All · {count}, Assignments, Tutorials */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#4355ED] text-white shadow-xs'
                : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white'
            }`}
          >
            All · {archivedAssignments.length}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-[#4355ED] text-white shadow-xs'
                : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white'
            }`}
          >
            Assignments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tutorials')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'tutorials'
                ? 'bg-[#4355ED] text-white shadow-xs'
                : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white'
            }`}
          >
            Tutorials
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading && archivedAssignments.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] space-y-3">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Archive is clear"
          description="Assignments and tutorials you archive will appear here, preserving completion, upload, and professor checking history."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((assignment) => (
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
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleUnarchive(assignment.id)}
                    disabled={restoringId === assignment.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4355ED] hover:bg-[#EEF0FF] dark:hover:bg-[#4355ED]/20 rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${restoringId === assignment.id ? 'animate-spin' : ''}`} />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(assignment.id, assignment.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D34D61] hover:bg-[#FDEEF1] dark:hover:bg-[#D34D61]/10 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to trash</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Helpful Footer Note (Figma #3:74009) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle flex items-center gap-3 text-xs text-[#66718C] dark:text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#4355ED] shrink-0" />
        <span>Restoring an item keeps its original completion, upload and checking history.</span>
      </div>
    </motion.div>
  );
};
