import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { PriorityLevel, SortField } from '@/types';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  const {
    subjects,
    filters,
    setFilters,
    resetFilters,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  } = useAssignments();

  const [expanded, setExpanded] = React.useState(false);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.statusWorkflow !== 'all' ||
    filters.subjectId !== 'all' ||
    filters.priority !== 'all' ||
    filters.uploadedToErp !== 'all' ||
    filters.professorChecked !== 'all';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const clearSearch = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
      {/* Primary Row: Search + Quick Status + View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments, subjects, notes..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:outline-none transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Workflow Selector */}
          <select
            value={filters.statusWorkflow}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                statusWorkflow: e.target.value as typeof filters.statusWorkflow,
              }))
            }
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
          >
            <option value="all">All Workflow Stages</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="uploaded">Uploaded (ERP)</option>
            <option value="checked">Professor Checked</option>
            <option value="due_today">Due Today</option>
            <option value="due_this_week">Due This Week</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Toggle More Filters */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(!expanded)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              expanded || hasActiveFilters
                ? 'bg-brand-50/90 border-brand-200 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300'
                : 'border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse-subtle" />
            )}
          </motion.button>

          {/* View Toggle (List vs Kanban) */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Subject Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={filters.subjectId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, subjectId: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value as PriorityLevel | 'all',
                    }))
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* ERP Upload Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  ERP Uploaded
                </label>
                <select
                  value={filters.uploadedToErp}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      uploadedToErp: e.target.value as typeof filters.uploadedToErp,
                    }))
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="yes">Uploaded</option>
                  <option value="no">Not Uploaded</option>
                </select>
              </div>

              {/* Professor Checked Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Professor Checked
                </label>
                <select
                  value={filters.professorChecked}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      professorChecked: e.target.value as typeof filters.professorChecked,
                    }))
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="yes">Checked</option>
                  <option value="no">Not Checked</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sorting & Reset Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="due_date">Due Date (Default)</option>
            <option value="priority">Priority</option>
            <option value="recently_added">Recently Added</option>
            <option value="recently_updated">Recently Updated</option>
            <option value="subject">Subject</option>
          </select>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSortOrder}
            className="p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {hasActiveFilters && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </motion.button>
        )}
      </div>
    </div>
  );
};
