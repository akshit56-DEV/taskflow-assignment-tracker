import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useAssignments } from '@/context/AssignmentContext';
import { updateProfile } from '@/services/authService';
import { getSubjects, createSubject, deleteSubject } from '@/services/subjectService';
import { requestBrowserNotificationPermission } from '@/services/notificationService';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Plus,
  Loader2,
  Atom,
  BookOpen,
  X,
  ShieldCheck,
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

const DEFAULT_SUBJECTS = [
  { name: 'Physics', icon: 'atom', color: '#5B4DF5' },
  { name: 'Maths', icon: 'sigma', color: '#196CFF' },
  { name: 'Computer Science', icon: 'code-2', color: '#16B8D4' },
  { name: 'Communication Skills', icon: 'book-open', color: '#19A974' },
];

const COLOR_CHOICES = [
  '#5B4DF5', // Indigo
  '#196CFF', // Blue
  '#16B8D4', // Cyan
  '#19A974', // Green
  '#D68A16', // Amber
  '#E04F5F', // Coral
];

export const OnboardingPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { refreshData } = useAssignments();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [subjectsList, setSubjectsList] = useState<Array<{ name: string; color: string; icon: string }>>(
    DEFAULT_SUBJECTS
  );
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [reminder3Days, setReminder3Days] = useState(true);
  const [reminder1Day, setReminder1Day] = useState(true);
  const [reminderDueDay, setReminderDueDay] = useState(true);
  const [browserReminders, setBrowserReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load existing database subjects if available
  useEffect(() => {
    let mounted = true;
    async function loadDbSubjects() {
      try {
        const existing = await getSubjects();
        if (mounted && existing && existing.length > 0) {
          setSubjectsList(
            existing.map((s, idx) => ({
              name: s.name,
              color: s.color || COLOR_CHOICES[idx % COLOR_CHOICES.length],
              icon: 'atom',
            }))
          );
        }
      } catch (err) {
        console.warn('Could not pre-fetch DB subjects for onboarding:', err);
      }
    }
    if (user) {
      loadDbSubjects();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (trimmed && !subjectsList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      const assignedColor = COLOR_CHOICES[subjectsList.length % COLOR_CHOICES.length];
      setSubjectsList([...subjectsList, { name: trimmed, color: assignedColor, icon: 'atom' }]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (name: string) => {
    setSubjectsList(subjectsList.filter((s) => s.name.toLowerCase() !== name.toLowerCase()));
  };

  const handleUpdateSubjectColor = (index: number, newColor: string) => {
    const updated = [...subjectsList];
    updated[index].color = newColor;
    setSubjectsList(updated);
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

      // 1. Update Profile to set full_name, reminder_settings, and onboarding_completed: true
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

      // 2. Reconcile database subjects with the user's customized subjectsList
      const existing = await getSubjects();
      const chosenLowerSet = new Set(subjectsList.map((s) => s.name.toLowerCase()));

      // (a) Delete any existing DB subject that was removed by user during onboarding
      for (const exSub of existing) {
        if (!chosenLowerSet.has(exSub.name.toLowerCase())) {
          try {
            await deleteSubject(exSub.id);
          } catch (delErr) {
            console.warn(`Could not delete removed onboarding subject ${exSub.name}:`, delErr);
          }
        }
      }

      // (b) Create any new subject selected by user that doesn't exist yet in DB
      const existingLowerMap = new Map(existing.map((s) => [s.name.toLowerCase(), s]));
      for (let i = 0; i < subjectsList.length; i++) {
        const sub = subjectsList[i];
        if (!existingLowerMap.has(sub.name.toLowerCase())) {
          await createSubject({
            name: sub.name,
            color: sub.color,
          });
        }
      }

      // 3. Refresh Profile and Global Assignment Context
      await refreshProfile();
      await refreshData();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding complete error:', err);
      await refreshProfile();
      await refreshData();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#07090e] text-tf-deep dark:text-slate-100 font-sans selection:bg-tf-indigo selection:text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-tf-indigo bg-[#EEECFF] dark:bg-tf-indigo/15 px-3 py-1 rounded-full uppercase tracking-wider">
            Academic Setup · Step {currentStep} of 5
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto my-auto py-4">
        {/* Progress Tracker Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-tf-muted dark:text-slate-400 mb-2 font-display">
            <span>Progress</span>
            <span className="text-tf-indigo">
              {currentStep === 1 && 'Welcome'}
              {currentStep === 2 && 'Your Profile'}
              {currentStep === 3 && 'Academic Subjects'}
              {currentStep === 4 && 'Smart Reminders'}
              {currentStep === 5 && 'All Set!'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-tf-border dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-brand-linear rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Card Surface */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-tf-border dark:border-slate-800 shadow-tf-modal relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-linear text-white flex items-center justify-center mx-auto shadow-md shadow-tf-indigo/25">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-tf-deep dark:text-white">
                    Make TaskFlow yours.
                  </h2>
                  <p className="text-sm text-tf-muted dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Set up your academic profile, customize your semester subjects, and organize your
                    deadlines in minutes.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-linear hover:opacity-95 active:scale-[0.99] shadow-md shadow-tf-indigo/25 transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
                  <h3 className="font-display font-extrabold text-2xl text-tf-deep dark:text-white">
                    What should we call you?
                  </h3>
                  <p className="text-xs text-tf-muted dark:text-slate-400 mt-1">
                    We will personalize your morning command center greeting with this name.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-tf-deep dark:text-slate-200 uppercase tracking-wider">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akshit Poddar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-tf-border dark:border-slate-800 bg-tf-bg dark:bg-slate-900 text-tf-deep dark:text-white placeholder:text-tf-subtle focus:outline-none focus:ring-2 focus:ring-tf-indigo/30 focus:border-tf-indigo shadow-sm transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-tf-border dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-bold text-tf-muted hover:text-tf-deep dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!fullName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-brand-linear hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-tf-indigo/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Academic Subjects (Figma Subject Customizer) */}
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
                  <h3 className="font-display font-extrabold text-2xl text-tf-deep dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-tf-indigo" />
                    Configure Your Subjects
                  </h3>
                  <p className="text-xs text-tf-muted dark:text-slate-400 mt-1">
                    Start with these suggestions, then rename, remove, or add anything. Your subjects
                    are fully customizable.
                  </p>
                </div>

                {/* Subject List Deck */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {subjectsList.map((subject, idx) => (
                    <div
                      key={subject.name}
                      className="p-3.5 rounded-xl bg-tf-bg dark:bg-slate-800/60 border border-tf-border dark:border-slate-700/60 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: subject.color }}
                        >
                          <Atom className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-tf-deep dark:text-white truncate">
                          {subject.name}
                        </span>
                      </div>

                      {/* Color Palette Selector */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {COLOR_CHOICES.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => handleUpdateSubjectColor(idx, col)}
                              className={`w-4 h-4 rounded-full transition-transform ${
                                subject.color === col
                                  ? 'ring-2 ring-tf-indigo scale-110'
                                  : 'hover:scale-105 opacity-80 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: col }}
                              title={col}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject.name)}
                          className="p-1 rounded-lg text-tf-subtle hover:text-tf-danger hover:bg-tf-border/50 dark:hover:bg-slate-700 transition-colors ml-1"
                          title="Remove Subject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Subject Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add another subject (e.g. Data Structures)..."
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-tf-border dark:border-slate-800 bg-tf-bg dark:bg-slate-900 text-tf-deep dark:text-white placeholder:text-tf-subtle focus:outline-none focus:ring-2 focus:ring-tf-indigo/30 focus:border-tf-indigo shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2.5 bg-tf-deep dark:bg-white text-white dark:text-tf-deep rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-tf-border dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-bold text-tf-muted hover:text-tf-deep dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    disabled={subjectsList.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-brand-linear hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-tf-indigo/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Notifications */}
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
                  <h3 className="font-display font-extrabold text-2xl text-tf-deep dark:text-white flex items-center gap-2">
                    <Bell className="w-6 h-6 text-tf-indigo" />
                    Deadline Intelligence
                  </h3>
                  <p className="text-xs text-tf-muted dark:text-slate-400 mt-1">
                    Configure smart notification triggers so you never miss a submission window or
                    ERP upload.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-tf-bg dark:bg-slate-800/60 border border-tf-border dark:border-slate-700/60 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-tf-deep dark:text-white">
                        3 Days Before Deadline
                      </div>
                      <div className="text-[11px] text-tf-muted dark:text-slate-400">
                        Early reminder to begin drafting solutions and lab reports.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reminder3Days}
                      onChange={(e) => setReminder3Days(e.target.checked)}
                      className="w-4 h-4 rounded text-tf-indigo accent-tf-indigo"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-tf-bg dark:bg-slate-800/60 border border-tf-border dark:border-slate-700/60 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-tf-deep dark:text-white">
                        1 Day Before Deadline
                      </div>
                      <div className="text-[11px] text-tf-muted dark:text-slate-400">
                        High urgency reminder to finalize and prepare submissions.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reminder1Day}
                      onChange={(e) => setReminder1Day(e.target.checked)}
                      className="w-4 h-4 rounded text-tf-indigo accent-tf-indigo"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-tf-bg dark:bg-slate-800/60 border border-tf-border dark:border-slate-700/60 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-tf-deep dark:text-white">
                        Due Day Morning Alert
                      </div>
                      <div className="text-[11px] text-tf-muted dark:text-slate-400">
                        Morning brief on tasks that must be uploaded or checked today.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reminderDueDay}
                      onChange={(e) => setReminderDueDay(e.target.checked)}
                      className="w-4 h-4 rounded text-tf-indigo accent-tf-indigo"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-tf-bg dark:bg-slate-800/60 border border-tf-border dark:border-slate-700/60 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-tf-deep dark:text-white">
                        Browser Push Notifications
                      </div>
                      <div className="text-[11px] text-tf-muted dark:text-slate-400">
                        Allow system desktop and lock screen notifications.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={browserReminders}
                      onChange={(e) => setBrowserReminders(e.target.checked)}
                      className="w-4 h-4 rounded text-tf-indigo accent-tf-indigo"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-tf-border dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-xs font-bold text-tf-muted hover:text-tf-deep dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-brand-linear hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-tf-indigo/25 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: All Set */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-tf-success/15 text-tf-success flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-tf-deep dark:text-white">
                    You're all set, {fullName.split(' ')[0]}!
                  </h3>
                  <p className="text-xs sm:text-sm text-tf-muted dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Your semester subjects, smart notifications, and 5-stage workflow pipeline have
                    been configured.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleFinishOnboarding}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-linear hover:opacity-95 active:scale-[0.99] shadow-md shadow-tf-indigo/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Enter Academic Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Note at bottom */}
      <footer className="max-w-2xl w-full mx-auto pt-4 flex items-center justify-center gap-2 text-xs text-tf-subtle">
        <ShieldCheck className="w-4 h-4 text-tf-success flex-shrink-0" />
        <span>Your academic subjects and assignments are securely stored with RLS protection.</span>
      </footer>
    </div>
  );
};
