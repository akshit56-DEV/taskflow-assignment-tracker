import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Award,
  Clock,
  Coffee,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { recordPomodoroCompleted, playChime } from '@/utils/focusHubStorage';

interface PomodoroTimerProps {
  isFocusMode?: boolean;
  onStatsUpdate?: () => void;
}

type Mode = 'focus' | 'break';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isFocusMode = false,
  onStatsUpdate,
}) => {
  // Presets
  const [preset, setPreset] = useState<'25-5' | '50-10' | 'custom'>('25-5');
  const [customFocus, setCustomFocus] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const getPresetDuration = (mode: Mode): number => {
    if (preset === '25-5') return mode === 'focus' ? 25 * 60 : 5 * 60;
    if (preset === '50-10') return mode === 'focus' ? 50 * 60 : 10 * 60;
    return mode === 'focus' ? customFocus * 60 : customBreak * 60;
  };

  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(() => 25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);

  // Persistent stats
  const [sessionsToday, setSessionsToday] = useState(0);
  const [minutesToday, setMinutesToday] = useState(0);
  const [streak, setStreak] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Read stored stats
  const refreshStats = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = localStorage.getItem('taskflow_pomodoro_last_date') || '';
      const storedSessions = parseInt(localStorage.getItem('taskflow_pomodoro_sessions') || '0', 10);
      const storedMinutes = parseInt(localStorage.getItem('taskflow_pomodoro_minutes') || '0', 10);
      const storedStreak = parseInt(localStorage.getItem('taskflow_pomodoro_streak') || '0', 10);

      if (lastDate === today) {
        setSessionsToday(storedSessions);
        setMinutesToday(storedMinutes);
      } else {
        setSessionsToday(0);
        setMinutesToday(0);
      }
      setStreak(storedStreak);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Update timer duration when preset changes if not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getPresetDuration(mode));
    }
  }, [preset, customFocus, customBreak, mode]);

  // Main ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, preset, customFocus]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playChime('complete');

    if (mode === 'focus') {
      const focusMinutes = preset === '25-5' ? 25 : preset === '50-10' ? 50 : customFocus;
      const res = recordPomodoroCompleted(focusMinutes);
      setSessionsToday(res.sessions);
      setMinutesToday(res.totalMinutes);
      setStreak(res.streak);
      setShowCelebration(true);
      setCurrentSessionNumber((prev) => prev + 1);

      if (onStatsUpdate) onStatsUpdate();

      // Switch to break after user acknowledges celebration or auto switch
      setTimeout(() => {
        setMode('break');
        setTimeLeft(getPresetDuration('break'));
        setShowCelebration(false);
      }, 4000);
    } else {
      // Break completed, switch back to focus
      setMode('focus');
      setTimeLeft(getPresetDuration('focus'));
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getPresetDuration(mode));
  };

  const handleSkip = () => {
    setIsActive(false);
    const nextMode: Mode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setTimeLeft(getPresetDuration(nextMode));
  };

  // Circular calculations
  const totalDuration = getPresetDuration(mode);
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const modeTheme =
    mode === 'focus'
      ? {
          stroke: '#5B4DF5',
          bg: 'bg-[#EEECFF] text-[#5B4DF5] dark:bg-[#5B4DF5]/20 dark:text-[#A49DFC]',
          text: 'text-[#5B4DF5] dark:text-[#A49DFC]',
          badge: 'Focus Block',
          icon: Clock,
        }
      : {
          stroke: '#19A974',
          bg: 'bg-emerald-50 text-[#19A974] dark:bg-emerald-950/40 dark:text-emerald-300',
          text: 'text-[#19A974]',
          badge: 'Rest & Recharge',
          icon: Coffee,
        };

  const ModeIcon = modeTheme.icon;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-md mx-auto">
      {/* Presets Bar (hidden in Focus Mode to minimize distractions) */}
      {!isFocusMode && (
        <div className="flex items-center justify-between gap-1.5 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setPreset('25-5');
              setIsActive(false);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              preset === '25-5'
                ? 'bg-white dark:bg-slate-800 text-[#171A2E] dark:text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            25m / 5m
          </button>
          <button
            type="button"
            onClick={() => {
              setPreset('50-10');
              setIsActive(false);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              preset === '50-10'
                ? 'bg-white dark:bg-slate-800 text-[#171A2E] dark:text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            50m / 10m
          </button>
          <button
            type="button"
            onClick={() => {
              setPreset('custom');
              setShowCustomModal(true);
              setIsActive(false);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              preset === 'custom'
                ? 'bg-white dark:bg-slate-800 text-[#171A2E] dark:text-white shadow-xs'
                : 'text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E]'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>
      )}

      {/* Main Circular Clock Display */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        <svg className="w-56 h-56 sm:w-64 sm:h-64 -rotate-90" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-[#E6E9F2] dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Progress */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke={modeTheme.stroke}
            strokeWidth="9"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${modeTheme.bg}`}
          >
            <ModeIcon className="w-3 h-3" />
            <span>{modeTheme.badge}</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-extrabold text-[#171A2E] dark:text-white tracking-tight">
            {formattedTime}
          </div>

          <span className="text-xs font-semibold text-[#9499AB] mt-1">
            Session #{currentSessionNumber}
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          title="Reset Session"
          className="p-3 rounded-xl border border-[#E6E9F2] dark:border-slate-800 text-[#5C6175] dark:text-slate-300 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleStartPause}
          className={`px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
            isActive
              ? 'bg-[#E04F5F] hover:bg-[#C93B4B]'
              : mode === 'focus'
              ? 'bg-[#5B4DF5] hover:bg-[#4B3CE0]'
              : 'bg-[#19A974] hover:bg-[#158F62]'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{timeLeft < totalDuration ? 'Resume' : 'Start Focus'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          title="Skip to Next"
          className="p-3 rounded-xl border border-[#E6E9F2] dark:border-slate-800 text-[#5C6175] dark:text-slate-300 hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#19A974] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#19A974]">
              Focus Session Completed!
            </h4>
            <p className="text-xs text-[#5C6175] dark:text-slate-300">
              Earned <span className="font-extrabold text-[#19A974]">+100 Focus XP</span>. Enjoy a well-deserved break!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary Strip (hidden in Focus Mode) */}
      {!isFocusMode && (
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/70 dark:border-slate-800">
            <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Sessions</span>
            <span className="text-sm font-extrabold text-[#171A2E] dark:text-white flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#5B4DF5]" />
              {sessionsToday}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/70 dark:border-slate-800">
            <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Focus Time</span>
            <span className="text-sm font-extrabold text-[#5B4DF5] dark:text-[#A49DFC]">
              {minutesToday}m
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/70 dark:border-slate-800">
            <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Streak</span>
            <span className="text-sm font-extrabold text-[#D68A16] flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#D68A16]" />
              {streak}d
            </span>
          </div>
        </div>
      )}

      {/* Custom Duration Settings Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171A2E]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-slate-800 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-[#171A2E] dark:text-white">
              Custom Pomodoro Times
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#5C6175] dark:text-slate-300 block mb-1 font-medium">
                  Focus Minutes: <span className="font-bold text-[#5B4DF5]">{customFocus}m</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(parseInt(e.target.value, 10))}
                  className="w-full accent-[#5B4DF5]"
                />
              </div>

              <div>
                <label className="text-[#5C6175] dark:text-slate-300 block mb-1 font-medium">
                  Break Minutes: <span className="font-bold text-[#19A974]">{customBreak}m</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(parseInt(e.target.value, 10))}
                  className="w-full accent-[#19A974]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-[#5B4DF5] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
