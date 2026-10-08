import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  Flame,
  Zap,
  Check,
  Award,
  Coffee,
  Brain,
  Target,
  Layers,
  Bot,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAssignments } from '@/context/AssignmentContext';
import { SubjectBadge } from '@/components/common/SubjectBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { getAutomaticPriority } from '@/utils/workflowUtils';
import {
  getStoredFocusStats,
  recordPomodoroCompleted,
  playChime,
  FocusHubStats,
} from '@/utils/focusHubStorage';
import {
  getAllFlashcards,
  getFlashcardStats,
} from '@/utils/flashcardStorage';
import { FocusSprintGame } from '@/components/dashboard/focus/FocusSprintGame';
import { MemoryMatchGame } from '@/components/dashboard/focus/MemoryMatchGame';
import { ReactionSprintGame } from '@/components/dashboard/focus/ReactionSprintGame';
import { FlashcardSprintGame } from '@/components/dashboard/focus/FlashcardSprintGame';
import { FlashcardDeckModal } from '@/components/study/FlashcardDeckModal';
import { AIStudyAssistantModal } from '@/components/study/AIStudyAssistantModal';
import confetti from 'canvas-confetti';

type WorkspaceTab = 'session' | 'breaks' | 'tools';
type BreakGame = 'sprint' | 'memory' | 'reaction' | 'flashcard';
type TimerMode = 'focus' | 'break';
type PresetOption = '25-5' | '50-10' | 'custom';

export const FocusModePage: React.FC = () => {
  const navigate = useNavigate();
  const { assignments, toggleComplete } = useAssignments();

  // Active workspace tab
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('session');
  const [activeBreakGame, setActiveBreakGame] = useState<BreakGame>('reaction');

  // Active assignment selection from real user assignments
  const activeAssignments = assignments.filter((a) => !a.completed && !a.is_archived && !a.is_deleted);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    activeAssignments.length > 0 ? activeAssignments[0].id : ''
  );

  const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId) || activeAssignments[0];

  // Pomodoro state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [preset, setPreset] = useState<PresetOption>('25-5');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Focus Stats
  const [stats, setStats] = useState<FocusHubStats>(() => getStoredFocusStats());
  const [flashcardStats, setFlashcardStats] = useState(() => getFlashcardStats());

  // Study Tools Modals
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const currentTotalSeconds = (mode === 'focus' ? focusMinutes : breakMinutes) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTotalSeconds - timeLeft) / (currentTotalSeconds || 1)) * 100)
  );

  const refreshStats = () => {
    setStats(getStoredFocusStats());
    setFlashcardStats(getFlashcardStats());
  };

  // Preset switching
  const handlePresetChange = (newPreset: PresetOption) => {
    setPreset(newPreset);
    setIsRunning(false);
    if (newPreset === '25-5') {
      setFocusMinutes(25);
      setBreakMinutes(5);
      setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    } else if (newPreset === '50-10') {
      setFocusMinutes(50);
      setBreakMinutes(10);
      setTimeLeft(mode === 'focus' ? 50 * 60 : 10 * 60);
    }
  };

  const handleCustomChange = (focusM: number, breakM: number) => {
    const validFocus = Math.max(1, Math.min(120, focusM));
    const validBreak = Math.max(1, Math.min(60, breakM));
    setFocusMinutes(validFocus);
    setBreakMinutes(validBreak);
    setTimeLeft(mode === 'focus' ? validFocus * 60 : validBreak * 60);
  };

  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(currentTotalSeconds);
  }, [currentTotalSeconds]);

  const handleSkip = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode('focus');
      setTimeLeft(focusMinutes * 60);
    }
  }, [mode, breakMinutes, focusMinutes]);

  const handleCompleteSession = useCallback(() => {
    setIsRunning(false);
    playChime('complete');

    if (mode === 'focus') {
      recordPomodoroCompleted(focusMinutes);
      refreshStats();
      setShowCelebration(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5B4DF5', '#19A974', '#16B8D4'],
      });
      setTimeout(() => setShowCelebration(false), 4500);

      // Transition to break
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode('focus');
      setTimeLeft(focusMinutes * 60);
    }
  }, [mode, focusMinutes, breakMinutes]);

  // Timer Tick Interval
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, handleCompleteSession]);

  // Complete current assignment shortcut
  const handleMarkAssignmentCompleted = async () => {
    if (!currentAssignment) return;
    try {
      await toggleComplete(currentAssignment.id, true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#19A974', '#5B4DF5'],
      });
    } catch (err) {
      console.error('Failed to complete assignment:', err);
    }
  };

  // Keyboard Shortcuts: Space = pause/resume, R = reset, Esc = exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleStartPause, handleReset, navigate]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const allFlashcards = getAllFlashcards();

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0A0D1E] text-[#171A2E] dark:text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none transition-colors duration-200">
      {/* 1. Header Bar: Exit + Workspace Switcher + Live Streaks */}
      <header className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] hover:bg-[#F0F2F8] dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex-shrink-0"
            title="Exit Focus Mode (Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-[#5C6175]" />
            <span>Exit Focus</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#F5F7FB] dark:bg-slate-800 text-[10px] text-[#9499AB] border border-[#E6E9F2] dark:border-slate-700 ml-1">
              Esc
            </kbd>
          </button>

          {/* Today's Focus Badges */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D68A16] fill-[#D68A16]" />
              <span className="text-[11px] sm:text-xs">{stats.currentStreak}d Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs text-[#19A974]">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">+{stats.todayXp} XP</span>
            </div>
          </div>
        </div>

        {/* First-Class Focus Mode Tabs */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setWorkspaceTab('session')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              workspaceTab === 'session'
                ? 'bg-[#5B4DF5] text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus Session</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceTab('breaks')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              workspaceTab === 'breaks'
                ? 'bg-[#5B4DF5] text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Quick Breaks</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceTab('tools')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              workspaceTab === 'tools'
                ? 'bg-[#5B4DF5] text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Study Tools</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Body */}
      <main className="w-full max-w-2xl mx-auto my-auto py-4 sm:py-6 space-y-5 text-center">
        {/* Celebration Banner */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <Award className="w-4 h-4 text-[#19A974]" />
              <span>Session Completed! +100 Focus XP Earned. Great progress!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: FOCUS SESSION */}
        {workspaceTab === 'session' && (
          <div className="space-y-5">
            {/* Current Active Task Selector */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm text-left space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Focus Deliverable
                </span>

                {/* Quick assignment switcher */}
                {activeAssignments.length > 1 && (
                  <div className="relative">
                    <select
                      value={currentAssignment?.id || ''}
                      onChange={(e) => setSelectedAssignmentId(e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#E6E9F2] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800 text-[#171A2E] dark:text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
                    >
                      {activeAssignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {currentAssignment ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SubjectBadge subject={currentAssignment.subject} size="sm" />
                      <PriorityBadge priority={getAutomaticPriority(currentAssignment)} size="sm" />
                    </div>
                    <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#171A2E] dark:text-white leading-snug break-words">
                      {currentAssignment.title}
                    </h2>
                  </div>

                  {/* One-click mark completed shortcut */}
                  <button
                    type="button"
                    onClick={handleMarkAssignmentCompleted}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E8F8F1] hover:bg-[#d5f3e5] text-[#19A974] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 transition-colors cursor-pointer flex-shrink-0 self-start sm:self-auto"
                    title="Mark this assignment completed right now"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-[#9499AB] py-1">
                  No active assignments pending. Use this timer for general study or research!
                </div>
              )}
            </div>

            {/* Mode Toggle & Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('focus');
                    setIsRunning(false);
                    setTimeLeft(focusMinutes * 60);
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'focus'
                      ? 'bg-[#5B4DF5] text-white shadow-xs'
                      : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                  }`}
                >
                  Focus Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('break');
                    setIsRunning(false);
                    setTimeLeft(breakMinutes * 60);
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'break'
                      ? 'bg-[#19A974] text-white shadow-xs'
                      : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
                  }`}
                >
                  Break
                </button>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handlePresetChange('25-5')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    preset === '25-5' ? 'bg-[#EEECFF] dark:bg-[#5B4DF5]/30 text-[#5B4DF5] font-bold' : ''
                  }`}
                >
                  25 / 5
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('50-10')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    preset === '50-10' ? 'bg-[#EEECFF] dark:bg-[#5B4DF5]/30 text-[#5B4DF5] font-bold' : ''
                  }`}
                >
                  50 / 10
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    preset === 'custom' ? 'bg-[#EEECFF] dark:bg-[#5B4DF5]/30 text-[#5B4DF5] font-bold' : ''
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Custom Input Row */}
            {preset === 'custom' && (
              <div className="flex items-center justify-center gap-3 text-xs bg-white dark:bg-[#11142B] p-2 rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] max-w-xs mx-auto">
                <label className="flex items-center gap-1.5">
                  <span className="text-[#9499AB]">Focus:</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={focusMinutes}
                    onChange={(e) => handleCustomChange(parseInt(e.target.value) || 25, breakMinutes)}
                    className="w-12 px-1.5 py-0.5 text-center font-bold rounded-lg border border-[#E6E9F2] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800"
                  />
                  <span>m</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-[#9499AB]">Break:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakMinutes}
                    onChange={(e) => handleCustomChange(focusMinutes, parseInt(e.target.value) || 5)}
                    className="w-12 px-1.5 py-0.5 text-center font-bold rounded-lg border border-[#E6E9F2] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800"
                  />
                  <span>m</span>
                </label>
              </div>
            )}

            {/* Circular SVG Progress & Giant Timer */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="84"
                  className="stroke-[#E6E9F2] dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="84"
                  stroke={mode === 'focus' ? '#5B4DF5' : '#19A974'}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 84}
                  strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#9499AB]">
                  {mode === 'focus' ? `Session #${stats.pomodorosCompleted + 1}` : 'Break Interval'}
                </span>
                <span className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight tabular-nums text-[#171A2E] dark:text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs font-semibold text-[#5C6175] dark:text-[#94A3B8]">
                  {mode === 'focus' ? `${focusMinutes}m deep work` : `${breakMinutes}m break`}
                </span>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="Reset Timer (R)"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={handleStartPause}
                className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : mode === 'focus'
                    ? 'bg-[#5B4DF5] hover:bg-[#4A3CE0]'
                    : 'bg-[#19A974] hover:bg-[#158f62]'
                }`}
                title="Start / Pause (Space)"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span>{timeLeft === currentTotalSeconds ? 'Start Session' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="Skip Phase"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={handleCompleteSession}
                className="px-3 py-2 sm:px-3.5 sm:py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-[#19A974] font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                title="Finish Session Now"
              >
                <span>Finish</span>
              </button>
            </div>

            {/* Keyboard shortcuts hints */}
            <div className="text-[10px] sm:text-[11px] text-[#9499AB] flex items-center justify-center gap-3 pt-1">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E6E9F2] dark:border-slate-700 font-mono text-[9px] sm:text-[10px]">Space</kbd> Pause</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E6E9F2] dark:border-slate-700 font-mono text-[9px] sm:text-[10px]">R</kbd> Reset</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E6E9F2] dark:border-slate-700 font-mono text-[9px] sm:text-[10px]">Esc</kbd> Exit</span>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK BREAKS ARENA */}
        {workspaceTab === 'breaks' && (
          <div className="space-y-4 text-left">
            {/* Game Selector Sub-tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveBreakGame('reaction')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeBreakGame === 'reaction'
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Reaction Sprint</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBreakGame('sprint')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeBreakGame === 'sprint'
                    ? 'bg-[#19A974] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Focus Sprint</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBreakGame('memory')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeBreakGame === 'memory'
                    ? 'bg-[#5B4DF5] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Memory Match</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBreakGame('flashcard')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeBreakGame === 'flashcard'
                    ? 'bg-[#D68A16] text-white shadow-xs'
                    : 'text-[#5C6175] dark:text-[#94A3B8]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcard Sprint</span>
              </button>
            </div>

            {/* Game Canvas */}
            <div className="pt-2">
              {activeBreakGame === 'reaction' && (
                <ReactionSprintGame onStatsUpdate={refreshStats} />
              )}
              {activeBreakGame === 'sprint' && (
                <FocusSprintGame onStatsUpdate={refreshStats} />
              )}
              {activeBreakGame === 'memory' && (
                <MemoryMatchGame onStatsUpdate={refreshStats} />
              )}
              {activeBreakGame === 'flashcard' && (
                <FlashcardSprintGame
                  onStatsUpdate={refreshStats}
                  onNavigateToAssignments={() => navigate('/assignments')}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STUDY TOOLS SUITE */}
        {workspaceTab === 'tools' && (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tool 1: AI Assignment Solver */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#5B4DF5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                      AI Assignment Solver
                    </h3>
                    <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] leading-relaxed mt-1">
                      Upload any course problem set, PDF, or document to generate step-by-step solutions, theoretical explanations, and high-yield revision topics.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Study Assistant</span>
                </button>
              </div>

              {/* Tool 2: Flashcards Manager & Review */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F8F1] dark:bg-emerald-950/40 text-[#19A974] flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#19A974]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-extrabold text-[#171A2E] dark:text-white">
                      Academic Flashcards
                    </h3>
                    <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] leading-relaxed mt-1">
                      Interactive 3D flashcards generated from your uploaded materials with mastery tracking and rapid recall sprints.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="font-bold text-[#5B4DF5] dark:text-[#A49DFC]">
                      {flashcardStats.total} cards
                    </span>
                    <span>·</span>
                    <span className="text-[#19A974] font-medium">
                      {flashcardStats.mastered} mastered
                    </span>
                    <span>·</span>
                    <span className="text-[#D68A16] font-medium">
                      {flashcardStats.learning} learning
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={allFlashcards.length === 0}
                    onClick={() => setShowDeckModal(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#19A974] hover:bg-[#158f62] disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Review Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceTab('breaks');
                      setActiveBreakGame('flashcard');
                    }}
                    className="py-2.5 px-3 rounded-xl border border-[#E6E9F2] dark:border-slate-700 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 text-xs font-bold text-[#171A2E] dark:text-white transition-colors cursor-pointer"
                    title="Play 60s Flashcard Sprint"
                  >
                    Sprint ⚡
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Daily Focus Stats Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-3 sm:pt-4 border-t border-[#E6E9F2] dark:border-[#1E293B]">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B]">
            <span className="text-[9px] sm:text-[10px] text-[#9499AB] block uppercase font-bold">Focus</span>
            <span className="font-extrabold text-[#5B4DF5] dark:text-[#A49DFC] text-xs sm:text-sm">
              {stats.totalFocusMinutes}m
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B]">
            <span className="text-[9px] sm:text-[10px] text-[#9499AB] block uppercase font-bold">Sessions</span>
            <span className="font-extrabold text-[#171A2E] dark:text-white text-xs sm:text-sm">
              {stats.pomodorosCompleted}
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B]">
            <span className="text-[9px] sm:text-[10px] text-[#9499AB] block uppercase font-bold">Streak</span>
            <span className="font-extrabold text-[#D68A16] text-xs sm:text-sm">
              {stats.currentStreak}d
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B]">
            <span className="text-[9px] sm:text-[10px] text-[#9499AB] block uppercase font-bold">XP</span>
            <span className="font-extrabold text-[#19A974] text-xs sm:text-sm">
              +{stats.todayXp}
            </span>
          </div>
        </div>
      </footer>

      {/* Flashcard Deck Modal */}
      {showDeckModal && (
        <FlashcardDeckModal
          isOpen={showDeckModal}
          onClose={() => {
            setShowDeckModal(false);
            refreshStats();
          }}
          flashcards={allFlashcards}
          title="All Course Flashcards"
        />
      )}

      {/* AI Study Assistant Modal */}
      {showAiModal && currentAssignment && (
        <AIStudyAssistantModal
          isOpen={showAiModal}
          onClose={() => {
            setShowAiModal(false);
            refreshStats();
          }}
          assignmentId={currentAssignment.id}
          assignmentTitle={currentAssignment.title}
          subjectName={currentAssignment.subject?.name}
          description={currentAssignment.description || undefined}
          attachments={currentAssignment.attachments || []}
          initialTab="solutions"
        />
      )}
    </div>
  );
};
