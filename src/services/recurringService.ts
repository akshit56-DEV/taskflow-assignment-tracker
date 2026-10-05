import { supabase } from '@/lib/supabase';
import { RecurringAssignment, FrequencyType, PriorityLevel, Assignment } from '@/types';
import { formatDateToIsoDate, parseIsoDateToLocalDate } from '@/utils/dateUtils';
import { logActivity } from './activityService';

export async function getRecurringAssignments(): Promise<RecurringAssignment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('recurring_assignments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Calculates occurrence dates for a given frequency within a start and target end window
 */
export function calculateOccurrenceDates(
  startDateStr: string,
  endDateStr: string | null,
  frequency: FrequencyType,
  dayOfWeek: number | null, // 0 = Sunday, 1 = Monday ... 6 = Saturday
  weeksWindow: number = 10
): string[] {
  const dates: string[] = [];
  const start = parseIsoDateToLocalDate(startDateStr);
  const maxEnd = new Date();
  maxEnd.setDate(maxEnd.getDate() + weeksWindow * 7);

  const seriesEnd = endDateStr ? parseIsoDateToLocalDate(endDateStr) : null;
  const effectiveEnd = seriesEnd && seriesEnd < maxEnd ? seriesEnd : maxEnd;

  const current = new Date(start);
  const targetDayOfMonth = start.getDate();

  // If a specific day of week is specified and start date does not match, advance to next matching day
  if (dayOfWeek !== null && dayOfWeek !== undefined && current.getDay() !== dayOfWeek) {
    const diff = (dayOfWeek - current.getDay() + 7) % 7;
    current.setDate(current.getDate() + (diff === 0 ? 7 : diff));
  }

  let iteration = 0;
  const maxIterations = 52; // Safeguard against runaway loops

  while (current <= effectiveEnd && iteration < maxIterations) {
    dates.push(formatDateToIsoDate(current));
    iteration++;

    if (frequency === 'weekly') {
      current.setDate(current.getDate() + 7);
    } else if (frequency === 'biweekly') {
      current.setDate(current.getDate() + 14);
    } else if (frequency === 'monthly') {
      // Advance month while respecting target day of month
      const nextMonth = current.getMonth() + 1;
      const nextYear = current.getFullYear() + Math.floor(nextMonth / 12);
      const normalizedMonth = nextMonth % 12;
      const daysInNextMonth = new Date(nextYear, normalizedMonth + 1, 0).getDate();
      const safeDay = Math.min(targetDayOfMonth, daysInNextMonth);
      current.setFullYear(nextYear, normalizedMonth, safeDay);
    } else {
      break;
    }
  }

  return dates;
}

export async function createRecurringSeries(seriesData: {
  subject_id: string;
  title: string;
  description?: string | null;
  frequency: FrequencyType;
  day_of_week?: number | null;
  priority: PriorityLevel;
  start_date: string;
  end_date?: string | null;
}): Promise<RecurringAssignment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // 1. Insert recurring assignment series
  const { data: series, error: seriesError } = await supabase
    .from('recurring_assignments')
    .insert([
      {
        user_id: user.id,
        subject_id: seriesData.subject_id,
        title: seriesData.title.trim(),
        description: seriesData.description?.trim() || null,
        frequency: seriesData.frequency,
        day_of_week: seriesData.day_of_week ?? null,
        priority: seriesData.priority,
        start_date: seriesData.start_date,
        end_date: seriesData.end_date || null,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (seriesError) throw seriesError;

  // 2. Generate instances for the next 8-12 weeks
  await generateInstancesForSeries(series.id);

  await logActivity('recurring_series_created', null, { title: series.title, frequency: series.frequency });
  return series;
}

export async function generateInstancesForSeries(
  seriesId: string,
  weeksAhead: number = 10
): Promise<Assignment[]> {
  const { data: series, error: seriesError } = await supabase
    .from('recurring_assignments')
    .select('*')
    .eq('id', seriesId)
    .single();

  if (seriesError || !series || !series.is_active) return [];

  // Fetch already existing instances to prevent duplicates
  const { data: existingInstances } = await supabase
    .from('assignments')
    .select('recurring_instance_date')
    .eq('recurring_assignment_id', seriesId);

  const existingDatesSet = new Set(
    (existingInstances || []).map((inst) => inst.recurring_instance_date).filter(Boolean)
  );

  const occurrenceDates = calculateOccurrenceDates(
    series.start_date,
    series.end_date,
    series.frequency,
    series.day_of_week,
    weeksAhead
  );

  const newInstancesToInsert = occurrenceDates
    .filter((dateStr) => !existingDatesSet.has(dateStr))
    .map((dateStr, index) => {
      // Calculate assigned date (e.g. 7 days before due date or start of week)
      const instanceDate = parseIsoDateToLocalDate(dateStr);
      const assigned = new Date(instanceDate);
      assigned.setDate(assigned.getDate() - 7);
      const assignedDateStr = formatDateToIsoDate(assigned);

      return {
        user_id: series.user_id,
        subject_id: series.subject_id,
        title: `${series.title} #${existingDatesSet.size + index + 1}`,
        description: series.description,
        assigned_date: assignedDateStr,
        due_date: dateStr,
        progress_status: 'not_started' as const,
        priority: series.priority,
        completed: false,
        uploaded_to_erp: false,
        professor_checked: false,
        recurring_assignment_id: series.id,
        recurring_instance_date: dateStr,
      };
    });

  if (newInstancesToInsert.length === 0) return [];

  const { data: inserted, error: insertError } = await supabase
    .from('assignments')
    .insert(newInstancesToInsert)
    .select();

  if (insertError) {
    console.error('Error creating recurring assignment instances:', insertError);
    return [];
  }

  return inserted || [];
}

export async function toggleRecurringActive(seriesId: string, isActive: boolean): Promise<RecurringAssignment> {
  const { data, error } = await supabase
    .from('recurring_assignments')
    .update({ is_active: isActive })
    .eq('id', seriesId)
    .select()
    .single();

  if (error) throw error;
  await logActivity(isActive ? 'recurring_resumed' : 'recurring_paused', null, { seriesId });
  return data;
}

export async function updateRecurringSeries(
  seriesId: string,
  updates: Partial<RecurringAssignment>
): Promise<RecurringAssignment> {
  const { data, error } = await supabase
    .from('recurring_assignments')
    .update(updates)
    .eq('id', seriesId)
    .select()
    .single();

  if (error) throw error;
  await logActivity('recurring_series_updated', null, { title: data.title });
  return data;
}

export async function deleteRecurringSeries(
  seriesId: string,
  mode: 'series_only' | 'stop_future' | 'delete_all'
): Promise<void> {
  const todayStr = formatDateToIsoDate(new Date());

  if (mode === 'delete_all') {
    // Delete all linked assignments and the series
    await supabase.from('assignments').delete().eq('recurring_assignment_id', seriesId);
    await supabase.from('recurring_assignments').delete().eq('id', seriesId);
  } else if (mode === 'stop_future') {
    // Delete future uncompleted assignments and deactivate/remove series
    await supabase
      .from('assignments')
      .delete()
      .eq('recurring_assignment_id', seriesId)
      .eq('completed', false)
      .gte('due_date', todayStr);

    await supabase.from('recurring_assignments').delete().eq('id', seriesId);
  } else {
    // series_only: unlink assignments and remove series definition
    await supabase
      .from('assignments')
      .update({ recurring_assignment_id: null })
      .eq('recurring_assignment_id', seriesId);

    await supabase.from('recurring_assignments').delete().eq('id', seriesId);
  }

  await logActivity('recurring_series_deleted', null, { seriesId, mode });
}
