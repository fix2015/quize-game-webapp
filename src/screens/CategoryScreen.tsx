import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { worlds } from '../data/worlds';
import StarRating from '../components/StarRating';

interface QuestionRaw {
  answer: string;
  search: string;
  difficulty: string;
}

const difficultyMeta = [
  { key: 'easy', label: 'Easy', emoji: '🟢', color: 'from-success to-green-700' },
  { key: 'medium', label: 'Medium', emoji: '🟡', color: 'from-golden to-yellow-700' },
  { key: 'hard', label: 'Hard', emoji: '🔴', color: 'from-error to-red-800' },
];

export default function CategoryScreen() {
  const { topicFile } = useParams<{ topicFile: string }>();
  const navigate = useNavigate();
  const { completedQuizzes } = useGameStore();
  const [availableDiffs, setAvailableDiffs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const topic = worlds
    .flatMap((w) => w.topics)
    .find((t) => t.file === topicFile);

  // Load topic to check which difficulties exist
  useEffect(() => {
    if (!topicFile) return;
    setLoading(true);
    fetch(`https://gport.s3.eu-central-1.amazonaws.com/jungle-guess/topics/${topicFile}.json`)
      .then((r) => r.json())
      .then((data: QuestionRaw[]) => {
        const diffs = new Set(data.map((q) => q.difficulty));
        setAvailableDiffs(Array.from(diffs));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicFile]);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Topic not found</p>
      </div>
    );
  }

  const progress = completedQuizzes[topic.file] || { easy: 0, medium: 0, hard: 0 };

  // If only one difficulty exists, show a single "Play" button
  const hasSingleDifficulty = availableDiffs.length === 1;

  const isUnlocked = (diff: string) => {
    // If topic has only one difficulty, always unlocked
    if (hasSingleDifficulty) return true;
    if (diff === 'easy') return true;
    if (diff === 'medium') return progress.easy >= 2;
    if (diff === 'hard') return progress.medium >= 2;
    return false;
  };

  const visibleDiffs = hasSingleDifficulty
    ? difficultyMeta.filter((d) => d.key === availableDiffs[0])
    : difficultyMeta.filter((d) => availableDiffs.includes(d.key));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-jungle-dark/80 backdrop-blur rounded-3xl p-8 max-w-md w-full shadow-2xl border border-jungle-light/30"
      >
        <button
          onClick={() => navigate('/')}
          className="text-cream/60 hover:text-cream mb-4 text-sm font-heading"
        >
          ← Back to Map
        </button>

        <h1 className="text-3xl font-heading font-bold text-golden mb-6 text-center">
          {topic.name}
        </h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-golden border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {visibleDiffs.map((diff) => {
              const locked = !isUnlocked(diff.key);
              const stars = progress[diff.key as keyof typeof progress];

              return (
                <motion.button
                  key={diff.key}
                  whileHover={locked ? {} : { scale: 1.03 }}
                  whileTap={locked ? {} : { scale: 0.97 }}
                  onClick={() => {
                    if (!locked) {
                      navigate(`/quiz/${topic.file}/${diff.key}`);
                    }
                  }}
                  className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all
                    ${locked
                      ? 'bg-black/40 opacity-50 cursor-not-allowed'
                      : `bg-gradient-to-r ${diff.color} shadow-lg cursor-pointer`
                    }`}
                >
                  <span className="text-2xl">{locked ? '🔒' : diff.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-heading font-bold text-lg">
                      {hasSingleDifficulty ? 'Play' : diff.label}
                    </p>
                    {locked && (
                      <p className="text-xs text-cream/60">
                        {diff.key === 'medium' ? 'Complete Easy with 2+ stars' : 'Complete Medium with 2+ stars'}
                      </p>
                    )}
                    {!locked && (
                      <p className="text-xs text-cream/70">
                        {availableDiffs.length === 1
                          ? `${availableDiffs[0].charAt(0).toUpperCase() + availableDiffs[0].slice(1)} questions`
                          : `${diff.label} questions`}
                      </p>
                    )}
                  </div>
                  {stars > 0 && <StarRating stars={stars} size="sm" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
