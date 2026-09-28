import { Database, PriorityLevel, ProgressStatus, DerivedWorkflowStage, FrequencyType, NotificationType, ThemeMode } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentAttachment = Database['public']['Tables']['assignment_attachments']['Row'];
export type AssignmentLink = Database['public']['Tables']['assignment_links']['Row'];
export type RecurringAssignment = Database['public']['Tables']['recurring_assignments']['Row'];
export type AppNotification = Database['public']['Tables']['notifications']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];

export type { PriorityLevel, ProgressStatus, DerivedWorkflowStage, FrequencyType, NotificationType, ThemeMode };

export type DeadlineUrgency = 'Normal' | 'Approaching' | 'Important' | 'Urgent' | 'Critical' | 'Overdue';

export interface AssignmentWithDetails extends Assignment {
  subject?: Subject;
  attachments?: AssignmentAttachment[];
  links?: AssignmentLink[];
  recurring_assignment?: RecurringAssignment | null;
}

export interface SubjectWithStats extends Subject {
  total_assignments: number;
  completed_assignments: number;
  overdue_assignments: number;
  pending_erp_assignments: number;
  pending_check_assignments: number;
}

export type SortField = 'due_date' | 'priority' | 'recently_added' | 'recently_updated' | 'subject';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  statusWorkflow: 'all' | 'not_started' | 'in_progress' | 'completed' | 'uploaded' | 'checked' | 'overdue' | 'due_today' | 'due_this_week';
  subjectId: string | 'all';
  priority: PriorityLevel | 'all';
  uploadedToErp: 'all' | 'yes' | 'no';
  professorChecked: 'all' | 'yes' | 'no';
  startDate?: string;
  endDate?: string;
}

export interface DashboardStatsData {
  total: number;
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  completed: number;
  pendingErp: number;
  pendingCheck: number;
  completedNotErp: number;
  completionPercentage: number;
  erpUploadRate: number;
  professorCheckRate: number;
}

export interface WeeklyProgressData {
  day: string;
  date: string;
  due: number;
  completed: number;
}

export interface SubjectAnalyticsData {
  name: string;
  color: string;
  total: number;
  completed: number;
  pending: number;
}

export interface WorkflowStageAnalyticsData {
  stage: string;
  count: number;
  color: string;
}
