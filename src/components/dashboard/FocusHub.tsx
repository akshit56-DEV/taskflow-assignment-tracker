import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Zap,
  Target,
  Flame,
  X,
  Maximize2,
  Brain,
  Layers,
} from 'lucide-react';
import { PomodoroTimer } from './focus/PomodoroTimer';
import { FocusSprintGame } from './focus/FocusSprintGame';
import { MemoryMatchGame } from './focus/MemoryMatchGame';
import { ReactionSprintGame } from './focus/ReactionSprintGame';
import { FlashcardSprintGame } from './focus/FlashcardSprintGame';
import { getStoredFocusStats, FocusHubStats } from '@/utils/focusHubStorage';

type FocusTab = 'pomodoro' | 'sprint' | 'memory' | 'reaction' | 'flashcard';

export const FocusHub: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FocusTab>('pomodoro');
  const [stats, setStats] = useState<FocusHubStats>(() => getStoredFocusStats());

  const refreshStats = () => {
    setStats(getStoredFocusStats());
  };

  useEffect(() => {
    refreshStats();
  }, [isOpen]);

  const tabs = [
    {
      id: 'pomodoro' as const,
      label: 'Pomodoro',
      icon: Clock,
      activeColor: 'text-[#5B4DF5] dark:text-[#A49DFC] border-[#5B4DF5] bg-white dark:bg-slate-800 shadow-xs',
      badge: `${stats.totalFocusMinutes}m focus`,
    },
    {
      id: 'sprint' as const,
      label: 'Focus Sprint',
      icon: Zap,
      activeColor: 'text-[#19A974] dark:text-emerald-300 border-[#19A974] bg-white dark:bg-slate-800 shadow-xs',
      badge: '40+ Scenarios',
    },
    {
      id: 'memory' as const,
      label: 'Memory Match',
      icon: Brain,
      activeColor: 'text-[#5B4DF5] dark:text-[#A49DFC] border-[#5B4DF5] bg-white dark:bg-slate-800 shadow-xs',
      badge: `${stats.memoryBestScore} pts`,
    },
    {
      id: 'reaction' as const,
      label: 'Reaction Sprint',
      icon: Target,
      activeColor: 'text-[#0D9488] dark:text-teal-300 border-[#0D9488] bg-white dark:bg-slate-800 shadow-xs',
      badge: stats.reactionFastestMs > 0 ? `${stats.reactionFastestMs}ms` : '30s test',
    },
    {
      id: 'flashcard' as const,
      label: 'Flashcards',
      icon: Layers,
      activeColor: 'text-[#D68A16] dark:text-amber-300 border-[#D68A16] bg-white dark:bg-slate-800 shadow-xs',
      badge: '60s recall',
    },
  ];

  // Calculate student level
  const userLevel = Math.max(1, Math.floor(stats.totalXp / 250) + 1);

  return (
    <>
      {/* 1. Compact Premium Dashboard Entry Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-sm space-y-4 relative overflow-hidden w-full min-w-0"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center flex-shrink-0">
              <Layers className="w-4.5 h-4.5 text-[#5B4DF5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC]">
                  Focus Hub
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] border border-emerald-200/60">
                  Level {userLevel}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-heading font-bold text-[#171A2E] dark:text-white leading-tight truncate">
                Pomodoro & Focus Sprints
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start xl:self-auto">
            <button
              type="button"
              onClick={() => navigate('/focus')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Launch distraction-free Focus Mode workspace"
            >
              <Maximize2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Focus Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E6E9F2] dark:border-[#1E293B] text-[#5C6175] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              title="Open Hub Activities & Break Games"
            >
              <span>Games</span>
            </button>
          </div>
        </div>

        {/* Small persistent stats strip */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-0.5 w-full min-w-0">
          <div className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/60 dark:border-slate-800 min-w-0">
            <span className="text-[9px] text-[#9499AB] block font-semibold uppercase truncate">Today XP</span>
            <span className="text-xs font-extrabold text-[#19A974] block truncate">
              +{stats.todayXp}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/60 dark:border-slate-800 min-w-0">
            <span className="text-[9px] text-[#9499AB] block font-semibold uppercase truncate">Focus</span>
            <span className="text-xs font-extrabold text-[#5B4DF5] dark:text-[#A49DFC] block truncate">
              {stats.totalFocusMinutes}m
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/60 dark:border-slate-800 min-w-0">
            <span className="text-[9px] text-[#9499AB] block font-semibold uppercase truncate">Sessions</span>
            <span className="text-xs font-extrabold text-[#171A2E] dark:text-white block truncate">
              {stats.pomodorosCompleted}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2]/60 dark:border-slate-800 min-w-0">
            <span className="text-[9px] text-[#9499AB] block font-semibold uppercase truncate">Streak</span>
            <span className="text-xs font-extrabold text-[#D68A16] flex items-center justify-center gap-0.5 truncate">
              <Flame className="w-3 h-3 fill-[#D68A16] flex-shrink-0" />
              <span>{stats.currentStreak}d</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Full Focus Hub Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#171A2E]/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-auto p-4 sm:p-6 space-y-4"
            >
              {/* Modal Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E9F2] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-[#5B4DF5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#171A2E] dark:text-white truncate">
                        Student Focus Hub
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#5B4DF5] dark:text-[#A49DFC] border border-[#5B4DF5]/20 flex-shrink-0">
                        {stats.totalXp} Total XP
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C6175] dark:text-[#94A3B8] truncate">
                      Deep focus timer and rapid cognitive prioritization challenges
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  {/* Direct Navigate to Full /focus Page */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/focus');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                    title="Launch dedicated distraction-free Focus Mode workspace"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Focus Mode</span>
                  </button>

                  {/* Close Modal */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 overflow-x-auto w-full min-w-0">
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 sm:flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                          isSelected
                            ? tab.activeColor
                            : 'border-transparent text-[#5C6175] dark:text-[#94A3B8] hover:text-[#171A2E] dark:hover:text-white'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

              {/* Active Tab Workspace */}
              <div className="pt-1">
                {activeTab === 'pomodoro' && (
                  <PomodoroTimer onStatsUpdate={refreshStats} />
                )}
                {activeTab === 'sprint' && (
                  <FocusSprintGame onStatsUpdate={refreshStats} />
                )}
                {activeTab === 'memory' && (
                  <MemoryMatchGame onStatsUpdate={refreshStats} />
                )}
                {activeTab === 'reaction' && (
                  <ReactionSprintGame onStatsUpdate={refreshStats} />
                )}
                {activeTab === 'flashcard' && (
                  <FlashcardSprintGame
                    onStatsUpdate={refreshStats}
                    onNavigateToAssignments={() => {
                      setIsOpen(false);
                      navigate('/assignments');
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
