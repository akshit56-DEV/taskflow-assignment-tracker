import { DeadlineUrgency } from '@/types';

/**
 * Formats a Date object to YYYY-MM-DD local calendar date string
 */
export function formatDateToIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in local calendar YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return formatDateToIsoDate(new Date());
}

/**
 * Parses YYYY-MM-DD string into a local Date at 00:00:00 local time
 * (avoids UTC boundary shifts)
 */
export function parseIsoDateToLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Calculates calendar day difference between target date and base date
 * Returns positive if target is in the future, 0 if same day, negative if in the past
 */
export function getCalendarDaysDiff(targetDateStr: string, baseDateStr: string = getTodayDateString()): number {
  const target = parseIsoDateToLocalDate(targetDateStr);
  const base = parseIsoDateToLocalDate(baseDateStr);

  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const baseUtc = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((targetUtc - baseUtc) / msPerDay);
}

/**
 * Calculates deadline urgency based on calendar date difference
 */
export function getDeadlineUrgency(dueDateStr: string, completed: boolean = false): DeadlineUrgency {
  if (completed) {
    return 'Normal';
  }

  const diff = getCalendarDaysDiff(dueDateStr);

  if (diff < 0) {
    return 'Overdue';
  }
  if (diff === 0) {
    return 'Critical'; // Due today
  }
  if (diff === 1) {
    return 'Urgent'; // 1 day
  }
  if (diff >= 2 && diff <= 3) {
    return 'Important'; // 2-3 days
  }
  if (diff >= 4 && diff <= 7) {
    return 'Approaching'; // 4-7 days
  }
  return 'Normal'; // > 7 days
}

/**
 * Formats a YYYY-MM-DD date into friendly human readable format (e.g. '28 Sep 2026')
 */
export function formatFriendlyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = parseIsoDateToLocalDate(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a timestamp into friendly date and time (e.g. '28 Sep 2026, 04:30 PM')
 */
export function formatFriendlyDateTime(timestampStr: string | null | undefined): string {
  if (!timestampStr) return '';
  const date = new Date(timestampStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns greeting based on local time
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
