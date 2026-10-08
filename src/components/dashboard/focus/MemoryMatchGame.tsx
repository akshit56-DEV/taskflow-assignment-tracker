import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { addFocusXp, recordGamePlayed, playChime } from '@/utils/focusHubStorage';

interface MemoryMatchGameProps {
  onStatsUpdate?: () => void;
}

interface CardItem {
  id: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SYMBOLS = ['📚', '💻', '📝', '🎯', '📅', '⚡', '🎓', '☕', '🔬', '📊'];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onStatsUpdate }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'won' | 'lost'>('idle');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(0);

  // Local best
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const storedBestScore = parseInt(localStorage.getItem('taskflow_memory_best_score') || '0', 10);
      const storedBestTime = parseInt(localStorage.getItem('taskflow_memory_best_time') || '0', 10);
      setBestScore(storedBestScore);
      setBestTime(storedBestTime);
    } catch {
      // safe fallback
    }
  }, []);

  const getPairsCount = (): number => {
    if (difficulty === 'easy') return 6;
    if (difficulty === 'normal') return 8;
    return 10;
  };

  const initGame = () => {
    const pairsCount = getPairsCount();
    const selectedSymbols = ALL_SYMBOLS.slice(0, pairsCount);
    const cardPool: CardItem[] = [];

    selectedSymbols.forEach((sym, idx) => {
      cardPool.push({ id: `sym-${idx}-a`, symbol: sym, isFlipped: false, isMatched: false });
      cardPool.push({ id: `sym-${idx}-b`, symbol: sym, isFlipped: false, isMatched: false });
    });

    // Randomize layout
    cardPool.sort(() => Math.random() - 0.5);

    setCards(cardPool);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTimeLeft(90);
    setTimeSpent(0);
    setScore(0);
    setGameState('running');
  };

  // Timer
  useEffect(() => {
    if (gameState === 'running') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver(false);
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleGameOver = (isWin: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isWin) {
      setGameState('won');
      playChime('complete');

      // Calculate score based on difficulty, time left, and moves
      const difficultyMultiplier = difficulty === 'hard' ? 2 : difficulty === 'normal' ? 1.5 : 1;
      const calculatedScore = Math.max(100, Math.round((timeLeft * 15 - moves * 8) * difficultyMultiplier));
      setScore(calculatedScore);

      const earnedXp = Math.max(15, Math.round(calculatedScore / 10));
      addFocusXp(earnedXp);
      recordGamePlayed('memory', calculatedScore, timeSpent);

      if (calculatedScore > bestScore) setBestScore(calculatedScore);
      if (bestTime === 0 || timeSpent < bestTime) setBestTime(timeSpent);
      if (onStatsUpdate) onStatsUpdate();
    } else {
      setGameState('lost');
    }
  };

  const handleCardClick = (index: number) => {
    if (gameState !== 'running') return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    playChime('tap');

    const nextCards = [...cards];
    nextCards[index].isFlipped = true;
    setCards(nextCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextFlipped;

      if (nextCards[firstIdx].symbol === nextCards[secondIdx].symbol) {
        // Matched!
        playChime('match');
        nextCards[firstIdx].isMatched = true;
        nextCards[secondIdx].isMatched = true;
        setCards(nextCards);
        setFlippedIndices([]);

        const nextMatches = matches + 1;
        setMatches(nextMatches);

        if (nextMatches >= getPairsCount()) {
          setTimeout(() => handleGameOver(true), 300);
        }
      } else {
        // Mismatch - flip back after delay
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            if (updated[firstIdx]) updated[firstIdx].isFlipped = false;
            if (updated[secondIdx]) updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
        }, 750);
      }
    }
  };

  const pairsNeeded = getPairsCount();

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="space-y-4 py-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center text-2xl">
            🧠
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Memory Match Sprint
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Match student-themed symbols under 90 seconds. Boost visual working memory and cognitive recall.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-1.5 max-w-xs mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499AB] block text-center">
              Select Difficulty Mode
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-xs">
              {(['easy', 'normal', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-white dark:bg-slate-800 text-[#5B4DF5] dark:text-white shadow-xs'
                      : 'text-[#5C6175] dark:text-[#94A3B8]'
                  }`}
                >
                  {d} ({d === 'easy' ? '6p' : d === 'normal' ? '8p' : '10p'})
                </button>
              ))}
            </div>
          </div>

          {/* High Scores strip */}
          <div className="flex items-center justify-center gap-4 text-xs pt-1 text-[#5C6175] dark:text-slate-300">
            <span>Best Score: <strong className="text-[#5B4DF5] dark:text-[#A49DFC]">{bestScore}</strong></span>
            {bestTime > 0 && <span>Best Time: <strong className="text-[#19A974]">{bestTime}s</strong></span>}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={initGame}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Memory Match</span>
            </button>
          </div>
        </div>
      )}

      {/* RUNNING GAME SCREEN */}
      {gameState === 'running' && (
        <div className="space-y-3.5">
          {/* Top HUD */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                  timeLeft <= 15
                    ? 'bg-rose-100 text-[#E04F5F] dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 text-[#5B4DF5] dark:text-[#A49DFC] border border-[#E6E9F2] dark:border-slate-700'
                }`}
              >
                {timeLeft}s
              </span>
              <span className="text-[11px] text-[#9499AB]">left</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] text-[#9499AB] uppercase font-bold block">Moves</span>
                <span className="font-extrabold text-[#171A2E] dark:text-white">{moves}</span>
              </div>
              <div className="text-right pl-2 border-l border-[#E6E9F2] dark:border-slate-700">
                <span className="text-[9px] text-[#9499AB] uppercase font-bold block">Pairs</span>
                <span className="font-extrabold text-[#19A974]">{matches}/{pairsNeeded}</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className={`grid gap-2 sm:gap-2.5 mx-auto ${
              difficulty === 'easy'
                ? 'grid-cols-4 max-w-xs'
                : difficulty === 'normal'
                ? 'grid-cols-4 max-w-sm'
                : 'grid-cols-5 max-w-md'
            }`}
          >
            {cards.map((card, idx) => {
              const isOpen = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square min-h-[48px] sm:min-h-[58px] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all border cursor-pointer select-none ${
                    card.isMatched
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 opacity-90'
                      : isOpen
                      ? 'bg-white dark:bg-slate-800 border-[#5B4DF5] shadow-xs'
                      : 'bg-[#F1F3F8] dark:bg-slate-800/80 border-[#E6E9F2] dark:border-slate-700 hover:border-[#5B4DF5]/40 hover:bg-[#EEECFF]/30'
                  }`}
                  aria-label={isOpen ? card.symbol : 'Hidden card'}
                >
                  {isOpen ? card.symbol : '❓'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WON SCREEN */}
      {gameState === 'won' && (
        <div className="space-y-4 py-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Memory Match Completed! 🎉
            </h4>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              Completed in {timeSpent} seconds with {moves} moves.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto pt-1">
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
              <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Score</span>
              <span className="text-base font-extrabold text-[#5B4DF5] dark:text-[#A49DFC]">
                {score}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
              <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">XP Earned</span>
              <span className="text-base font-extrabold text-[#19A974]">
                +{Math.max(15, Math.round(score / 10))}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
              <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Time</span>
              <span className="text-base font-extrabold text-[#171A2E] dark:text-white">
                {timeSpent}s
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

      {/* LOST SCREEN */}
      {gameState === 'lost' && (
        <div className="space-y-4 py-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#E04F5F] flex items-center justify-center text-2xl">
            ⏰
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-heading font-extrabold text-[#171A2E] dark:text-white">
              Time Expired!
            </h4>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              You matched {matches} of {pairsNeeded} pairs. Try again to beat the timer!
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
