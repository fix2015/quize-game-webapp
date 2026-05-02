import { useState } from 'react';
import { motion } from 'framer-motion';
import { getImageFallbacks } from '../utils/imageLoader';

interface QuizPhotoProps {
  answer: string;
}

export default function QuizPhoto({ answer }: QuizPhotoProps) {
  const fallbacks = getImageFallbacks(answer);
  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    if (srcIndex < fallbacks.length - 1) {
      setSrcIndex((i) => i + 1);
    }
  };

  return (
    <motion.div
      className="relative w-full aspect-[4/3] max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black/30"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      key={answer}
    >
      <img
        src={fallbacks[srcIndex]}
        alt="Guess what this is"
        className={`w-full h-full object-cover transition-all duration-700 ${loaded ? 'blur-0' : 'blur-md'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-golden border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
