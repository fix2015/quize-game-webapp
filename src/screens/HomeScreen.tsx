import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { worlds } from '../data/worlds';
import XPBar from '../components/XPBar';
import LivesDisplay from '../components/LivesDisplay';
import StarRating from '../components/StarRating';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { xp, coins, lives, level, completedQuizzes, regenerateLives, playerName, setPlayerName } = useGameStore();
  const currentLevel = level();

  // Regenerate lives on visit
  regenerateLives();

  const getTotalStars = () => {
    return Object.values(completedQuizzes).reduce((sum, q) => sum + q.easy + q.medium + q.hard, 0);
  };

  if (!playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-jungle-dark/80 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-jungle-light/30"
        >
          <h1 className="text-4xl font-heading font-bold text-golden mb-2">🌿 JungleGuess</h1>
          <p className="text-cream/70 mb-6">Interactive Quiz Game</p>
          <input
            type="text"
            placeholder="Enter your name, explorer!"
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-jungle-light/30
              text-cream placeholder:text-cream/40 text-center text-lg font-heading
              focus:outline-none focus:ring-2 focus:ring-golden mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                setPlayerName((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
          <p className="text-cream/50 text-sm">Press Enter to start</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="bg-jungle-dark/80 backdrop-blur rounded-2xl p-4 mb-6 shadow-xl border border-jungle-light/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦎</span>
            <span className="font-heading font-bold text-lg">{playerName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-golden font-bold">🪙 {coins}</span>
            <span className="font-bold">⭐ {getTotalStars()}</span>
            <LivesDisplay lives={lives} />
          </div>
        </div>
        <XPBar xp={xp} />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-earth/60 hover:bg-earth/80 transition font-heading font-bold text-sm"
        >
          📊 Dashboard
        </button>
      </div>

      {/* World Map */}
      <div className="space-y-8">
        {worlds.map((world, wi) => {
          const isLocked = currentLevel < world.unlockLevel;

          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.1 }}
              className={`rounded-3xl p-6 shadow-xl border ${
                isLocked
                  ? 'bg-black/40 border-gray-700/30 opacity-60'
                  : 'bg-jungle-dark/60 border-jungle-light/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{world.emoji}</span>
                <h2 className="text-2xl font-heading font-bold text-golden">
                  {world.name}
                </h2>
                {isLocked && (
                  <span className="ml-auto text-sm bg-black/40 px-3 py-1 rounded-full">
                    🔒 Level {world.unlockLevel}
                  </span>
                )}
              </div>

              {!isLocked && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {world.topics.map((topic) => {
                    const progress = completedQuizzes[topic.file];
                    const bestStars = progress
                      ? Math.max(progress.easy, progress.medium, progress.hard)
                      : 0;

                    return (
                      <motion.button
                        key={topic.file}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/category/${topic.file}`)}
                        className="bg-jungle/50 hover:bg-jungle/80 rounded-xl p-3 text-left
                          transition-all border border-jungle-light/20 shadow-md"
                      >
                        <p className="font-heading font-bold text-sm mb-1 truncate">{topic.name}</p>
                        {bestStars > 0 && <StarRating stars={bestStars} size="sm" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* YouTube CTA */}
      <div className="mt-8 mb-4 text-center">
        <a
          href="https://www.youtube.com/@JungleGuess"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-error rounded-xl
            font-heading font-bold hover:scale-105 transition-transform shadow-lg"
        >
          ▶ Play More on YouTube
        </a>
      </div>
    </div>
  );
}
