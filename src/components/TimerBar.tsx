import { motion } from 'framer-motion';

interface TimerBarProps {
  progress: number;
  timeLeft: number;
}

export default function TimerBar({ progress, timeLeft }: TimerBarProps) {
  const color = progress > 0.6 ? '#66BB6A' : progress > 0.3 ? '#FDD835' : '#EF5350';
  const pulse = timeLeft <= 3;

  return (
    <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          width: `${progress * 100}%`,
          opacity: pulse ? [1, 0.5, 1] : 1,
        }}
        transition={{
          width: { duration: 0.1, ease: 'linear' },
          opacity: pulse ? { duration: 0.5, repeat: Infinity } : {},
        }}
      />
    </div>
  );
}
