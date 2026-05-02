import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelForXP } from '../data/levels';

export interface CompletedQuiz {
  easy: number;
  medium: number;
  hard: number;
}

export interface PowerUps {
  fiftyFifty: number;
  extraTime: number;
  hint: number;
  extraLife: number;
}

export interface GameState {
  playerName: string;
  xp: number;
  coins: number;
  lives: number;
  lastLifeRegen: number;
  completedQuizzes: Record<string, CompletedQuiz>;
  achievements: string[];
  bestStreak: number;
  totalCorrect: number;
  totalQuestions: number;
  dailyStreak: number;
  lastPlayDate: string;
  powerUps: PowerUps;
  totalCoinsEarned: number;
  fastAnswers: number;

  // computed
  level: () => number;

  // actions
  setPlayerName: (name: string) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  loseLife: () => void;
  regenerateLives: () => void;
  completeQuiz: (topicFile: string, difficulty: string, stars: number) => void;
  unlockAchievement: (id: string) => void;
  updateStreak: (streak: number) => void;
  addStats: (correct: number, total: number) => void;
  usePowerUp: (type: keyof PowerUps) => boolean;
  addPowerUp: (type: keyof PowerUps, count: number) => void;
  recordFastAnswer: () => void;
  updateDailyStreak: () => void;
}

const MAX_LIVES = 5;
const LIFE_REGEN_MS = 10 * 60 * 1000; // 10 minutes

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      xp: 0,
      coins: 0,
      lives: MAX_LIVES,
      lastLifeRegen: Date.now(),
      completedQuizzes: {},
      achievements: [],
      bestStreak: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      dailyStreak: 0,
      lastPlayDate: '',
      powerUps: { fiftyFifty: 3, extraTime: 3, hint: 3, extraLife: 2 },
      totalCoinsEarned: 0,
      fastAnswers: 0,

      level: () => getLevelForXP(get().xp),

      setPlayerName: (name) => set({ playerName: name }),

      addXP: (amount) => set((s) => ({ xp: s.xp + amount })),

      addCoins: (amount) =>
        set((s) => ({
          coins: s.coins + amount,
          totalCoinsEarned: s.totalCoinsEarned + amount,
        })),

      spendCoins: (amount) => {
        if (get().coins >= amount) {
          set((s) => ({ coins: s.coins - amount }));
          return true;
        }
        return false;
      },

      loseLife: () => set((s) => ({ lives: Math.max(0, s.lives - 1) })),

      regenerateLives: () => {
        const now = Date.now();
        const elapsed = now - get().lastLifeRegen;
        const livesGained = Math.floor(elapsed / LIFE_REGEN_MS);
        if (livesGained > 0 && get().lives < MAX_LIVES) {
          set((s) => ({
            lives: Math.min(MAX_LIVES, s.lives + livesGained),
            lastLifeRegen: now,
          }));
        }
      },

      completeQuiz: (topicFile, difficulty, stars) =>
        set((s) => {
          const prev = s.completedQuizzes[topicFile] || { easy: 0, medium: 0, hard: 0 };
          const key = difficulty as keyof CompletedQuiz;
          return {
            completedQuizzes: {
              ...s.completedQuizzes,
              [topicFile]: {
                ...prev,
                [key]: Math.max(prev[key], stars),
              },
            },
          };
        }),

      unlockAchievement: (id) =>
        set((s) => {
          if (s.achievements.includes(id)) return s;
          return { achievements: [...s.achievements, id] };
        }),

      updateStreak: (streak) =>
        set((s) => ({
          bestStreak: Math.max(s.bestStreak, streak),
        })),

      addStats: (correct, total) =>
        set((s) => ({
          totalCorrect: s.totalCorrect + correct,
          totalQuestions: s.totalQuestions + total,
        })),

      usePowerUp: (type) => {
        if (get().powerUps[type] > 0) {
          set((s) => ({
            powerUps: { ...s.powerUps, [type]: s.powerUps[type] - 1 },
          }));
          return true;
        }
        return false;
      },

      addPowerUp: (type, count) =>
        set((s) => ({
          powerUps: { ...s.powerUps, [type]: s.powerUps[type] + count },
        })),

      recordFastAnswer: () =>
        set((s) => ({ fastAnswers: s.fastAnswers + 1 })),

      updateDailyStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const last = get().lastPlayDate;
        if (last === today) return;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        set({
          dailyStreak: last === yesterday ? get().dailyStreak + 1 : 1,
          lastPlayDate: today,
        });
      },
    }),
    {
      name: 'jungleguess-storage',
    }
  )
);
