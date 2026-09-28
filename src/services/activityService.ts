import { supabase } from '@/lib/supabase';
import { ActivityLog } from '@/types';

export async function logActivity(
  action: string,
  assignmentId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert([
      {
        user_id: user.id,
        assignment_id: assignmentId || null,
        action,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (details as any) || null,
      },
    ]);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }

  return data || [];
}
