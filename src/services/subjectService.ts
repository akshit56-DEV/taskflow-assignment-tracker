import { supabase } from '@/lib/supabase';
import { Subject, SubjectWithStats } from '@/types';
import { logActivity } from './activityService';

export async function getSubjects(includeArchived: boolean = false): Promise<Subject[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error in getSubjects query:', error);
      throw new Error('Unable to load subjects. Please try again.');
    }
    return data || [];
  } catch (err: unknown) {
    console.error('getSubjects caught error:', err);
    throw err;
  }
}

export async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const [subjectsRes, assignmentsRes] = await Promise.all([
      supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true }),
      supabase
        .from('assignments')
        .select('id, subject_id, completed, due_date, uploaded_to_erp, professor_checked, is_deleted')
        .eq('user_id', user.id)
        .eq('is_deleted', false),
    ]);

    if (subjectsRes.error) {
      console.error('Error fetching subjects with stats:', subjectsRes.error);
      throw new Error('Unable to load subjects. Please try again.');
    }
    if (assignmentsRes.error) {
      console.error('Error fetching assignments for stats:', assignmentsRes.error);
      throw new Error('Unable to load assignment stats. Please try again.');
    }

    const subjects = subjectsRes.data || [];
    const assignments = assignmentsRes.data || [];
    const todayStr = new Date().toISOString().split('T')[0];

    return subjects.map((subject) => {
      const subjectAssignments = assignments.filter((a) => a.subject_id === subject.id);
      const total = subjectAssignments.length;
      const completed = subjectAssignments.filter((a) => a.completed).length;
      const overdue = subjectAssignments.filter((a) => !a.completed && a.due_date < todayStr).length;
      const pendingErp = subjectAssignments.filter((a) => a.completed && !a.uploaded_to_erp).length;
      const pendingCheck = subjectAssignments.filter((a) => a.completed && a.uploaded_to_erp && !a.professor_checked).length;

      return {
        ...subject,
        total_assignments: total,
        completed_assignments: completed,
        overdue_assignments: overdue,
        pending_erp_assignments: pendingErp,
        pending_check_assignments: pendingCheck,
      };
    });
  } catch (err: unknown) {
    console.error('getSubjectsWithStats caught error:', err);
    throw err;
  }
}

export async function createSubject(subjectData: {
  name: string;
  code?: string | null;
  color: string;
  icon?: string | null;
}): Promise<Subject> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subjects')
      .insert([
        {
          user_id: user.id,
          name: subjectData.name.trim(),
          code: subjectData.code?.trim() || null,
          color: subjectData.color,
          icon: subjectData.icon || 'BookOpen',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating subject in database:', error);
      if (error.code === '23505') {
        throw new Error(`A subject named "${subjectData.name.trim()}" already exists.`);
      }
      throw new Error('Unable to create subject. Please try again.');
    }
    await logActivity('subject_created', null, { name: data.name });
    return data;
  } catch (err: unknown) {
    console.error('createSubject error:', err);
    throw err;
  }
}

export async function updateSubject(
  subjectId: string,
  updates: Partial<Pick<Subject, 'name' | 'code' | 'color' | 'icon' | 'is_archived'>>
): Promise<Subject> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', subjectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject in database:', error);
      if (error.code === '23505') {
        throw new Error('A subject with this name already exists.');
      }
      throw new Error('Unable to update subject. Please try again.');
    }
    await logActivity('subject_updated', null, { name: data.name });
    return data;
  } catch (err: unknown) {
    console.error('updateSubject error:', err);
    throw err;
  }
}

export async function getSubjectAssignmentCount(subjectId: string): Promise<number> {
  const { count, error } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', subjectId)
    .eq('is_deleted', false);

  if (error) {
    console.error('Error fetching subject assignment count:', error);
    return 0;
  }
  return count || 0;
}

export async function deleteSubject(
  subjectId: string,
  reassignToSubjectId?: string
): Promise<void> {
  try {
    const assignmentCount = await getSubjectAssignmentCount(subjectId);

    if (assignmentCount > 0) {
      if (reassignToSubjectId) {
        // Reassign all active assignments to another subject before deleting
        const { error: reassignError } = await supabase
          .from('assignments')
          .update({ subject_id: reassignToSubjectId })
          .eq('subject_id', subjectId);

        if (reassignError) {
          console.error('Error reassigning assignments:', reassignError);
          throw new Error('Unable to reassign assignments. Please try again.');
        }
      } else {
        throw new Error(
          `Cannot delete subject with ${assignmentCount} assignments. Please reassign them or archive the subject instead.`
        );
      }
    }

    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) {
      console.error('Error deleting subject:', error);
      throw new Error('Unable to delete subject. Please try again.');
    }
    await logActivity('subject_deleted', null, { subjectId });
  } catch (err: unknown) {
    console.error('deleteSubject error:', err);
    throw err;
  }
}

export async function archiveSubject(subjectId: string, isArchived: boolean = true): Promise<Subject> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update({ is_archived: isArchived })
      .eq('id', subjectId)
      .select()
      .single();

    if (error) {
      console.error('Error archiving subject:', error);
      throw new Error('Unable to archive subject. Please try again.');
    }
    await logActivity(isArchived ? 'subject_archived' : 'subject_unarchived', null, { subjectId });
    return data;
  } catch (err: unknown) {
    console.error('archiveSubject error:', err);
    throw err;
  }
}
