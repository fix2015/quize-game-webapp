import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function StarRating({ stars, size = 'md', animated = false }: StarRatingProps) {
  const sizeClass = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`flex gap-1 justify-center ${sizeClass}`}>
      {[1, 2, 3].map((i) => (
        animated ? (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.3, type: 'spring', stiffness: 200 }}
          >
            {i <= stars ? '⭐' : '☆'}
          </motion.span>
        ) : (
          <span key={i}>{i <= stars ? '⭐' : '☆'}</span>
        )
      ))}
    </div>
  );
}
