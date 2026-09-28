export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ProgressStatus = 'not_started' | 'in_progress';
export type DerivedWorkflowStage = 'not_started' | 'in_progress' | 'completed' | 'uploaded' | 'checked';
export type FrequencyType = 'weekly' | 'biweekly' | 'monthly';
export type NotificationType = 'due_soon' | 'overdue' | 'erp_pending' | 'system';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          reminder_settings: {
            days_before: number[];
            email_reminders: boolean;
            in_app_reminders: boolean;
            browser_reminders: boolean;
          } | null;
          theme: ThemeMode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          reminder_settings?: {
            days_before: number[];
            email_reminders: boolean;
            in_app_reminders: boolean;
            browser_reminders: boolean;
          } | null;
          theme?: ThemeMode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          reminder_settings?: {
            days_before: number[];
            email_reminders: boolean;
            in_app_reminders: boolean;
            browser_reminders: boolean;
          } | null;
          theme?: ThemeMode;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          code: string | null;
          color: string;
          icon: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          code?: string | null;
          color?: string;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          code?: string | null;
          color?: string;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recurring_assignments: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          description: string | null;
          frequency: FrequencyType;
          day_of_week: number | null;
          priority: PriorityLevel;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          last_generated_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          description?: string | null;
          frequency?: FrequencyType;
          day_of_week?: number | null;
          priority?: PriorityLevel;
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          last_generated_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          title?: string;
          description?: string | null;
          frequency?: FrequencyType;
          day_of_week?: number | null;
          priority?: PriorityLevel;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          last_generated_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          description: string | null;
          assigned_date: string | null;
          due_date: string;
          progress_status: ProgressStatus;
          priority: PriorityLevel;
          completed: boolean;
          completed_at: string | null;
          uploaded_to_erp: boolean;
          erp_upload_date: string | null;
          professor_checked: boolean;
          checked_at: string | null;
          notes: string | null;
          recurring_assignment_id: string | null;
          recurring_instance_date: string | null;
          is_archived: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          description?: string | null;
          assigned_date?: string | null;
          due_date: string;
          progress_status?: ProgressStatus;
          priority?: PriorityLevel;
          completed?: boolean;
          completed_at?: string | null;
          uploaded_to_erp?: boolean;
          erp_upload_date?: string | null;
          professor_checked?: boolean;
          checked_at?: string | null;
          notes?: string | null;
          recurring_assignment_id?: string | null;
          recurring_instance_date?: string | null;
          is_archived?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          title?: string;
          description?: string | null;
          assigned_date?: string | null;
          due_date?: string;
          progress_status?: ProgressStatus;
          priority?: PriorityLevel;
          completed?: boolean;
          completed_at?: string | null;
          uploaded_to_erp?: boolean;
          erp_upload_date?: string | null;
          professor_checked?: boolean;
          checked_at?: string | null;
          notes?: string | null;
          recurring_assignment_id?: string | null;
          recurring_instance_date?: string | null;
          is_archived?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignment_attachments: {
        Row: {
          id: string;
          user_id: string;
          assignment_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assignment_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assignment_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assignment_links: {
        Row: {
          id: string;
          user_id: string;
          assignment_id: string;
          title: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assignment_id: string;
          title: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assignment_id?: string;
          title?: string;
          url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          assignment_id: string | null;
          title: string;
          message: string;
          type: NotificationType;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assignment_id?: string | null;
          title: string;
          message: string;
          type: NotificationType;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assignment_id?: string | null;
          title?: string;
          message?: string;
          type?: NotificationType;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          assignment_id: string | null;
          action: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assignment_id?: string | null;
          action: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assignment_id?: string | null;
          action?: string;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
