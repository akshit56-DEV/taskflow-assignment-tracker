import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Brain,
} from 'lucide-react';
import {
  StoredFlashcard,
  updateFlashcardMastery,
} from '@/utils/flashcardStorage';

interface FlashcardDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: StoredFlashcard[];
  title?: string;
}

export const FlashcardDeckModal: React.FC<FlashcardDeckModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  title = 'Flashcard Study Deck',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<StoredFlashcard[]>(flashcards);

  // Sync cards when prop updates
  React.useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMastery = (mastery: 'new' | 'learning' | 'mastered') => {
    if (!currentCard) return;
    updateFlashcardMastery(currentCard.id, mastery);
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, masteryState: mastery } : c))
    );
    handleNext();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D1E]/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white dark:bg-[#11142B] border border-[#E6E9F2] dark:border-[#1E293B] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6E9F2] dark:border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEECFF] dark:bg-[#5B4DF5]/20 text-[#5B4DF5] flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#5B4DF5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#171A2E] dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-[#5C6175] dark:text-[#94A3B8]">
                  Card {cards.length > 0 ? currentIndex + 1 : 0} of {cards.length}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9499AB] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Flashcard Area */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-[280px]">
            {cards.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-[#9499AB]">No flashcards available in this deck.</p>
              </div>
            ) : currentCard ? (
              <div className="w-full space-y-4">
                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="w-full h-64 rounded-2xl border border-[#E6E9F2] dark:border-[#1E293B] bg-gradient-to-b from-[#F9FAFC] to-white dark:from-[#15172F] dark:to-[#11142B] p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEECFF] text-[#5B4DF5] dark:bg-[#5B4DF5]/20 dark:text-[#A49DFC]">
                      {currentCard.topic || 'Concept'}
                    </span>
                    <span className="text-[10px] text-[#9499AB] flex items-center gap-1 group-hover:text-[#5B4DF5] transition-colors">
                      <RotateCw className="w-3 h-3" />
                      Click to flip
                    </span>
                  </div>

                  <div className="my-auto px-4 max-h-40 overflow-y-auto no-scrollbar">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9499AB] block mb-1.5">
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>
                    <p className="text-base sm:text-lg font-heading font-bold text-[#171A2E] dark:text-white leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full text-xs pt-2 border-t border-[#E6E9F2]/60 dark:border-slate-800">
                    <span className="text-[10px] text-[#9499AB]">
                      Difficulty: <strong className="capitalize">{currentCard.difficulty}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        currentCard.masteryState === 'mastered'
                          ? 'bg-emerald-50 text-[#19A974] dark:bg-emerald-950/40'
                          : currentCard.masteryState === 'learning'
                          ? 'bg-amber-50 text-[#D68A16] dark:bg-amber-950/40'
                          : 'bg-slate-100 text-[#5C6175] dark:bg-slate-800'
                      }`}
                    >
                      {currentCard.masteryState || 'new'}
                    </span>
                  </div>
                </div>

                {/* Rating / Mastery buttons */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleMastery('new')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Don't Know
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMastery('learning')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Almost
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMastery('mastered')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Mastered ✓
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Navigation */}
          {cards.length > 0 && (
            <div className="p-4 border-t border-[#E6E9F2] dark:border-[#1E293B] flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-xl border border-[#E6E9F2] dark:border-slate-800 text-xs font-semibold text-[#5C6175] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="text-xs font-semibold text-[#5B4DF5] dark:text-[#A49DFC] hover:underline cursor-pointer"
              >
                Flip Card
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded-xl border border-[#E6E9F2] dark:border-slate-800 text-xs font-semibold text-[#5C6175] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
