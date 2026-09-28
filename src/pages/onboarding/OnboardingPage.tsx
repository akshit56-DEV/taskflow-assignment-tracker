import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/authService';
import { getSubjects, createSubject } from '@/services/subjectService';
import { requestBrowserNotificationPermission } from '@/services/notificationService';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Bell,
  CheckCircle2,
  Plus,
  Loader2,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [subjectsList, setSubjectsList] = useState<string[]>([
    'CPLT',
    'FOA',
    'Physics',
    'Communication Skills',
    'Maths',
    'DDAL',
  ]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [reminder3Days, setReminder3Days] = useState(true);
  const [reminder1Day, setReminder1Day] = useState(true);
  const [reminderDueDay, setReminderDueDay] = useState(true);
  const [browserReminders, setBrowserReminders] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleAddSubject = () => {
    if (newSubjectInput.trim() && !subjectsList.includes(newSubjectInput.trim())) {
      setSubjectsList([...subjectsList, newSubjectInput.trim()]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (name: string) => {
    setSubjectsList(subjectsList.filter((s) => s !== name));
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (browserReminders) {
        await requestBrowserNotificationPermission();
      }

      const days = [];
      if (reminder3Days) days.push(3);
      if (reminder1Day) days.push(1);
      if (reminderDueDay) days.push(0);

      // 1. Update Profile
      await updateProfile(user.id, {
        full_name: fullName.trim() || 'Academic Student',
        onboarding_completed: true,
        reminder_settings: {
          days_before: days,
          email_reminders: false,
          in_app_reminders: true,
          browser_reminders: browserReminders,
        },
      });

      // 2. Ensure subjects exist in DB
      const existing = await getSubjects();
      const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

      for (let i = 0; i < subjectsList.length; i++) {
        const subName = subjectsList[i];
        if (!existingNames.has(subName.toLowerCase())) {
          await createSubject({
            name: subName,
            color: colors[i % colors.length],
          });
        }
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding complete error:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {currentStep} of 5</span>
            <span>
              {currentStep === 1 && 'Welcome'}
              {currentStep === 2 && 'Your Profile'}
              {currentStep === 3 && 'Academic Subjects'}
              {currentStep === 4 && 'Notifications'}
              {currentStep === 5 && 'All Set!'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome to TaskFlow
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                TaskFlow is your personal academic command center. Track tutorials, assignments, ERP
                uploads, and professor evaluations with zero friction.
              </p>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Name */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  What should we call you?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We'll use this to personalize your academic dashboard and greetings.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Parker"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Subjects */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  Your Academic Subjects
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We initialized default core subjects for your semester. Add, remove, or customize
                  any subject below.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {subjectsList.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{subject}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Subject */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another subject..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Reminder Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Reminder Preferences
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose when TaskFlow should alert you regarding upcoming deadlines and ERP uploads.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    3 Days Before Due Date
                  </span>
                  <input
                    type="checkbox"
                    checked={reminder3Days}
                    onChange={(e) => setReminder3Days(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    1 Day Before Due Date (Tomorrow)
                  </span>
                  <input
                    type="checkbox"
                    checked={reminder1Day}
                    onChange={(e) => setReminder1Day(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    On Due Date (Today)
                  </span>
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
                      Receive critical deadline notifications in your browser
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={browserReminders}
                    onChange={(e) => setBrowserReminders(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Finish */}
          {currentStep === 5 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                You're Ready to Roll!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Your workspace is configured with {subjectsList.length} subjects and automated
                deadline monitoring. Let's enter your dashboard and crush this semester.
              </p>
              <div className="pt-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinishOnboarding}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
