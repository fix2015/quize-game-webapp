import { XP_PER_CORRECT, SPEED_BONUS_XP, STREAK_BONUS_XP, PERFECT_BONUS_XP } from '../data/levels';

export function calculateXP(
  difficulty: string,
  isCorrect: boolean,
  timeToAnswer: number,
  currentStreak: number,
): number {
  if (!isCorrect) return 0;
  let xp = XP_PER_CORRECT[difficulty] || 10;
  if (timeToAnswer < 3) xp += SPEED_BONUS_XP;
  if (currentStreak >= 3) xp += STREAK_BONUS_XP;
  return xp;
}

export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = correct / total;
  if (pct >= 1) return 3;
  if (pct >= 0.7) return 2;
  return 1;
}

export function calculateCoins(correct: number, stars: number): number {
  return correct + (stars === 3 ? 5 : 0);
}

export function calculatePerfectBonus(stars: number): number {
  return stars === 3 ? PERFECT_BONUS_XP : 0;
}
