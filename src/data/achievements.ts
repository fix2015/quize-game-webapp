export interface Achievement {
  id: string;
  badge: string;
  name: string;
  description: string;
}

export const achievements: Achievement[] = [
  { id: 'first_steps', badge: '🌱', name: 'First Steps', description: 'Complete your first quiz' },
  { id: 'hot_streak', badge: '🔥', name: 'Hot Streak', description: 'Get 5 correct answers in a row' },
  { id: 'on_fire', badge: '🔥🔥', name: 'On Fire', description: 'Get 10 correct answers in a row' },
  { id: 'legendary', badge: '🔥🔥🔥', name: 'Legendary Streak', description: 'Get 20 correct answers in a row' },
  { id: 'star_collector', badge: '⭐', name: 'Star Collector', description: 'Earn 50 stars total' },
  { id: 'superstar', badge: '🌟', name: 'Superstar', description: 'Earn 150 stars total' },
  { id: 'speed_demon', badge: '🚀', name: 'Speed Demon', description: 'Answer 10 questions in under 2 seconds each' },
  { id: 'quiz_master', badge: '🧠', name: 'Quiz Master', description: 'Reach Level 50' },
  { id: 'dedicated', badge: '📅', name: 'Dedicated', description: 'Play 7 days in a row' },
  { id: 'sharpshooter', badge: '🎯', name: 'Sharpshooter', description: 'Get 100% on a Hard quiz' },
  { id: 'rich', badge: '💰', name: 'Rich', description: 'Earn 1000 coins total' },
  { id: 'explorer', badge: '🌈', name: 'Explorer', description: 'Play at least 1 quiz in every world' },
];
