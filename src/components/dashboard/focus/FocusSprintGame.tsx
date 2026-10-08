import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  Trophy,
  Flame,
} from 'lucide-react';
import { FOCUS_QUESTIONS, FocusQuestion } from '@/data/focusSprintQuestions';
import { addFocusXp, recordGamePlayed, playChime } from '@/utils/focusHubStorage';

interface FocusSprintGameProps {
  onStatsUpdate?: () => void;
}

export const FocusSprintGame: React.FC<FocusSprintGameProps> = ({ onStatsUpdate }) => {
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreakInGame, setBestStreakInGame] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Active question & options
  const [currentQuestion, setCurrentQuestion] = useState<FocusQuestion | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; isCorrect: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // CRITICAL: Used questions Set to prevent any duplicate questions in a session
  const usedQuestionIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);

  const getFilteredPool = (): FocusQuestion[] => {
    if (difficultyFilter === 'all') return FOCUS_QUESTIONS;
    return FOCUS_QUESTIONS.filter((q) => q.difficulty === difficultyFilter);
  };

  const pickNextQuestion = (): FocusQuestion | null => {
    const pool = getFilteredPool();
    // Filter out used IDs
    const remaining = pool.filter((q) => !usedQuestionIdsRef.current.has(q.id));

    // If all questions in pool have been answered, reset set
    if (remaining.length === 0) {
      usedQuestionIdsRef.current.clear();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const chosen = remaining[randomIndex];
    usedQuestionIdsRef.current.add(chosen.id);
    return chosen;
  };

  const setupQuestion = (q: FocusQuestion) => {
    setCurrentQuestion(q);
    const options = [
      { text: q.correct, isCorrect: true },
      ...q.distractors.map((d) => ({ text: d, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    setShuffledOptions(options);
    setFeedback(null);
    setSelectedOptionIndex(null);
  };

  const handleStartGame = () => {
    // Reset used question tracking only when a new game session starts
    usedQuestionIdsRef.current.clear();
    setScore(0);
    setTimeLeft(60);
    setComboMultiplier(1);
    setStreakCount(0);
    setBestStreakInGame(0);
    setQuestionsAnswered(0);
    setCorrectCount(0);

    const firstQ = pickNextQuestion();
    if (firstQ) {
      setupQuestion(firstQ);
      setGameState('running');
    }
  };

  // Timer ticker
  useEffect(() => {
    if (gameState === 'running') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEndGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleEndGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    playChime('complete');

    // Calculate XP based on score
    const earnedXp = Math.max(10, Math.round(score / 12));
    addFocusXp(earnedXp);
    recordGamePlayed('sprint', score);

    if (onStatsUpdate) onStatsUpdate();
  };

  const handleOptionSelect = (isCorrect: boolean, index: number) => {
    if (feedback !== null) return;
    setSelectedOptionIndex(index);
    setQuestionsAnswered((prev) => prev + 1);

    if (isCorrect) {
      setFeedback('correct');
      playChime('correct');
      setCorrectCount((prev) => prev + 1);

      // Score weighted by difficulty
      const basePoints =
        currentQuestion?.difficulty === 'hard'
          ? 200
          : currentQuestion?.difficulty === 'medium'
          ? 150
          : 100;

      const points = basePoints * comboMultiplier;
      setScore((prev) => prev + points);

      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      setBestStreakInGame((prev) => Math.max(prev, nextStreak));
      setComboMultiplier((prev) => Math.min(prev + 1, 4));
    } else {
      setFeedback('wrong');
      setComboMultiplier(1);
      setStreakCount(0);
    }

    setTimeout(() => {
      const nextQ = pickNextQuestion();
      if (nextQ && timeLeft > 0) {
        setupQuestion(nextQ);
      }
    }, 450);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-lg mx-auto">
      {/* IDLE / DIFFICULTY SELECTOR SCREEN */}
      {gameState === 'idle' && (
        <div className="space-y-4 py-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Focus Sprint Challenge (60s)
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Rapid academic prioritization: Choose the highest-leverage decision across 40+ unique scenarios. No repeated questions per session.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1.5 max-w-xs mx-auto text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499AB] block text-center">
              Select Difficulty Mode
            </span>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F5F7FB] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-xs">
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={`py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    difficultyFilter === d
                      ? 'bg-white dark:bg-slate-800 text-[#5B4DF5] dark:text-white shadow-xs'
                      : 'text-[#5C6175] dark:text-[#94A3B8]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start 60-Second Sprint</span>
            </button>
          </div>
        </div>
      )}

      {/* RUNNING GAME SCREEN */}
      {gameState === 'running' && currentQuestion && (
        <div className="space-y-4">
          {/* Top HUD Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800 text-xs">
            {/* Time Left */}
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                  timeLeft <= 10
                    ? 'bg-rose-100 text-[#E04F5F] dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 text-[#5B4DF5] dark:text-[#A49DFC] border border-[#E6E9F2] dark:border-slate-700'
                }`}
              >
                {timeLeft}s
              </span>
              <span className="text-[11px] text-[#9499AB]">left</span>
            </div>

            {/* Multiplier & Score */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] text-[#9499AB] uppercase font-bold block">Combo</span>
                <span className="font-extrabold text-[#D68A16]">{comboMultiplier}x</span>
              </div>
              <div className="text-right pl-3 border-l border-[#E6E9F2] dark:border-slate-700">
                <span className="text-[9px] text-[#9499AB] uppercase font-bold block">Score</span>
                <span className="font-extrabold text-sm text-[#171A2E] dark:text-white">
                  {score}
                </span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-[#F5F7FB] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#5B4DF5] h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Scenario Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/50 dark:bg-[#5B4DF5]/10 border border-[#5B4DF5]/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-extrabold uppercase tracking-wider text-[#5B4DF5] dark:text-[#A49DFC]">
                {currentQuestion.category}
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                  currentQuestion.difficulty === 'hard'
                    ? 'bg-rose-100 text-[#E04F5F]'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-amber-100 text-[#D68A16]'
                    : 'bg-emerald-100 text-[#19A974]'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-[#171A2E] dark:text-white leading-snug">
              {currentQuestion.prompt}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {shuffledOptions.map((opt, i) => {
              let itemClass =
                'border-[#E6E9F2] dark:border-slate-800 hover:border-[#5B4DF5]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#15172F] text-[#171A2E] dark:text-slate-200';

              if (feedback !== null) {
                if (opt.isCorrect) {
                  itemClass =
                    'border-emerald-300 bg-emerald-50 text-[#19A974] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold';
                } else if (selectedOptionIndex === i && feedback === 'wrong') {
                  itemClass =
                    'border-rose-200 bg-rose-50 text-[#E04F5F] dark:bg-rose-950/40 dark:text-rose-300 opacity-70';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={feedback !== null}
                  onClick={() => handleOptionSelect(opt.isCorrect, i)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-2.5 cursor-pointer ${itemClass}`}
                >
                  <span className="w-5 h-5 rounded-md bg-[#F1F3F8] dark:bg-slate-800 text-[#5C6175] dark:text-slate-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {['A', 'B', 'C'][i]}
                  </span>
                  <span className="leading-snug flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FINISHED SCREEN */}
      {gameState === 'finished' && (
        <div className="space-y-4 py-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Sprint Complete!
            </h4>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              Accuracy: {questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0}% ({correctCount}/{questionsAnswered} correct)
            </p>
          </div>

          {/* Results Matrix */}
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
                +{Math.max(10, Math.round(score / 12))}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#15172F] border border-[#E6E9F2] dark:border-slate-800">
              <span className="text-[10px] text-[#9499AB] block font-semibold uppercase">Best Combo</span>
              <span className="text-base font-extrabold text-[#D68A16] flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-[#D68A16]" />
                {bestStreakInGame}x
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
