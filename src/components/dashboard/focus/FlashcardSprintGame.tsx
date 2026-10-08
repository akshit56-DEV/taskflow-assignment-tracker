import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Trophy,
  Brain,
  Zap,
  Clock,
} from 'lucide-react';
import {
  getAllFlashcards,
  StoredFlashcard,
  updateFlashcardMastery,
} from '@/utils/flashcardStorage';
import { addFocusXp, recordGamePlayed, playChime } from '@/utils/focusHubStorage';
import confetti from 'canvas-confetti';

interface FlashcardSprintGameProps {
  onStatsUpdate?: () => void;
  onNavigateToAssignments?: () => void;
}

export const FlashcardSprintGame: React.FC<FlashcardSprintGameProps> = ({
  onStatsUpdate,
  onNavigateToAssignments,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [deck, setDeck] = useState<StoredFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Live Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [almostCount, setAlmostCount] = useState(0);
  const [dontKnowCount, setDontKnowCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Load student's actual flashcards
    const cards = getAllFlashcards();
    setDeck(cards);
  }, [gameState]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const finishGame = () => {
    clearTimer();
    setGameState('finished');
    playChime('complete');

    // Calculate XP
    const earnedXp = Math.max(20, Math.min(250, Math.round(score / 8)));
    addFocusXp(earnedXp);
    recordGamePlayed('memory', score); // records focus game played
    if (onStatsUpdate) onStatsUpdate();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#5B4DF5', '#19A974', '#16B8D4'],
    });
  };

  const startGame = () => {
    const cards = getAllFlashcards();
    if (cards.length === 0) return;

    // Shuffle deck
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);

    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCardsReviewed(0);
    setKnownCount(0);
    setAlmostCount(0);
    setDontKnowCount(0);
    setTimeLeft(60);
    setGameState('running');

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (choice: 'know' | 'almost' | 'dont_know') => {
    if (gameState !== 'running' || deck.length === 0) return;

    const currentCard = deck[currentIndex];
    playChime('tap');

    setCardsReviewed((prev) => prev + 1);

    if (choice === 'know') {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
      const points = 100 + Math.min(nextStreak * 15, 75);
      setScore((prev) => prev + points);
      setKnownCount((prev) => prev + 1);
      updateFlashcardMastery(currentCard.id, 'mastered');
    } else if (choice === 'almost') {
      setScore((prev) => prev + 50);
      setAlmostCount((prev) => prev + 1);
      updateFlashcardMastery(currentCard.id, 'learning');
    } else {
      setStreak(0);
      setDontKnowCount((prev) => prev + 1);
      updateFlashcardMastery(currentCard.id, 'new');
    }

    // Move to next card
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const currentCard = deck[currentIndex];
  const accuracy = cardsReviewed > 0 ? Math.round(((knownCount + almostCount * 0.5) / cardsReviewed) * 100) : 0;

  // 1. NO FLASHCARDS STATE
  if (deck.length === 0 && gameState === 'idle') {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center">
          <Brain className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#171A2E] dark:text-white">
            Flashcard Sprint (60s)
          </h3>
          <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
            Generate flashcards from an assignment first.
          </p>
        </div>
        <p className="text-[11px] text-[#9499AB] leading-relaxed">
          Upload any course PDF, lab document, or syllabus on an assignment to automatically generate your personalized rapid recall study deck.
        </p>
        {onNavigateToAssignments && (
          <button
            type="button"
            onClick={onNavigateToAssignments}
            className="px-4 py-2 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Go to Assignments
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* 2. IDLE STATE */}
      {gameState === 'idle' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center shadow-xs">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Flashcard Sprint
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              60-second rapid recall with your real academic flashcards
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-xs py-1">
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Deck Size</span>
              <span className="font-extrabold text-[#5B4DF5] dark:text-[#A49DFC]">
                {deck.length} cards
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Duration</span>
              <span className="font-extrabold text-[#171A2E] dark:text-white">60 Seconds</span>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xs active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Sprint</span>
          </button>
        </div>
      )}

      {/* 3. RUNNING STATE */}
      {gameState === 'running' && currentCard && (
        <div className="space-y-4">
          {/* Header Bar: Timer & Live Stats */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] shadow-2xs text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono font-bold">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#D68A16]">🔥 Streak: {streak}</span>
              <span className="text-[#5B4DF5] dark:text-[#A49DFC] font-bold">
                Pts: {score}
              </span>
            </div>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="w-full h-56 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] p-5 flex flex-col justify-between items-center text-center shadow-sm cursor-pointer select-none group relative overflow-hidden"
          >
            <div className="flex items-center justify-between w-full text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEECFF] text-[#5B4DF5] dark:bg-[#5B4DF5]/20">
                {currentCard.topic || 'Card'}
              </span>
              <span className="text-[10px] text-[#9499AB] group-hover:text-[#5B4DF5] transition-colors">
                {isFlipped ? 'Showing Back' : 'Click to flip'}
              </span>
            </div>

            <div className="my-auto px-3 max-h-36 overflow-y-auto no-scrollbar">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9499AB] block mb-1">
                {isFlipped ? 'Answer' : 'Question'}
              </span>
              <p className="text-base sm:text-lg font-heading font-bold text-[#171A2E] dark:text-white leading-snug">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <span className="text-[10px] text-[#9499AB]">
              {currentIndex + 1} / {deck.length} · Tap card to reveal answer
            </span>
          </div>

          {/* Rapid Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAnswer('dont_know')}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-0.5"
            >
              <span>Don't Know</span>
              <span className="text-[9px] opacity-70">0 pts</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer('almost')}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-0.5"
            >
              <span>Almost</span>
              <span className="text-[9px] opacity-70">+50 pts</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer('know')}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-0.5"
            >
              <span>Know It ✓</span>
              <span className="text-[9px] opacity-70">+100 pts</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. FINISHED STATE */}
      {gameState === 'finished' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] flex items-center justify-center shadow-xs">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#171A2E] dark:text-white">
              Sprint Complete!
            </h3>
            <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
              Great rapid recall practice for your semester retention
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs py-2">
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Score</span>
              <span className="font-extrabold text-[#5B4DF5] dark:text-[#A49DFC]">{score}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Reviewed</span>
              <span className="font-extrabold text-[#171A2E] dark:text-white">{cardsReviewed} cards</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Best Streak</span>
              <span className="font-extrabold text-[#D68A16]">{bestStreak}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E6E9F2] dark:border-slate-700">
              <span className="text-[10px] text-[#9499AB] uppercase font-bold block">Accuracy</span>
              <span className="font-extrabold text-[#19A974]">{accuracy}%</span>
            </div>
          </div>

          <div className="text-[11px] text-[#5C6175] dark:text-[#94A3B8] flex items-center justify-center gap-3">
            <span>Mastered: <strong className="text-[#19A974]">{knownCount}</strong></span>
            <span>·</span>
            <span>Almost: <strong className="text-[#D68A16]">{almostCount}</strong></span>
            <span>·</span>
            <span>To Review: <strong className="text-rose-600">{dontKnowCount}</strong></span>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
