import { useState, useCallback } from 'react';

export interface Question {
  answer: string;
  search: string;
  difficulty: string;
}

export async function loadTopic(topicName: string): Promise<Question[]> {
  const response = await fetch(`https://gport.s3.eu-central-1.amazonaws.com/jungle-guess/topics/${topicName}.json`);
  return response.json();
}

export function filterByDifficulty(questions: Question[], difficulty: string): Question[] {
  return questions.filter((q) => q.difficulty === difficulty);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allTopicQuestions, setAllTopicQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const startQuiz = useCallback(async (topicFile: string, difficulty: string) => {
    setLoading(true);
    const data = await loadTopic(topicFile);
    setAllTopicQuestions(data);
    const filtered = filterByDifficulty(data, difficulty);
    // If no questions match this difficulty, use all questions from the topic
    const toUse = filtered.length > 0 ? filtered : data;
    setQuestions(shuffle(toUse));
    setCurrentIndex(0);
    setLoading(false);
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const currentQuestion = questions[currentIndex] || null;
  const isFinished = currentIndex >= questions.length && questions.length > 0;
  const total = questions.length;

  return {
    questions,
    allTopicQuestions,
    currentQuestion,
    currentIndex,
    total,
    isFinished,
    loading,
    startQuiz,
    nextQuestion,
  };
}
