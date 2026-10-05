import React from 'react';
import { useAssignments } from '@/context/AssignmentContext';
import { PriorityLevel, SortField } from '@/types';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Columns3,
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
    <div className="space-y-3 bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-2xl border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle transition-all">
      {/* Primary Row: View Switcher + Search + Main Dropdowns */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: View Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* View Toggle (Cards vs Kanban - Figma style) */}
          <div className="inline-flex p-1 rounded-xl bg-[#F5F7FC] dark:bg-[#1E293B] border border-[#E5E9F3] dark:border-transparent shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#111827] text-[#4355ED] shadow-xs'
                  : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#111827] text-[#4355ED] shadow-xs'
                  : 'text-[#66718C] dark:text-[#94A3B8] hover:text-[#18223F] dark:hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#939CB1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search assignments…"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/70 dark:bg-[#0B1020]/70 text-[#18223F] dark:text-white placeholder-[#939CB1] focus:bg-white dark:focus:bg-[#111827] focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#939CB1] hover:text-[#18223F] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={filters.subjectId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, subjectId: e.target.value }))
            }
            className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none cursor-pointer"
          >
            <option value="all">All subjects ⌄</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priority: e.target.value as PriorityLevel | 'all',
              }))
            }
            className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none cursor-pointer"
          >
            <option value="all">All priorities ⌄</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Workflow Selector */}
          <select
            value={filters.statusWorkflow}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                statusWorkflow: e.target.value as typeof filters.statusWorkflow,
              }))
            }
            className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none cursor-pointer"
          >
            <option value="all">All statuses ⌄</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="uploaded">Uploaded (ERP)</option>
            <option value="checked">Professor Checked</option>
            <option value="due_today">Due Today</option>
            <option value="due_this_week">Due This Week</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] rounded-xl px-2.5 py-1.5">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="text-xs font-medium bg-transparent text-[#18223F] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="due_date">Due date {sortOrder === 'asc' ? '↑' : '↓'} ⌄</option>
              <option value="priority">Priority ⌄</option>
              <option value="recently_added">Recently Added ⌄</option>
              <option value="recently_updated">Recently Updated ⌄</option>
              <option value="subject">Subject ⌄</option>
            </select>
            <button
              type="button"
              onClick={toggleSortOrder}
              className="text-[#66718C] hover:text-[#4355ED] dark:hover:text-white p-0.5"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* More filters toggle button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(!expanded)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              expanded || filters.uploadedToErp !== 'all' || filters.professorChecked !== 'all'
                ? 'bg-[#EEF0FF] border-[#4355ED]/40 text-[#4355ED] dark:bg-[#4355ED]/20 dark:border-[#4355ED]/50 dark:text-[#7970D9]'
                : 'border-[#E5E9F3] dark:border-[#1E293B] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] text-[#66718C] dark:text-[#94A3B8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More</span>
          </motion.button>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#4355ED] dark:text-[#7970D9] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel for secondary filters (ERP & Professor Checked) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[#E5E9F3] dark:border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* ERP Upload Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
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
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="yes">Uploaded</option>
                  <option value="no">Not Uploaded</option>
                </select>
              </div>

              {/* Professor Checked Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
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
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white focus:outline-none"
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
    </div>
  );
};
