import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap, Target, Crosshair } from 'lucide-react';
import { addFocusXp, recordGamePlayed, playChime } from '@/utils/focusHubStorage';

interface ReactionSprintGameProps {
  onStatsUpdate?: () => void;
}

interface TargetData {
  id: number;
  x: number; // percentage (12 - 78%)
  y: number; // percentage (14 - 74%)
  size: number; // px (min 48px)
  lifespanMs: number;
}

export const ReactionSprintGame: React.FC<ReactionSprintGameProps> = ({ onStatsUpdate }) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [currentTarget, setCurrentTarget] = useState<TargetData | null>(null);
  const [reactions, setReactions] = useState<number[]>([]);

  // Persistent stats
  const [bestScore, setBestScore] = useState(0);
  const [fastestReactionMs, setFastestReactionMs] = useState(0);

  // Mutable refs to prevent closure staleness during high-speed game loop
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const scoreRef = useRef(0);
  const reactionsRef = useRef<number[]>([]);
  const targetIdRef = useRef(0);
  const targetSpawnTimestampRef = useRef<number>(0);
  const sessionEndTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<number | null>(null);
  const targetExpiryTimeoutRef = useRef<number | null>(null);

  // Load high scores
  useEffect(() => {
    try {
      const storedBestScore = parseInt(localStorage.getItem('taskflow_reaction_best_score') || '0', 10);
      const storedFastest = parseInt(localStorage.getItem('taskflow_reaction_fastest_ms') || '0', 10);
      setBestScore(storedBestScore);
      setFastestReactionMs(storedFastest);
    } catch {
      // safe fallback
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (targetExpiryTimeoutRef.current !== null) {
      clearTimeout(targetExpiryTimeoutRef.current);
      targetExpiryTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const finishGame = useCallback(() => {
    clearAllTimers();
    setCurrentTarget(null);
    setGameState('finished');
    playChime('complete');

    const finalScore = scoreRef.current;
    const allReactions = reactionsRef.current;
    const fastest = allReactions.length > 0 ? Math.min(...allReactions) : 0;
    const earnedXp = Math.max(15, Math.min(180, Math.round(finalScore / 15)));

    addFocusXp(earnedXp);
    recordGamePlayed('reaction', finalScore, fastest);

    try {
      const storedBest = parseInt(localStorage.getItem('taskflow_reaction_best_score') || '0', 10);
      if (finalScore > storedBest) {
        setBestScore(finalScore);
      }
      const storedFastest = parseInt(localStorage.getItem('taskflow_reaction_fastest_ms') || '0', 10);
      if (fastest > 0 && (storedFastest === 0 || fastest < storedFastest)) {
        setFastestReactionMs(fastest);
      }
    } catch {
      // safe fallback
    }

    if (onStatsUpdate) onStatsUpdate();
  }, [clearAllTimers, onStatsUpdate]);

  const spawnTarget = useCallback(() => {
    if (Date.now() >= sessionEndTimeRef.current) {
      finishGame();
      return;
    }

    if (targetExpiryTimeoutRef.current !== null) {
      clearTimeout(targetExpiryTimeoutRef.current);
      targetExpiryTimeoutRef.current = null;
    }

    targetIdRef.current += 1;
    const currentHitCount = hitsRef.current;

    // Difficulty scaling: target size decreases from 58px to 48px touch minimum
    const size = Math.max(48, 58 - Math.floor(currentHitCount / 4) * 2);

    // Lifespan shrinks gradually from 1400ms down to 650ms minimum
    const lifespanMs = Math.max(650, 1400 - Math.min(currentHitCount * 35, 750));

    // Bounded coordinates (12% to 78% X, 14% to 74% Y)
    const randomX = Math.floor(Math.random() * 66) + 12;
    const randomY = Math.floor(Math.random() * 60) + 14;

    const newTarget: TargetData = {
      id: targetIdRef.current,
      x: randomX,
      y: randomY,
      size,
      lifespanMs,
    };

    targetSpawnTimestampRef.current = Date.now();
    setCurrentTarget(newTarget);

    // Target expiration timer: if user doesn't click in time, counts as a miss
    targetExpiryTimeoutRef.current = window.setTimeout(() => {
      missesRef.current += 1;
      setMisses(missesRef.current);

      scoreRef.current = Math.max(0, scoreRef.current - 20);
      setScore(scoreRef.current);

      // Immediately spawn next target
      spawnTarget();
    }, lifespanMs);
  }, [finishGame]);

  const handleStartGame = () => {
    clearAllTimers();

    hitsRef.current = 0;
    missesRef.current = 0;
    scoreRef.current = 0;
    reactionsRef.current = [];
    targetIdRef.current = 0;

    setHits(0);
    setMisses(0);
    setScore(0);
    setReactions([]);
    setLastReactionMs(null);
    setTimeLeft(30);
    setGameState('running');

    // 30 seconds session
    sessionEndTimeRef.current = Date.now() + 30000;

    // Continuous exact countdown interval (updates every 100ms for smooth clock)
    countdownIntervalRef.current = window.setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((sessionEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remainingSeconds);

      if (Date.now() >= sessionEndTimeRef.current) {
        finishGame();
      }
    }, 100);

    // Immediately render the first target
    spawnTarget();
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState !== 'running' || !currentTarget) return;

    if (targetExpiryTimeoutRef.current !== null) {
      clearTimeout(targetExpiryTimeoutRef.current);
      targetExpiryTimeoutRef.current = null;
    }

    const latency = Date.now() - targetSpawnTimestampRef.current;
    playChime('tap');

    // Update stats
    reactionsRef.current.push(latency);
    setReactions([...reactionsRef.current]);
    setLastReactionMs(latency);

    hitsRef.current += 1;
    setHits(hitsRef.current);

    // Points calculation: Base 100 pts + speed bonus
    const speedBonus = Math.max(10, Math.round((currentTarget.lifespanMs - latency) / 4));
    scoreRef.current += 100 + speedBonus;
    setScore(scoreRef.current);

    // Immediately spawn next target
    spawnTarget();
  };

  const handleArenaMissClick = () => {
    if (gameState !== 'running') return;
    missesRef.current += 1;
    setMisses(missesRef.current);

    scoreRef.current = Math.max(0, scoreRef.current - 15);
    setScore(scoreRef.current);
  };

  const totalAttempts = hits + misses;
  const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
  const avgReaction =
    reactions.length > 0
      ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
      : 0;
  const fastestSession = reactions.length > 0 ? Math.min(...reactions) : 0;

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* 1. IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="space-y-4 py-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] flex items-center justify-center shadow-xs">
            <Target className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Reaction Sprint (30s)
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Sharpen your attention and processing reflexes. Tap each target immediately as it appears inside the arena.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs pt-1 text-[#5C6175] dark:text-slate-300">
            <span>
              Best Score: <strong className="text-[#0D9488] font-bold">{bestScore}</strong>
            </span>
            {fastestReactionMs > 0 && (
              <span>
                Fastest: <strong className="text-[#19A974] font-bold">{fastestReactionMs}ms</strong>
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start 30s Sprint</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. RUNNING GAME SCREEN */}
      {gameState === 'running' && (
        <div className="space-y-3">
          {/* Header Stats Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#E04F5F]">
              <Zap className="w-4 h-4" />
              <span>{timeLeft}s remaining</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#5C6175] dark:text-[#94A3B8]">
                Hits: <strong className="text-[#0D9488]">{hits}</strong>
              </span>
              <span className="text-[#5C6175] dark:text-[#94A3B8]">
                Misses: <strong className="text-rose-500">{misses}</strong>
              </span>
              <span className="font-bold text-[#171A2E] dark:text-white">
                Score: <strong className="text-[#5B4DF5]">{score}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Bounded Arena */}
          <div
            onClick={handleArenaMissClick}
            className="relative w-full h-[300px] sm:h-[340px] rounded-2xl bg-[#0F1424] border-2 border-teal-500/30 overflow-hidden cursor-crosshair select-none shadow-inner"
            title="Tap the targets as fast as you can!"
          >
            {/* Ambient Crosshair Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {/* Target element */}
            <AnimatePresence mode="popLayout">
              {currentTarget && (
                <motion.button
                  key={currentTarget.id}
                  type="button"
                  onClick={handleTargetClick}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.2, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    left: `${currentTarget.x}%`,
                    top: `${currentTarget.y}%`,
                    width: `${currentTarget.size}px`,
                    height: `${currentTarget.size}px`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] border-2 border-white text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                >
                  <Crosshair className="w-5 h-5 text-white animate-pulse" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Live latency badge */}
            {lastReactionMs !== null && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-[10px] font-mono text-teal-300 pointer-events-none border border-teal-500/20">
                {lastReactionMs}ms
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="text-[11px] text-[#9499AB]">
              Tap inside the target circle. Missing penalizes score.
            </span>
          </div>
        </div>
      )}

      {/* 3. FINISHED RESULT SCREEN */}
      {gameState === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 py-3 text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#D68A16] flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Sprint Complete!
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              Here is your reaction performance summary for this 30-second sprint.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-sm mx-auto text-left">
            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#9499AB] block">Score</span>
              <span className="text-base font-bold text-[#5B4DF5]">{score}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#9499AB] block">Accuracy</span>
              <span className="text-base font-bold text-[#0D9488]">{accuracy}%</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#9499AB] block">Fastest</span>
              <span className="text-base font-bold text-[#19A974]">
                {fastestSession > 0 ? `${fastestSession}ms` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#9499AB] block">Avg Reaction</span>
              <span className="text-base font-bold text-[#171A2E] dark:text-white">
                {avgReaction > 0 ? `${avgReaction}ms` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#9499AB] block">Hits / Misses</span>
              <span className="text-base font-bold text-[#171A2E] dark:text-white">
                {hits} / {misses}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50">
              <span className="text-[10px] uppercase font-bold text-[#0D9488] block">Focus XP</span>
              <span className="text-base font-bold text-[#0D9488]">
                +{Math.max(15, Math.min(180, Math.round(score / 15)))} XP
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
