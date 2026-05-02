import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { achievements } from '../data/achievements';
import { worlds } from '../data/worlds';
import XPBar from '../components/XPBar';
import StarRating from '../components/StarRating';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const store = useGameStore();
  const level = store.level();

  const totalStars = Object.values(store.completedQuizzes).reduce(
    (sum, q) => sum + q.easy + q.medium + q.hard,
    0
  );
  const completedCount = Object.keys(store.completedQuizzes).length;
  const accuracy = store.totalQuestions > 0
    ? Math.round((store.totalCorrect / store.totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-cream/60 hover:text-cream mb-4 text-sm font-heading"
      >
        ← Back to Map
      </button>

      {/* Player Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-jungle-dark/80 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl border border-jungle-light/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">🦎</span>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold text-golden">{store.playerName}</h1>
            <XPBar xp={store.xp} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Level', value: level, icon: '🏆' },
            { label: 'Stars', value: totalStars, icon: '⭐' },
            { label: 'Coins', value: store.coins, icon: '🪙' },
            { label: 'Streak', value: store.bestStreak, icon: '🔥' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/20 rounded-xl p-3 text-center">
              <span className="text-xl">{stat.icon}</span>
              <p className="font-heading font-bold text-xl">{stat.value}</p>
              <p className="text-cream/60 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="font-heading font-bold text-lg">{completedCount}/110</p>
            <p className="text-cream/60 text-xs">Categories</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="font-heading font-bold text-lg">{accuracy}%</p>
            <p className="text-cream/60 text-xs">Accuracy</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="font-heading font-bold text-lg">{store.dailyStreak}</p>
            <p className="text-cream/60 text-xs">Daily Streak</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-jungle-dark/60 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl border border-jungle-light/20"
      >
        <h2 className="text-xl font-heading font-bold text-golden mb-4">🏅 Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const unlocked = store.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-xl p-3 text-center ${
                  unlocked ? 'bg-golden/20 border border-golden/30' : 'bg-black/20 opacity-50'
                }`}
              >
                <span className="text-2xl">{ach.badge}</span>
                <p className="font-heading font-bold text-sm mt-1">{ach.name}</p>
                <p className="text-cream/60 text-xs">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-jungle-dark/60 backdrop-blur rounded-3xl p-6 shadow-xl border border-jungle-light/20"
      >
        <h2 className="text-xl font-heading font-bold text-golden mb-4">📊 Category Progress</h2>
        {worlds.map((world) => (
          <div key={world.id} className="mb-4">
            <h3 className="font-heading font-bold text-sm text-cream/70 mb-2">
              {world.emoji} {world.name}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {world.topics.map((topic) => {
                const p = store.completedQuizzes[topic.file];
                const best = p ? Math.max(p.easy, p.medium, p.hard) : 0;
                return (
                  <div
                    key={topic.file}
                    className={`rounded-lg p-2 text-center text-xs ${
                      best > 0 ? 'bg-jungle/40' : 'bg-black/20'
                    }`}
                  >
                    <p className="truncate font-bold">{topic.name}</p>
                    {best > 0 && <StarRating stars={best} size="sm" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
