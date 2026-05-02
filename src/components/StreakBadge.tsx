import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 3) return null;

  const label =
    streak >= 10 ? '🔥🔥🔥 LEGENDARY!' :
    streak >= 5 ? '🔥🔥 UNSTOPPABLE!' :
    '🔥 ON FIRE!';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="text-center font-heading font-bold text-golden text-xl"
      >
        {label}
      </motion.div>
    </AnimatePresence>
  );
}
