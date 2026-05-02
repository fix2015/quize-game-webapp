import { motion } from 'framer-motion';

interface AnswerButtonProps {
  text: string;
  index: number;
  state: 'idle' | 'correct' | 'wrong' | 'revealed' | 'disabled';
  onClick: () => void;
}

const colors = [
  'from-jungle-light to-jungle',
  'from-sky to-blue-600',
  'from-tropical to-orange-700',
];

const stateStyles: Record<string, string> = {
  idle: 'hover:scale-105 cursor-pointer',
  correct: 'ring-4 ring-success bg-gradient-to-r from-success to-green-600 scale-105',
  wrong: 'ring-4 ring-error bg-gradient-to-r from-error to-red-700',
  revealed: 'ring-4 ring-success bg-gradient-to-r from-success to-green-600 opacity-70',
  disabled: 'opacity-50 cursor-not-allowed',
};

export default function AnswerButton({ text, index, state, onClick }: AnswerButtonProps) {
  const baseGradient = state === 'idle' || state === 'disabled'
    ? `bg-gradient-to-r ${colors[index % 3]}`
    : '';

  return (
    <motion.button
      onClick={state === 'idle' ? onClick : undefined}
      className={`w-full py-4 px-6 rounded-2xl text-cream font-heading font-bold text-lg shadow-lg
        transition-all duration-200 ${baseGradient} ${stateStyles[state]}`}
      animate={state === 'wrong' ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      whileTap={state === 'idle' ? { scale: 0.95 } : {}}
    >
      {text}
    </motion.button>
  );
}
