import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StarRating from '../components/StarRating';
import XPBar from '../components/XPBar';
import Confetti from '../components/Confetti';
import { useGameStore } from '../store/gameStore';
import { useSound } from '../hooks/useSound';

interface ResultsState {
  correct: number;
  total: number;
  stars: number;
  coins: number;
  xp: number;
  topicFile: string;
  difficulty: string;
}

export default function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { xp } = useGameStore();
  const { playWin, playLose } = useSound();
  const state = location.state as ResultsState | null;
  const [showConfetti, setShowConfetti] = useState(false);

  const isWin = state ? state.stars >= 2 : false;

  useEffect(() => {
    if (!state) return;
    setShowConfetti(true);
    if (isWin) {
      playWin();
    } else {
      playLose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-golden font-heading font-bold">
          Go Home
        </button>
      </div>
    );
  }

  const { correct, total, stars, coins, xp: xpEarned, topicFile, difficulty } = state;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Confetti active={showConfetti} type={isWin ? 'win' : 'lose'} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-jungle-dark/80 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-jungle-light/30 relative z-10"
      >
        <motion.h1
          className="text-3xl font-heading font-bold text-golden mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {stars === 3 ? '🎉 YAHOO! Perfect!' : stars >= 2 ? '👏 Great Job!' : '😢 Try Again!'}
        </motion.h1>

        {/* Win/Lose animated emoji */}
        <motion.div
          className="text-6xl mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {stars === 3 ? '🏆' : stars >= 2 ? '🌟' : '💔'}
        </motion.div>

        {/* Stars */}
        <StarRating stars={stars} size="lg" animated />

        {/* Fancy XP display */}
        <motion.div
          className="mt-4 relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 150 }}
        >
          <div className="bg-gradient-to-r from-golden/30 via-golden/50 to-golden/30 rounded-2xl p-4 border border-golden/40">
            <motion.p
              className="text-4xl font-heading font-bold text-golden"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ delay: 1.2, duration: 0.6, repeat: 2 }}
            >
              +{xpEarned} XP
            </motion.p>
            <div className="flex justify-center gap-1 mt-1">
              {Array.from({ length: Math.min(xpEarned / 5, 10) }).map((_, i) => (
                <motion.span
                  key={i}
                  className="text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + i * 0.1 }}
                >
                  ✨
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Score */}
        <div className="mt-4 space-y-3">
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-cream/60 text-sm">Score</p>
            <p className="text-3xl font-heading font-bold">{correct}/{total}</p>
            <p className="text-cream/60">{pct}% correct</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-black/20 rounded-xl p-3"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-cream/60 text-sm">XP Earned</p>
              <p className="text-2xl font-heading font-bold text-golden">+{xpEarned}</p>
            </motion.div>
            <motion.div
              className="bg-black/20 rounded-xl p-3"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-cream/60 text-sm">Coins</p>
              <p className="text-2xl font-heading font-bold text-golden">+{coins} 🪙</p>
            </motion.div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <XPBar xp={xp} />
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/quiz/${topicFile}/${difficulty}`, { replace: true })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-golden to-golden-dark
              font-heading font-bold text-jungle-dark text-lg shadow-lg"
          >
            🔄 Retry
          </motion.button>
          <button
            onClick={() => navigate(`/category/${topicFile}`)}
            className="w-full py-3 rounded-xl bg-jungle/60 hover:bg-jungle/80
              font-heading font-bold transition-all"
          >
            📋 Category
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-earth/40 hover:bg-earth/60
              font-heading font-bold transition-all"
          >
            🗺 Back to Map
          </button>
        </div>
      </motion.div>
    </div>
  );
}
