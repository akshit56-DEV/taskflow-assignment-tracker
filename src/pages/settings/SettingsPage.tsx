import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAssignments } from '@/context/AssignmentContext';
import { updateProfile } from '@/services/authService';
import { exportAssignmentsToCsv, exportAssignmentsToJson } from '@/services/exportService';
import { requestBrowserNotificationPermission } from '@/services/notificationService';
import {
  User,
  Bell,
  Sun,
  Moon,
  Laptop,
  Download,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { assignments, subjects } = useAssignments();

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Reminder Settings State
  const initialDays = profile?.reminder_settings?.days_before || [3, 1, 0];
  const [reminder3Days, setReminder3Days] = useState(initialDays.includes(3));
  const [reminder1Day, setReminder1Day] = useState(initialDays.includes(1));
  const [reminderDueDay, setReminderDueDay] = useState(initialDays.includes(0));
  const [browserReminders, setBrowserReminders] = useState(
    profile?.reminder_settings?.browser_reminders !== false
  );
  const [savingReminders, setSavingReminders] = useState(false);
  const [remindersSuccess, setRemindersSuccess] = useState(false);

  // Sync state when profile is loaded or updated
  React.useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  React.useEffect(() => {
    if (profile?.reminder_settings?.days_before) {
      const days = profile.reminder_settings.days_before;
      setReminder3Days(days.includes(3));
      setReminder1Day(days.includes(1));
      setReminderDueDay(days.includes(0));
    }
    if (profile?.reminder_settings?.browser_reminders !== undefined) {
      setBrowserReminders(profile.reminder_settings.browser_reminders);
    }
  }, [profile?.reminder_settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
      });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setProfileError((err as Error).message || 'Unable to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveReminders = async () => {
    if (!user) return;
    setSavingReminders(true);
    setRemindersSuccess(false);

    try {
      if (browserReminders) {
        await requestBrowserNotificationPermission();
      }

      const days: number[] = [];
      if (reminder3Days) days.push(3);
      if (reminder1Day) days.push(1);
      if (reminderDueDay) days.push(0);

      await updateProfile(user.id, {
        reminder_settings: {
          days_before: days,
          email_reminders: false,
          in_app_reminders: true,
          browser_reminders: browserReminders,
        },
      });

      await refreshProfile();
      setRemindersSuccess(true);
      setTimeout(() => setRemindersSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving reminder settings:', err);
    } finally {
      setSavingReminders(false);
    }
  };

  const handleExportCsv = () => {
    exportAssignmentsToCsv(assignments, subjects);
  };

  const handleExportJson = () => {
    exportAssignmentsToJson(assignments, subjects);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage profile information, notification alerts, visual appearance, and data exports
        </p>
      </div>

      {/* 1. Profile Section */}
      <section className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-brand-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Personal Profile
            </h2>
            <p className="text-xs text-slate-400">Your account identity</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Managed via Supabase Auth</p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm disabled:opacity-50"
          >
            {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Profile</span>
          </button>
        </form>
      </section>

      {/* 2. Notification Preferences Section */}
      <section className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Notification & Deadline Reminders
            </h2>
            <p className="text-xs text-slate-400">
              Configure alert timing for pending tutorials and submissions
            </p>
          </div>
        </div>

        {remindersSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reminder settings updated!</span>
          </div>
        )}

        <div className="space-y-3 max-w-lg">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                3 Days Before Due Date
              </span>
              <span className="text-[11px] text-slate-400">Early reminder to prepare solutions</span>
            </div>
            <input
              type="checkbox"
              checked={reminder3Days}
              onChange={(e) => setReminder3Days(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                1 Day Before Due Date (Tomorrow)
              </span>
              <span className="text-[11px] text-slate-400">Urgent deadline approaching</span>
            </div>
            <input
              type="checkbox"
              checked={reminder1Day}
              onChange={(e) => setReminder1Day(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Due Today Alert
              </span>
              <span className="text-[11px] text-slate-400">Critical reminder on due date</span>
            </div>
            <input
              type="checkbox"
              checked={reminderDueDay}
              onChange={(e) => setReminderDueDay(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-brand-900 dark:text-brand-300 block">
                Browser Desktop Notifications
              </span>
              <span className="text-[11px] text-brand-700/80 dark:text-brand-400">
                Show native desktop popups when deadlines arrive
              </span>
            </div>
            <input
              type="checkbox"
              checked={browserReminders}
              onChange={(e) => setBrowserReminders(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </label>

          <div className="pt-2">
            <button
              type="button"
              disabled={savingReminders}
              onClick={handleSaveReminders}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-50"
            >
              {savingReminders && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Reminder Preferences</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Appearance Section */}
      <section className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Laptop className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Appearance & Theme
            </h2>
            <p className="text-xs text-slate-400">Customize the visual mode of TaskFlow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 text-brand-400 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
              theme === 'system'
                ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Laptop className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-bold">System Default</span>
          </button>
        </div>
      </section>

      {/* 4. Data Export Section */}
      <section className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Data Backup & Export
            </h2>
            <p className="text-xs text-slate-400">Download your academic records and history</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Export Full JSON Backup (.json)</span>
          </button>
        </div>
      </section>

      {/* 5. Account & Session */}
      <section className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-950/60 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Account & Sign Out
        </h2>
        <p className="text-xs text-slate-500">
          Sign out of your TaskFlow account on this browser.
        </p>

        <div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>
    </div>
  );
};
