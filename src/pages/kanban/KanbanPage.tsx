import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAssignments } from '@/context/AssignmentContext';
import { KanbanBoard } from '@/components/assignments/KanbanBoard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AssignmentWithDetails } from '@/types';
import { getCalendarDaysDiff } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LayoutContextType {
  onOpenAddModal: () => void;
  onEditAssignment: (assignment: AssignmentWithDetails) => void;
  onOpenDetails: (assignmentId: string) => void;
}

export const KanbanPage: React.FC = () => {
  const { assignments, subjects, loading } = useAssignments();
  const { onOpenAddModal, onEditAssignment, onOpenDetails } =
    useOutletContext<LayoutContextType>();

  // Local Kanban Filters (matching Figma 09 — Kanban Assignment filters)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [filterDueSoon, setFilterDueSoon] = useState<boolean>(false);
  const [filterAwaitingErp, setFilterAwaitingErp] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter assignments based on real data
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (a.is_deleted || a.is_archived) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesSubject = a.subject?.name?.toLowerCase().includes(query);
        const matchesDesc = a.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject && !matchesDesc) return false;
      }

      // Subject filter
      if (selectedSubjectId !== 'all') {
        if (a.subject_id !== selectedSubjectId) return false;
      }

      // Due soon filter (within 3 days and not completed)
      if (filterDueSoon) {
        if (a.completed) return false;
        const diff = getCalendarDaysDiff(a.due_date);
        if (diff > 3 || diff < 0) return false;
      }

      // Awaiting ERP filter (completed but not uploaded to ERP)
      if (filterAwaitingErp) {
        if (!a.completed || a.uploaded_to_erp) return false;
      }

      return true;
    });
  }, [assignments, selectedSubjectId, filterDueSoon, filterAwaitingErp, searchQuery]);

  const hasActiveFilters =
    selectedSubjectId !== 'all' || filterDueSoon || filterAwaitingErp || searchQuery !== '';

  const clearAllFilters = () => {
    setSelectedSubjectId('all');
    setFilterDueSoon(false);
    setFilterAwaitingErp(false);
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Header (Figma 09 — Kanban / Default Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#5C6175] dark:text-[#94A3B8] tracking-wider uppercase mb-1">
            Workspace <span className="mx-1 text-[#9499AB]">/</span> Kanban
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171A2E] dark:text-white tracking-tight">
            Kanban
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6175] dark:text-[#94A3B8] mt-1">
            Move the work forward. Completed is not the final stage.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, y: 1 }}
          transition={{ duration: 0.2 }}
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B4DF5] hover:bg-[#4B3CE0] shadow-tf-subtle hover:shadow-tf-card transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add assignment</span>
        </motion.button>
      </div>

      {/* 2. TASKFLOW Principle Banner (Figma 09 — TASKFLOW principle) */}
      <div className="relative rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-4 sm:p-5 shadow-tf-subtle overflow-hidden">
        {/* Figma Signature Rail on left */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-rail" />

        <div className="pl-3 sm:pl-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B4DF5]" />
              <h2 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white">
                Completed ≠ Submitted ≠ Checked
              </h2>
            </div>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
              Finishing the work is only step three. Upload it to ERP, then confirm your professor
              has checked it.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#5B4DF5] dark:text-[#A49DFC] bg-[#EEECFF] dark:bg-[#5B4DF5]/20 border border-[#5B4DF5]/20 px-3 py-1 rounded-full self-start sm:self-auto">
            <span>5-Stage Academic Flow</span>
          </div>
        </div>
      </div>

      {/* 3. Filters Bar (Figma 09 — Assignment filters: All subjects · Due soon · Awaiting ERP + Search) */}
      <div className="bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-3.5 sm:p-4 rounded-2xl shadow-tf-subtle space-y-3">
        {/* Top Controls: Quick Toggles & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Due Soon Toggle */}
            <button
              type="button"
              onClick={() => setFilterDueSoon(!filterDueSoon)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                filterDueSoon
                  ? 'bg-[#D68A16] text-white'
                  : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 hover:text-[#171A2E] dark:hover:text-white'
              }`}
            >
              Due soon
            </button>

            {/* Awaiting ERP Toggle */}
            <button
              type="button"
              onClick={() => setFilterAwaitingErp(!filterAwaitingErp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                filterAwaitingErp
                  ? 'bg-[#7970D9] text-white'
                  : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 hover:text-[#171A2E] dark:hover:text-white'
              }`}
            >
              Awaiting ERP
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-[#E04F5F] hover:underline flex items-center gap-1 px-2 py-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-4 h-4 text-[#9499AB] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kanban tasks..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-[#F5F7FB] dark:bg-slate-800/80 border border-[#E6E9F2] dark:border-slate-700 text-[#171A2E] dark:text-white placeholder-[#9499AB] focus:outline-none focus:border-[#5B4DF5]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Subject Filters Strip (Uncramped, clean scrolling) */}
        <div className="pt-2.5 border-t border-[#E6E9F2]/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[11px] font-bold text-[#9499AB] uppercase tracking-wider flex-shrink-0">
            Subject:
          </span>

          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              selectedSubjectId === 'all'
                ? 'bg-[#5B4DF5] text-white shadow-2xs'
                : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 hover:text-[#171A2E] dark:hover:text-white'
            }`}
          >
            All subjects
          </button>

          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedSubjectId === sub.id
                  ? 'bg-[#5B4DF5] text-white shadow-2xs'
                  : 'bg-[#F5F7FB] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 hover:text-[#171A2E] dark:hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: sub.color || '#5B4DF5' }}
              />
              <span>{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Kanban 5-Stage Board Content */}
      {loading && assignments.length === 0 ? (
        <LoadingSpinner message="Loading your Kanban board..." />
      ) : filteredAssignments.length === 0 && hasActiveFilters ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#E6E9F2] dark:border-[#1E293B] bg-white dark:bg-[#11142B] space-y-3">
          <Layers className="w-8 h-8 text-[#9499AB] mx-auto" />
          <h3 className="font-heading font-bold text-sm text-[#171A2E] dark:text-white">
            No assignments match your filters
          </h3>
          <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-sm mx-auto">
            Try clearing your active filters or search keyword to view all Kanban columns.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B4DF5] text-white hover:bg-[#4B3CE0] transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <KanbanBoard
          assignments={filteredAssignments}
          onOpenDetails={(assignment) => onOpenDetails(assignment.id)}
          onEdit={onEditAssignment}
          onAddInStage={() => onOpenAddModal()}
        />
      )}
    </motion.div>
  );
};

export default KanbanPage;
