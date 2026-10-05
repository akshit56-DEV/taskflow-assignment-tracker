import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAssignments } from '@/context/AssignmentContext';
import { updateProfile } from '@/services/authService';
import { exportAssignmentsToCsv, exportAssignmentsToJson } from '@/services/exportService';
import { requestBrowserNotificationPermission } from '@/services/notificationService';
import {
  Sun,
  Moon,
  Laptop,
  LogOut,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { assignments, subjects } = useAssignments();

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Preference fields
  const [reducedMotion, setReducedMotion] = useState(false);
  const [weekStartMonday, setWeekStartMonday] = useState(true);
  const [defaultView, setDefaultView] = useState<'cards' | 'kanban'>('cards');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Reminder Settings State
  const initialDays = profile?.reminder_settings?.days_before || [1];
  const [deadlineReminders, setDeadlineReminders] = useState(initialDays.includes(1) || initialDays.includes(0));
  const [erpReminders, setErpReminders] = useState(true);
  const [browserReminders, setBrowserReminders] = useState(
    profile?.reminder_settings?.browser_reminders !== false
  );
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPreferences(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      if (browserReminders) {
        await requestBrowserNotificationPermission();
      }

      await updateProfile(user.id, {
        full_name: fullName.trim(),
        reminder_settings: {
          days_before: deadlineReminders ? [1, 0] : [],
          email_reminders: false,
          in_app_reminders: true,
          browser_reminders: browserReminders,
        },
      });

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error saving settings:', err);
      setSaveError((err as Error).message || 'Unable to save preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  const completedCount = assignments.filter((a) => a.completed).length;
  const checkedCount = assignments.filter((a) => a.professor_checked).length;
  const userInitials = (fullName || user?.email || 'AP')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl space-y-6"
    >
      {/* Page Header (Figma #3:73924: Settings / Make TaskFlow work your way.) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18223F] dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
            Make TaskFlow work your way.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleSaveAll}
          disabled={savingPreferences}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4355ED] hover:bg-[#3646D7] text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          {savingPreferences && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Save preferences</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-[#E9F6F0] dark:bg-[#188A68]/20 border border-[#188A68]/30 rounded-xl text-xs text-[#188A68] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#188A68]" />
            <span>Preferences saved successfully!</span>
          </motion.div>
        )}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-[#FDEEF1] dark:bg-[#D34D61]/20 border border-[#D34D61]/30 rounded-xl text-xs text-[#D34D61] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-[#D34D61]" />
            <span>{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Profile / Account Info Banner (Figma #3:73863 & #3:73924) */}
        <motion.section
          variants={sectionVariants}
          className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E9F3] dark:border-[#1E293B]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] dark:text-[#7970D9] flex items-center justify-center font-bold text-lg border border-[#4355ED]/20">
                {userInitials}
              </div>
              <div>
                <h2 className="text-base font-bold text-[#18223F] dark:text-white">
                  {fullName || 'Student'}
                </h2>
                <p className="text-xs text-[#66718C] dark:text-[#94A3B8]">
                  {user?.email} · Student · Semester 03
                </p>
              </div>
            </div>

            <div className="text-xs text-[#66718C] dark:text-[#94A3B8] sm:text-right">
              <p>Academic year: 2026–27</p>
              <p>Current semester: Semester 03</p>
            </div>
          </div>

          {/* Semester at a glance line (Figma) */}
          <div className="p-3.5 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020]/60 border border-[#E5E9F3] dark:border-[#1E293B] flex flex-wrap items-center justify-around gap-2 text-xs font-semibold text-[#18223F] dark:text-white">
            <span>{subjects.length} Subjects</span>
            <span className="text-[#939CB1]">·</span>
            <span>{assignments.length} Assignments</span>
            <span className="text-[#939CB1]">·</span>
            <span className="text-[#188A68]">{completedCount} Completed</span>
            <span className="text-[#939CB1]">·</span>
            <span className="text-[#4355ED]">{checkedCount} Professor checked</span>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-4 max-w-md pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#18223F] dark:text-white uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC] dark:bg-[#0B1020] text-[#18223F] dark:text-white focus:ring-2 focus:ring-[#4355ED]/30 focus:border-[#4355ED] focus:outline-none transition-all"
              />
            </div>
          </form>
        </motion.section>

        {/* 2. Appearance & Preferences (Figma #3:73924) */}
        <motion.section
          variants={sectionVariants}
          className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-5"
        >
          <div>
            <h3 className="text-base font-bold text-[#18223F] dark:text-white">
              Appearance & preferences
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-0.5">
              Customize visual theme and workspace preferences
            </p>
          </div>

          {/* Workspace theme (Light / Dark / System) */}
          <div>
            <label className="block text-xs font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
              Workspace theme
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const isSelected = theme === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as typeof theme)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4355ED] bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] dark:text-[#7970D9] shadow-xs'
                        : 'border-[#E5E9F3] dark:border-[#1E293B] text-[#66718C] dark:text-[#94A3B8] hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preference Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Calendar start day
              </label>
              <select
                value={weekStartMonday ? 'monday' : 'sunday'}
                onChange={(e) => setWeekStartMonday(e.target.value === 'monday')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white"
              >
                <option value="monday">Week starts on Monday ⌄</option>
                <option value="sunday">Week starts on Sunday ⌄</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Default assignments view
              </label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value as 'cards' | 'kanban')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white"
              >
                <option value="cards">Default view: Cards ⌄</option>
                <option value="kanban">Default view: Kanban ⌄</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#66718C] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="max-w-sm w-full px-3 py-2 text-xs rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white"
            >
              <option value="Asia/Kolkata">Timezone: Asia/Kolkata ⌄</option>
              <option value="UTC">Timezone: UTC ⌄</option>
              <option value="America/New_York">Timezone: America/New_York ⌄</option>
            </select>
            <p className="text-[11px] text-[#66718C] dark:text-[#94A3B8] mt-1">
              Due time defaults to 11:59 PM in your local timezone.
            </p>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/50 dark:bg-[#0B1020]/40 cursor-pointer max-w-lg">
            <div>
              <span className="text-xs font-semibold text-[#18223F] dark:text-white block">
                Reduced motion
              </span>
              <span className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                Minimize animations across transitions and interactive cards.
              </span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 text-[#4355ED] rounded focus:ring-[#4355ED]"
            />
          </label>
        </motion.section>

        {/* 3. Notifications & Account (Figma #3:73924) */}
        <motion.section
          variants={sectionVariants}
          className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-4"
        >
          <div>
            <h3 className="text-base font-bold text-[#18223F] dark:text-white">
              Notifications & account
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-0.5">
              Control deadlines and review reminder frequency
            </p>
          </div>

          <div className="space-y-3 max-w-lg">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/50 dark:bg-[#0B1020]/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#18223F] dark:text-white block">
                  Deadline reminders
                </span>
                <span className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                  One day before an assignment is due.
                </span>
              </div>
              <input
                type="checkbox"
                checked={deadlineReminders}
                onChange={(e) => setDeadlineReminders(e.target.checked)}
                className="w-4 h-4 text-[#4355ED] rounded focus:ring-[#4355ED]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/50 dark:bg-[#0B1020]/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#18223F] dark:text-white block">
                  ERP upload reminders
                </span>
                <span className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                  Remember to submit completed work.
                </span>
              </div>
              <input
                type="checkbox"
                checked={erpReminders}
                onChange={(e) => setErpReminders(e.target.checked)}
                className="w-4 h-4 text-[#4355ED] rounded focus:ring-[#4355ED]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] bg-[#F5F7FC]/50 dark:bg-[#0B1020]/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#18223F] dark:text-white block">
                  Browser push reminders
                </span>
                <span className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                  Receive notification alerts when deadlines approach.
                </span>
              </div>
              <input
                type="checkbox"
                checked={browserReminders}
                onChange={(e) => setBrowserReminders(e.target.checked)}
                className="w-4 h-4 text-[#4355ED] rounded focus:ring-[#4355ED]"
              />
            </label>
          </div>
        </motion.section>

        {/* 4. Data Export & Danger Zone */}
        <motion.section
          variants={sectionVariants}
          className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-4"
        >
          <div>
            <h3 className="text-base font-bold text-[#18223F] dark:text-white">
              Data export & account
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-0.5">
              Export academic deliverables or sign out of your device
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => exportAssignmentsToCsv(assignments, subjects)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] text-[#18223F] dark:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#188A68]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportAssignmentsToJson(assignments, subjects)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E9F3] dark:border-[#1E293B] text-[#18223F] dark:text-white hover:bg-[#F5F7FC] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#4355ED]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-[#D34D61] bg-[#FDEEF1] dark:bg-[#D34D61]/10 hover:bg-[#FDEEF1]/80 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
};
