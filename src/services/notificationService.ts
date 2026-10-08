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

    // 1. Overdue: "Assignment is overdue."
    if (!item.completed && daysDiff < 0) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && (n.type === 'overdue' || n.message.includes('overdue'))
      );
      if (!alreadyNotified) {
        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: 'Overdue Assignment',
          message: `${item.title}: Assignment is overdue.`,
          type: 'overdue',
        });
      }
    }

    // 2. Due date alerts: 7 days, 3 days, 24 hours (tomorrow), 6 hours (today)
    if (!item.completed && daysDiff >= 0) {
      if (daysDiff === 7) {
        const alreadyNotified = todayNotifications.some(
          (n) => n.assignment_id === item.id && n.message.includes('7 days')
        );
        if (!alreadyNotified) {
          notificationsToInsert.push({
            user_id: user.id,
            assignment_id: item.id,
            title: 'Due in 7 Days',
            message: `${item.title}: Assignment due in 7 days.`,
            type: 'due_soon',
          });
        }
      } else if (daysDiff === 3) {
        const alreadyNotified = todayNotifications.some(
          (n) => n.assignment_id === item.id && n.message.includes('3 days')
        );
        if (!alreadyNotified) {
          notificationsToInsert.push({
            user_id: user.id,
            assignment_id: item.id,
            title: 'Due in 3 Days',
            message: `${item.title}: Assignment due in 3 days.`,
            type: 'due_soon',
          });
        }
      } else if (daysDiff === 1) {
        const alreadyNotified = todayNotifications.some(
          (n) => n.assignment_id === item.id && n.message.includes('tomorrow')
        );
        if (!alreadyNotified) {
          notificationsToInsert.push({
            user_id: user.id,
            assignment_id: item.id,
            title: 'Due Tomorrow',
            message: `${item.title}: Assignment due tomorrow.`,
            type: 'due_soon',
          });
        }
      } else if (daysDiff === 0) {
        const alreadyNotified = todayNotifications.some(
          (n) => n.assignment_id === item.id && n.message.includes('due in 6 hours')
        );
        if (!alreadyNotified) {
          notificationsToInsert.push({
            user_id: user.id,
            assignment_id: item.id,
            title: 'Due Today',
            message: `${item.title}: Assignment due in 6 hours.`,
            type: 'due_soon',
          });
        }
      }
    }

    // 3. After completion: "Assignment completed — ERP upload remaining."
    if (item.completed && !item.uploaded_to_erp) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && n.type === 'erp_pending'
      );
      if (!alreadyNotified) {
        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: 'ERP Upload Remaining',
          message: `${item.title}: Assignment completed — ERP upload remaining.`,
          type: 'erp_pending',
        });
      }
    }

    // 4. After ERP upload: "ERP uploaded — waiting for professor verification."
    if (item.completed && item.uploaded_to_erp && !item.professor_checked) {
      const alreadyNotified = todayNotifications.some(
        (n) => n.assignment_id === item.id && n.message.includes('waiting for professor verification')
      );
      if (!alreadyNotified) {
        notificationsToInsert.push({
          user_id: user.id,
          assignment_id: item.id,
          title: 'Awaiting Faculty Verification',
          message: `${item.title}: ERP uploaded — waiting for professor verification.`,
          type: 'erp_pending',
        });
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
