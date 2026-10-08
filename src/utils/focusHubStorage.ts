// Focus Hub Local Storage & Audio Utility

export interface FocusHubStats {
  totalXp: number;
  todayXp: number;
  currentStreak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  gamesPlayed: number;
  pomodorosCompleted: number;
  pomodoroStreak: number;
  sprintHighScore: number;
  memoryBestScore: number;
  memoryBestTime: number;
  reactionBestScore: number;
  reactionFastestMs: number;
}

const getTodayKey = (): string => new Date().toISOString().slice(0, 10);

export const getStoredFocusStats = (): FocusHubStats => {
  try {
    const today = getTodayKey();
    const lastDate = localStorage.getItem('taskflow_focus_last_date') || '';

    // Check if new day for today's XP
    let todayXp = parseInt(localStorage.getItem('taskflow_focus_today_xp') || '0', 10);
    if (lastDate !== today) {
      todayXp = 0;
      localStorage.setItem('taskflow_focus_today_xp', '0');
    }

    const totalXp = parseInt(localStorage.getItem('taskflow_focus_total_xp') || '0', 10);
    const currentStreak = parseInt(localStorage.getItem('taskflow_focus_streak') || '0', 10);
    const bestStreak = parseInt(localStorage.getItem('taskflow_focus_best_streak') || '0', 10);
    const totalFocusMinutes = parseInt(localStorage.getItem('taskflow_pomodoro_minutes') || '0', 10);
    const pomodorosCompleted = parseInt(localStorage.getItem('taskflow_pomodoro_sessions') || '0', 10);
    const pomodoroStreak = parseInt(localStorage.getItem('taskflow_pomodoro_streak') || '0', 10);
    const gamesPlayed = parseInt(localStorage.getItem('taskflow_focus_games_played') || '0', 10);

    const sprintHighScore = parseInt(localStorage.getItem('taskflow_sprint_highscore') || '0', 10);
    const memoryBestScore = parseInt(localStorage.getItem('taskflow_memory_best_score') || '0', 10);
    const memoryBestTime = parseInt(localStorage.getItem('taskflow_memory_best_time') || '0', 10);
    const reactionBestScore = parseInt(localStorage.getItem('taskflow_reaction_best_score') || '0', 10);
    const reactionFastestMs = parseInt(localStorage.getItem('taskflow_reaction_fastest_ms') || '0', 10);

    return {
      totalXp,
      todayXp,
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      totalFocusMinutes,
      gamesPlayed,
      pomodorosCompleted,
      pomodoroStreak,
      sprintHighScore,
      memoryBestScore,
      memoryBestTime,
      reactionBestScore,
      reactionFastestMs,
    };
  } catch {
    return {
      totalXp: 0,
      todayXp: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalFocusMinutes: 0,
      gamesPlayed: 0,
      pomodorosCompleted: 0,
      pomodoroStreak: 0,
      sprintHighScore: 0,
      memoryBestScore: 0,
      memoryBestTime: 0,
      reactionBestScore: 0,
      reactionFastestMs: 0,
    };
  }
};

export const addFocusXp = (xp: number): { totalXp: number; todayXp: number; newStreak: number } => {
  try {
    const today = getTodayKey();
    const lastDate = localStorage.getItem('taskflow_focus_last_date') || '';
    let currentStreak = parseInt(localStorage.getItem('taskflow_focus_streak') || '0', 10);
    let bestStreak = parseInt(localStorage.getItem('taskflow_focus_best_streak') || '0', 10);
    let todayXp = parseInt(localStorage.getItem('taskflow_focus_today_xp') || '0', 10);
    let totalXp = parseInt(localStorage.getItem('taskflow_focus_total_xp') || '0', 10);

    if (lastDate !== today) {
      todayXp = 0;
      // If yesterday was active, increment streak, otherwise start 1
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDate === yesterday) {
        currentStreak += 1;
      } else if (!lastDate) {
        currentStreak = 1;
      } else {
        currentStreak = 1;
      }
      bestStreak = Math.max(bestStreak, currentStreak);
      localStorage.setItem('taskflow_focus_streak', currentStreak.toString());
      localStorage.setItem('taskflow_focus_best_streak', bestStreak.toString());
      localStorage.setItem('taskflow_focus_last_date', today);
    }

    todayXp += xp;
    totalXp += xp;

    localStorage.setItem('taskflow_focus_today_xp', todayXp.toString());
    localStorage.setItem('taskflow_focus_total_xp', totalXp.toString());

    return { totalXp, todayXp, newStreak: currentStreak };
  } catch {
    return { totalXp: xp, todayXp: xp, newStreak: 1 };
  }
};

export const recordPomodoroCompleted = (focusMinutes: number): {
  sessions: number;
  totalMinutes: number;
  streak: number;
} => {
  try {
    const today = getTodayKey();
    const lastDate = localStorage.getItem('taskflow_pomodoro_last_date') || '';
    let sessions = parseInt(localStorage.getItem('taskflow_pomodoro_sessions') || '0', 10);
    let totalMinutes = parseInt(localStorage.getItem('taskflow_pomodoro_minutes') || '0', 10);
    let streak = parseInt(localStorage.getItem('taskflow_pomodoro_streak') || '0', 10);

    sessions += 1;
    totalMinutes += focusMinutes;

    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      localStorage.setItem('taskflow_pomodoro_streak', streak.toString());
      localStorage.setItem('taskflow_pomodoro_last_date', today);
    }

    localStorage.setItem('taskflow_pomodoro_sessions', sessions.toString());
    localStorage.setItem('taskflow_pomodoro_minutes', totalMinutes.toString());

    // Also award standard +100 XP
    addFocusXp(100);

    return { sessions, totalMinutes, streak };
  } catch {
    return { sessions: 1, totalMinutes: focusMinutes, streak: 1 };
  }
};

export const recordGamePlayed = (
  game: 'sprint' | 'memory' | 'reaction',
  score: number,
  secondaryMetric?: number
): void => {
  try {
    const totalPlayed = parseInt(localStorage.getItem('taskflow_focus_games_played') || '0', 10) + 1;
    localStorage.setItem('taskflow_focus_games_played', totalPlayed.toString());

    if (game === 'sprint') {
      const high = parseInt(localStorage.getItem('taskflow_sprint_highscore') || '0', 10);
      if (score > high) {
        localStorage.setItem('taskflow_sprint_highscore', score.toString());
      }
    } else if (game === 'memory') {
      const high = parseInt(localStorage.getItem('taskflow_memory_best_score') || '0', 10);
      if (score > high) {
        localStorage.setItem('taskflow_memory_best_score', score.toString());
      }
      if (secondaryMetric && secondaryMetric > 0) {
        const bestTime = parseInt(localStorage.getItem('taskflow_memory_best_time') || '999999', 10);
        if (secondaryMetric < bestTime) {
          localStorage.setItem('taskflow_memory_best_time', secondaryMetric.toString());
        }
      }
    } else if (game === 'reaction') {
      const high = parseInt(localStorage.getItem('taskflow_reaction_best_score') || '0', 10);
      if (score > high) {
        localStorage.setItem('taskflow_reaction_best_score', score.toString());
      }
      if (secondaryMetric && secondaryMetric > 0) {
        const fastest = parseInt(localStorage.getItem('taskflow_reaction_fastest_ms') || '9999', 10);
        if (secondaryMetric < fastest || fastest === 0) {
          localStorage.setItem('taskflow_reaction_fastest_ms', secondaryMetric.toString());
        }
      }
    }
  } catch {
    // safe fallback
  }
};

// Pure Web Audio API tone synthesis (No external assets, non-blocking)
export const playChime = (type: 'complete' | 'correct' | 'match' | 'tap' = 'complete'): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'complete') {
      // 3-note pleasant harmonic major arpeggio
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'match') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(987.77, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch {
    // Non-blocking fallback
  }
};
