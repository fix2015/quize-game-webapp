import type { Question } from '../hooks/useQuiz';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateChoices(questions: Question[], currentIndex: number): string[] {
  const correct = questions[currentIndex].answer;
  const others = questions
    .filter((_, i) => i !== currentIndex)
    .map((q) => q.answer);

  const wrong = shuffle(others).slice(0, 2);
  return shuffle([correct, ...wrong]);
}
