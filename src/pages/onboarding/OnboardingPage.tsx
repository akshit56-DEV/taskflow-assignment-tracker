import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

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
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {currentStep} of 5</span>
            <span className="text-brand-600 dark:text-brand-400 font-bold">
              {currentStep === 1 && 'Welcome'}
              {currentStep === 2 && 'Your Profile'}
              {currentStep === 3 && 'Academic Subjects'}
              {currentStep === 4 && 'Notifications'}
              {currentStep === 5 && 'All Set!'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 border border-white/20">
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
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Name */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
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
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Subjects */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
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
                    <motion.span
                      key={subject}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <span>{subject}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </motion.span>
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
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Reminder Settings */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
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
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      3 Days Before Due Date
                    </span>
                    <input
                      type="checkbox"
                      checked={reminder3Days}
                      onChange={(e) => setReminder3Days(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      1 Day Before Due Date (Tomorrow)
                    </span>
                    <input
                      type="checkbox"
                      checked={reminder1Day}
                      onChange={(e) => setReminder1Day(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      On Due Date (Today)
                    </span>
                    <input
                      type="checkbox"
                      checked={reminderDueDay}
                      onChange={(e) => setReminderDueDay(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/40 dark:bg-brand-950/20 cursor-pointer hover:bg-brand-50/70 transition-colors">
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
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Finish */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-4"
              >
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
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={loading}
                    onClick={handleFinishOnboarding}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
