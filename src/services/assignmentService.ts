import { supabase } from '@/lib/supabase';
import {
  Assignment,
  AssignmentWithDetails,
  FilterState,
  PriorityLevel,
  ProgressStatus,
  SortField,
  SortOrder,
} from '@/types';
import { getCalendarDaysDiff, getTodayDateString } from '@/utils/dateUtils';
import { getAutomaticPriority, getAutomaticPriorityWeight } from '@/utils/workflowUtils';
import { logActivity } from './activityService';

export async function getAssignments(options?: {
  filters?: Partial<FilterState>;
  sortField?: SortField;
  sortOrder?: SortOrder;
  isArchived?: boolean;
  isDeleted?: boolean;
}): Promise<AssignmentWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const isArchived = options?.isArchived ?? false;
  const isDeleted = options?.isDeleted ?? false;

  let query = supabase
    .from('assignments')
    .select(`
      *,
      subject:subjects(*),
      attachments:assignment_attachments(*),
      links:assignment_links(*)
    `)
    .eq('user_id', user.id)
    .eq('is_deleted', isDeleted);

  if (!isDeleted) {
    query = query.eq('is_archived', isArchived);
  }

  // Subject filter
  if (options?.filters?.subjectId && options.filters.subjectId !== 'all') {
    query = query.eq('subject_id', options.filters.subjectId);
  }

  // Note: Priority filtering is handled in-memory using getAutomaticPriority below as the source of truth

  // ERP filter
  if (options?.filters?.uploadedToErp === 'yes') {
    query = query.eq('uploaded_to_erp', true);
  } else if (options?.filters?.uploadedToErp === 'no') {
    query = query.eq('uploaded_to_erp', false);
  }

  // Professor check filter
  if (options?.filters?.professorChecked === 'yes') {
    query = query.eq('professor_checked', true);
  } else if (options?.filters?.professorChecked === 'no') {
    query = query.eq('professor_checked', false);
  }

  // Date range filters
  if (options?.filters?.startDate) {
    query = query.gte('due_date', options.filters.startDate);
  }
  if (options?.filters?.endDate) {
    query = query.lte('due_date', options.filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching assignments:', error);
    throw new Error('Unable to load assignments. Please try again.');
  }

  let list: AssignmentWithDetails[] = (data as unknown as AssignmentWithDetails[]) || [];

  // Search filter (in-memory for title, subject name, description, notes)
  if (options?.filters?.searchQuery?.trim()) {
    const q = options.filters.searchQuery.toLowerCase().trim();
    list = list.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const notesMatch = item.notes?.toLowerCase().includes(q);
      const subjectMatch = item.subject?.name.toLowerCase().includes(q);
      return titleMatch || descMatch || notesMatch || subjectMatch;
    });
  }

  // Status/Workflow filter
  if (options?.filters?.statusWorkflow && options.filters.statusWorkflow !== 'all') {
    const sw = options.filters.statusWorkflow;
    const todayStr = getTodayDateString();

    list = list.filter((item) => {
      if (sw === 'not_started') return item.progress_status === 'not_started' && !item.completed;
      if (sw === 'in_progress') return item.progress_status === 'in_progress' && !item.completed;
      if (sw === 'completed') return item.completed;
      if (sw === 'uploaded') return item.uploaded_to_erp;
      if (sw === 'checked') return item.professor_checked;
      if (sw === 'overdue') return !item.completed && item.due_date < todayStr;
      if (sw === 'due_today') return item.due_date === todayStr;
      if (sw === 'due_this_week') {
        const diff = getCalendarDaysDiff(item.due_date);
        return diff >= 0 && diff <= 7;
      }
      return true;
    });
  }

  // Priority filter: Evaluated in-memory using getAutomaticPriority as the single source of truth
  if (options?.filters?.priority && options.filters.priority !== 'all') {
    const targetFilter = options.filters.priority.toLowerCase();
    list = list.filter((item) => {
      const autoP = getAutomaticPriority(item).toLowerCase();
      if (targetFilter === 'critical') return autoP === 'critical';
      if (targetFilter === 'urgent') return autoP === 'urgent' || autoP === 'critical';
      if (targetFilter === 'high') return autoP === 'high';
      if (targetFilter === 'medium') return autoP === 'medium';
      if (targetFilter === 'low' || targetFilter === 'normal') return autoP === 'normal' || autoP === 'unscheduled';
      return autoP === targetFilter;
    });
  }

  // Sort assignments using Automatic Priority as source of truth
  list.sort((a, b) => {
    if (options?.sortField) {
      const order = options.sortOrder === 'desc' ? -1 : 1;
      if (options.sortField === 'due_date') {
        return a.due_date.localeCompare(b.due_date) * order;
      }
      if (options.sortField === 'priority') {
        const weightA = getAutomaticPriorityWeight(getAutomaticPriority(a));
        const weightB = getAutomaticPriorityWeight(getAutomaticPriority(b));
        return (weightB - weightA) * order;
      }
      if (options.sortField === 'recently_added') {
        return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * order;
      }
      if (options.sortField === 'recently_updated') {
        return (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) * order;
      }
      if (options.sortField === 'subject') {
        const nameA = a.subject?.name || '';
        const nameB = b.subject?.name || '';
        return nameA.localeCompare(nameB) * order;
      }
    }

    // Default smart sort:
    // 1. Overdue first (if not completed)
    // 2. Due today
    // 3. Due tomorrow
    // 4. Closest deadline
    // 5. Completed at the end
    // Within same day: Automatic Priority (Critical > Urgent > High > Medium > Normal)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const diffA = getCalendarDaysDiff(a.due_date);
    const diffB = getCalendarDaysDiff(b.due_date);

    // Overdue bucket (< 0)
    const isOverdueA = diffA < 0 && !a.completed;
    const isOverdueB = diffB < 0 && !b.completed;

    if (isOverdueA && !isOverdueB) return -1;
    if (!isOverdueA && isOverdueB) return 1;

    // Compare due dates
    if (diffA !== diffB) {
      return diffA - diffB;
    }

    // Same date: compare automatic priority
    const weightA = getAutomaticPriorityWeight(getAutomaticPriority(a));
    const weightB = getAutomaticPriorityWeight(getAutomaticPriority(b));
    return weightB - weightA;
  });

  return list;
}

export async function getAssignmentById(id: string): Promise<AssignmentWithDetails | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      subject:subjects(*),
      attachments:assignment_attachments(*),
      links:assignment_links(*),
      recurring_assignment:recurring_assignments(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching assignment details:', error);
    return null;
  }

  return data as unknown as AssignmentWithDetails;
}

export async function createAssignment(assignmentData: {
  subject_id: string;
  title: string;
  description?: string | null;
  assigned_date?: string | null;
  due_date: string;
  progress_status?: ProgressStatus;
  priority?: PriorityLevel;
  notes?: string | null;
  links?: { title: string; url: string }[];
}): Promise<AssignmentWithDetails> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate
  if (!assignmentData.title?.trim()) throw new Error('Title is required');
  if (!assignmentData.subject_id) throw new Error('Subject is required');
  if (!assignmentData.due_date) throw new Error('Due date is required');

  const { data, error } = await supabase
    .from('assignments')
    .insert([
      {
        user_id: user.id,
        subject_id: assignmentData.subject_id,
        title: assignmentData.title.trim(),
        description: assignmentData.description?.trim() || null,
        assigned_date: assignmentData.assigned_date || null,
        due_date: assignmentData.due_date,
        progress_status: assignmentData.progress_status || 'not_started',
        priority: assignmentData.priority || (() => {
          const autoP = getAutomaticPriority({ due_date: assignmentData.due_date });
          if (autoP === 'Critical' || autoP === 'Urgent') return 'Urgent';
          if (autoP === 'High') return 'High';
          if (autoP === 'Medium') return 'Medium';
          return 'Low';
        })(),
        notes: assignmentData.notes?.trim() || null,
        completed: false,
        uploaded_to_erp: false,
        professor_checked: false,
        is_archived: false,
        is_deleted: false,
      },
    ])
    .select(`*, subject:subjects(*)`)
    .single();

  if (error) throw error;

  // Insert links if any
  if (assignmentData.links && assignmentData.links.length > 0) {
    const linksToInsert = assignmentData.links
      .filter((l) => l.url.trim())
      .map((l) => ({
        user_id: user.id,
        assignment_id: data.id,
        title: l.title.trim() || 'Link',
        url: l.url.trim(),
      }));

    if (linksToInsert.length > 0) {
      await supabase.from('assignment_links').insert(linksToInsert);
    }
  }

  await logActivity('assignment_created', data.id, {
    title: data.title,
    due_date: data.due_date,
  });

  return getAssignmentById(data.id) as Promise<AssignmentWithDetails>;
}

export async function updateAssignment(
  id: string,
  updates: Partial<Assignment>
): Promise<AssignmentWithDetails> {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select(`*, subject:subjects(*)`)
    .single();

  if (error) throw error;

  await logActivity('assignment_updated', id, { title: data.title });
  return getAssignmentById(id) as Promise<AssignmentWithDetails>;
}

export async function toggleAssignmentCompletion(
  id: string,
  completed: boolean
): Promise<Assignment> {
  const now = new Date().toISOString();
  const updates: Partial<Assignment> = {
    completed,
    completed_at: completed ? now : null,
    // If completing and was not started, elevate status
    ...(completed ? { progress_status: 'in_progress' } : {}),
  };

  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity(completed ? 'assignment_completed' : 'assignment_uncompleted', id, {
    title: data.title,
  });

  return data;
}

export async function toggleAssignmentErpUpload(
  id: string,
  uploaded: boolean,
  customDate?: string
): Promise<Assignment> {
  const uploadDate = uploaded ? (customDate ? new Date(customDate).toISOString() : new Date().toISOString()) : null;

  const updates: Partial<Assignment> = {
    uploaded_to_erp: uploaded,
    erp_upload_date: uploadDate,
    // Note: Do NOT alter or destroy user completed state
  };

  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity(uploaded ? 'erp_uploaded' : 'erp_upload_removed', id, {
    title: data.title,
    erp_upload_date: uploadDate,
  });

  return data;
}

export async function toggleAssignmentProfessorCheck(
  id: string,
  checked: boolean,
  customDate?: string
): Promise<Assignment> {
  const checkDate = checked ? (customDate ? new Date(customDate).toISOString() : new Date().toISOString()) : null;

  const updates: Partial<Assignment> = {
    professor_checked: checked,
    checked_at: checkDate,
  };

  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity(checked ? 'professor_checked' : 'professor_check_removed', id, {
    title: data.title,
    checked_at: checkDate,
  });

  return data;
}

export async function softDeleteAssignment(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('assignments')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('title')
    .single();

  if (error) throw error;
  await logActivity('assignment_deleted', id, { title: data.title });
}

export async function restoreAssignment(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('assignments')
    .update({
      is_deleted: false,
      deleted_at: null,
    })
    .eq('id', id)
    .select('title')
    .single();

  if (error) throw error;
  await logActivity('assignment_restored', id, { title: data.title });
}

export async function permanentDeleteAssignment(id: string): Promise<void> {
  // 1. Fetch attachments to clean up storage files
  const { data: attachments } = await supabase
    .from('assignment_attachments')
    .select('file_path')
    .eq('assignment_id', id);

  if (attachments && attachments.length > 0) {
    const filePaths = attachments.map((a) => a.file_path);
    await supabase.storage.from('assignment-files').remove(filePaths);
  }

  // 2. Delete database record (cascades to attachments, links, notifications)
  const { error } = await supabase.from('assignments').delete().eq('id', id);
  if (error) throw error;

  await logActivity('assignment_permanently_deleted', null, { assignmentId: id });
}

export async function archiveAssignment(id: string, isArchived: boolean = true): Promise<void> {
  const { data, error } = await supabase
    .from('assignments')
    .update({ is_archived: isArchived })
    .eq('id', id)
    .select('title')
    .single();

  if (error) throw error;
  await logActivity(isArchived ? 'assignment_archived' : 'assignment_unarchived', id, {
    title: data?.title,
  });
}
