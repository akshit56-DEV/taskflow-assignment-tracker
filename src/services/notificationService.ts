import { supabase } from '@/lib/supabase';
import { AppNotification, AssignmentWithDetails } from '@/types';
import { getCalendarDaysDiff, getTodayDateString } from '@/utils/dateUtils';

export async function getNotifications(): Promise<AppNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_read', false);
}

export async function deleteNotification(id: string): Promise<void> {
  await supabase.from('notifications').delete().eq('id', id);
}

/**
 * Checks active assignments and creates in-app notifications and browser notifications if due/overdue
 */
export async function syncInAppNotifications(
  assignments: AssignmentWithDetails[],
  profileReminderSettings?: {
    days_before?: number[];
    browser_reminders?: boolean;
    in_app_reminders?: boolean;
  }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (profileReminderSettings?.in_app_reminders === false) return;

  const todayStr = getTodayDateString();
  const existingNotifications = await getNotifications();
  const todayNotifications = existingNotifications.filter(
    (n) => n.created_at.startsWith(todayStr)
  );

  const notificationsToInsert: {
    user_id: string;
    assignment_id: string;
    title: string;
    message: string;
    type: 'due_soon' | 'overdue' | 'erp_pending';
  }[] = [];

  for (const item of assignments) {
    if (item.is_deleted || item.is_archived) continue;

    const daysDiff = getCalendarDaysDiff(item.due_date);

    // 1. Overdue reminder
    if (!item.completed && daysDiff < 0) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && n.type === 'overdue'
      );
      if (!alreadyNotified) {
        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: 'Overdue Assignment',
          message: `"${item.title}" is overdue (${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago).`,
          type: 'overdue',
        });
      }
    }

    // 2. Due today or upcoming reminder (1 day or 3 days based on settings)
    const reminderDays = profileReminderSettings?.days_before || [3, 1, 0];
    if (!item.completed && reminderDays.includes(daysDiff)) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && n.type === 'due_soon'
      );
      if (!alreadyNotified) {
        let msg = `"${item.title}" is due today.`;
        if (daysDiff === 1) msg = `"${item.title}" is due tomorrow.`;
        else if (daysDiff > 1) msg = `"${item.title}" is due in ${daysDiff} days.`;

        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: daysDiff === 0 ? 'Due Today!' : 'Upcoming Deadline',
          message: msg,
          type: 'due_soon',
        });
      }
    }

    // 3. Completed but pending ERP upload
    if (item.completed && !item.uploaded_to_erp) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && n.type === 'erp_pending'
      );
      if (!alreadyNotified) {
        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: 'Pending ERP Upload',
          message: `"${item.title}" is completed but still needs ERP upload.`,
          type: 'erp_pending',
        });
      }
    }

    // 4. ERP Uploaded but awaiting professor check (if uploaded > 2 days ago)
    if (item.completed && item.uploaded_to_erp && !item.professor_checked && item.erp_upload_date) {
      const daysSinceUpload = getCalendarDaysDiff(todayStr, item.erp_upload_date.split('T')[0]);
      if (daysSinceUpload >= 2) {
        const alreadyNotified = todayNotifications.some(
          (n) => n.assignment_id === item.id && n.type === 'erp_pending'
        );
        if (!alreadyNotified) {
          notificationsToInsert.push({
            user_id: user.id,
            assignment_id: item.id,
            title: 'Awaiting Professor Check',
            message: `"${item.title}" is uploaded to ERP. Remember to get it verified by your professor.`,
            type: 'erp_pending',
          });
        }
      }
    }
  }

  if (notificationsToInsert.length > 0) {
    await supabase.from('notifications').insert(notificationsToInsert);

    // Trigger browser notification if supported and granted
    if (
      profileReminderSettings?.browser_reminders !== false &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const firstNote = notificationsToInsert[0];
      try {
        new Notification(`TaskFlow: ${firstNote.title}`, {
          body: firstNote.message,
          icon: '/logo.svg',
        });
      } catch (err) {
        console.warn('Browser notification trigger warning:', err);
      }
    }
  }
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}
