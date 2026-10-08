export interface StoredFlashcard {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subjectName?: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  masteryState: 'new' | 'learning' | 'mastered';
  createdAt: string;
  lastReviewedAt?: string;
}

const STORAGE_KEY = 'taskflow_academic_flashcards';

export function getAllFlashcards(): StoredFlashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored flashcards:', err);
    return [];
  }
}

export function getFlashcardsByAssignment(assignmentId: string): StoredFlashcard[] {
  const all = getAllFlashcards();
  return all.filter((c) => c.assignmentId === assignmentId);
}

export function saveAssignmentFlashcards(
  assignmentId: string,
  assignmentTitle: string,
  subjectName: string | undefined,
  cards: Array<{
    front: string;
    back: string;
    topic: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    masteryState?: 'new' | 'learning' | 'mastered';
  }>
): StoredFlashcard[] {
  const all = getAllFlashcards().filter((c) => c.assignmentId !== assignmentId);
  const now = new Date().toISOString();

  const newCards: StoredFlashcard[] = cards.map((c, idx) => ({
    id: `fc_${assignmentId}_${Date.now()}_${idx}`,
    assignmentId,
    assignmentTitle,
    subjectName,
    front: c.front,
    back: c.back,
    topic: c.topic || 'General',
    difficulty: c.difficulty || 'medium',
    masteryState: c.masteryState || 'new',
    createdAt: now,
  }));

  const updated = [...all, ...newCards];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save flashcards to storage:', err);
  }

  return newCards;
}

export function updateFlashcardMastery(
  cardId: string,
  masteryState: 'new' | 'learning' | 'mastered'
): void {
  const all = getAllFlashcards();
  const index = all.findIndex((c) => c.id === cardId);
  if (index === -1) return;

  all[index].masteryState = masteryState;
  all[index].lastReviewedAt = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to update flashcard mastery:', err);
  }
}

export function deleteFlashcardsByAssignment(assignmentId: string): void {
  const all = getAllFlashcards().filter((c) => c.assignmentId !== assignmentId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to delete assignment flashcards:', err);
  }
}

export function getFlashcardStats(): {
  total: number;
  mastered: number;
  learning: number;
  newCards: number;
} {
  const all = getAllFlashcards();
  const mastered = all.filter((c) => c.masteryState === 'mastered').length;
  const learning = all.filter((c) => c.masteryState === 'learning').length;
  const newCards = all.filter((c) => c.masteryState === 'new').length;

  return {
    total: all.length,
    mastered,
    learning,
    newCards,
  };
}
