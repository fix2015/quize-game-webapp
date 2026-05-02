export function xpForLevel(level: number): number {
  return 50 * level * level + 50 * level;
}

export function getLevelForXP(xp: number): number {
  let level = 0;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function xpProgress(xp: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  const level = getLevelForXP(xp);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const currentXP = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return {
    level,
    currentXP,
    nextLevelXP: needed,
    progress: needed > 0 ? currentXP / needed : 1,
  };
}

export const MAX_LEVEL = 50;

export const TIMER_SECONDS: Record<string, number> = {
  easy: 10,
  medium: 7,
  hard: 5,
};

export const XP_PER_CORRECT: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export const SPEED_BONUS_XP = 5;
export const STREAK_BONUS_XP = 3;
export const PERFECT_BONUS_XP = 50;
export const DAILY_CHALLENGE_XP = 100;
