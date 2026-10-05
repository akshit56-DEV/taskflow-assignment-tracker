import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AssignmentWithDetails,
  Subject,
  FilterState,
  SortField,
  SortOrder,
  DashboardStatsData,
} from '@/types';
import { useAuth } from './AuthContext';
import {
  getAssignments,
  toggleAssignmentCompletion,
  toggleAssignmentErpUpload,
  toggleAssignmentProfessorCheck,
  softDeleteAssignment,
  archiveAssignment,
} from '@/services/assignmentService';
import { getSubjects } from '@/services/subjectService';
import { syncInAppNotifications } from '@/services/notificationService';
import { getCalendarDaysDiff, getTodayDateString } from '@/utils/dateUtils';
import confetti from 'canvas-confetti';

interface AssignmentContextType {
  assignments: AssignmentWithDetails[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  refreshData: () => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
  toggleErpUpload: (id: string, uploaded: boolean, date?: string) => Promise<void>;
  toggleProfessorCheck: (id: string, checked: boolean, date?: string) => Promise<void>;
  deleteAssignmentQuick: (id: string) => Promise<void>;
  archiveAssignmentQuick: (id: string, isArchived?: boolean) => Promise<void>;
  stats: DashboardStatsData;
}

const initialFilters: FilterState = {
  searchQuery: '',
  statusWorkflow: 'all',
  subjectId: 'all',
  priority: 'all',
  uploadedToErp: 'all',
  professorChecked: 'all',
};

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const AssignmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const refreshData = useCallback(async () => {
    if (!user) {
      setAssignments([]);
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [fetchedAssignments, fetchedSubjects] = await Promise.all([
        getAssignments({ filters, sortField, sortOrder }),
        getSubjects(),
      ]);

      setAssignments(fetchedAssignments);
      setSubjects(fetchedSubjects);

      // Trigger automatic notification sync
      if (fetchedAssignments.length > 0) {
        syncInAppNotifications(fetchedAssignments, profile?.reminder_settings || undefined);
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError((err as Error).message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [user, filters, sortField, sortOrder, profile]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setAssignments([]);
      setSubjects([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    // Optimistic UI update
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              progress_status: completed ? 'in_progress' : item.progress_status,
            }
          : item
      )
    );

    if (completed) {
      // Trigger celebratory micro-confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#6366f1'],
      });
    }

    try {
      await toggleAssignmentCompletion(id, completed);
      await refreshData();
    } catch (err: unknown) {
      console.error('Error toggling completion:', err);
      await refreshData();
      throw err;
    }
  };

  const handleToggleErpUpload = async (id: string, uploaded: boolean, date?: string) => {
    const uploadTimestamp = uploaded ? (date ? new Date(date).toISOString() : new Date().toISOString()) : null;
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              uploaded_to_erp: uploaded,
              erp_upload_date: uploadTimestamp,
            }
          : item
      )
    );

    try {
      await toggleAssignmentErpUpload(id, uploaded, date);
      await refreshData();
    } catch (err: unknown) {
      console.error('Error toggling ERP upload:', err);
      await refreshData();
      throw err;
    }
  };

  const handleToggleProfessorCheck = async (id: string, checked: boolean, date?: string) => {
    const checkTimestamp = checked ? (date ? new Date(date).toISOString() : new Date().toISOString()) : null;
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              professor_checked: checked,
              checked_at: checkTimestamp,
            }
          : item
      )
    );

    try {
      await toggleAssignmentProfessorCheck(id, checked, date);
      await refreshData();
    } catch (err: unknown) {
      console.error('Error toggling Professor check:', err);
      await refreshData();
      throw err;
    }
  };

  const handleDeleteAssignmentQuick = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    try {
      await softDeleteAssignment(id);
      await refreshData();
    } catch (err: unknown) {
      console.error('Error deleting assignment:', err);
      await refreshData();
      throw err;
    }
  };

  const handleArchiveAssignmentQuick = async (id: string, isArchived: boolean = true) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    try {
      await archiveAssignment(id, isArchived);
      await refreshData();
    } catch (err: unknown) {
      console.error('Error archiving assignment:', err);
      await refreshData();
      throw err;
    }
  };

  // Compute live real statistics from current active assignments
  const todayStr = getTodayDateString();
  const total = assignments.length;
  const completed = assignments.filter((a) => a.completed).length;
  const overdue = assignments.filter((a) => !a.completed && a.due_date < todayStr).length;
  const dueToday = assignments.filter((a) => a.due_date === todayStr).length;
  const dueSoon = assignments.filter((a) => {
    if (a.completed) return false;
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= 0 && diff <= 2;
  }).length;
  const dueThisWeek = assignments.filter((a) => {
    const diff = getCalendarDaysDiff(a.due_date);
    return diff >= 0 && diff <= 7;
  }).length;
  const pendingErp = assignments.filter((a) => a.completed && !a.uploaded_to_erp).length;
  const pendingCheck = assignments.filter((a) => a.completed && a.uploaded_to_erp && !a.professor_checked).length;
  const completedNotErp = assignments.filter((a) => a.completed && !a.uploaded_to_erp).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const erpUploadRate = completed > 0 ? Math.round((assignments.filter((a) => a.uploaded_to_erp).length / completed) * 100) : 0;
  const professorCheckRate = completed > 0 ? Math.round((assignments.filter((a) => a.professor_checked).length / completed) * 100) : 0;

  const stats: DashboardStatsData = {
    total,
    dueToday,
    dueSoon,
    dueThisWeek,
    overdue,
    completed,
    pendingErp,
    pendingCheck,
    completedNotErp,
    completionPercentage,
    erpUploadRate,
    professorCheckRate,
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        subjects,
        loading,
        error,
        filters,
        setFilters,
        resetFilters,
        sortField,
        sortOrder,
        setSortField,
        setSortOrder,
        refreshData,
        toggleComplete: handleToggleComplete,
        toggleErpUpload: handleToggleErpUpload,
        toggleProfessorCheck: handleToggleProfessorCheck,
        deleteAssignmentQuick: handleDeleteAssignmentQuick,
        archiveAssignmentQuick: handleArchiveAssignmentQuick,
        stats,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentProvider');
  }
  return context;
};
