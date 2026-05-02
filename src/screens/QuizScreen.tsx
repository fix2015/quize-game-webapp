import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../hooks/useQuiz';
import { useTimer } from '../hooks/useTimer';
import { useGameStore } from '../store/gameStore';
import type { PowerUps } from '../store/gameStore';
import { TIMER_SECONDS } from '../data/levels';
import { generateChoices } from '../utils/wrongAnswers';
import { calculateXP, calculateStars, calculateCoins, calculatePerfectBonus } from '../utils/scoring';
import QuizPhoto from '../components/QuizPhoto';
import AnswerButton from '../components/AnswerButton';
import TimerBar from '../components/TimerBar';
import StreakBadge from '../components/StreakBadge';
import LivesDisplay from '../components/LivesDisplay';
import PowerUpBar from '../components/PowerUpBar';
import { useSound } from '../hooks/useSound';

type AnswerState = 'idle' | 'correct' | 'wrong' | 'revealed' | 'disabled';

export default function QuizScreen() {
  const { topicFile, difficulty } = useParams<{ topicFile: string; difficulty: string }>();
  const navigate = useNavigate();
  const { questions, allTopicQuestions, currentQuestion, currentIndex, total, isFinished, loading, startQuiz, nextQuestion } = useQuiz();
  const { lives, loseLife, addXP, addCoins, completeQuiz, addStats, updateStreak, unlockAchievement, powerUps, usePowerUp, recordFastAnswer } = useGameStore();

  const { startBgMusic, stopBgMusic, playCorrect, playWrong } = useSound();

  const [choices, setChoices] = useState<string[]>([]);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>([]);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintLetter, setHintLetter] = useState<string | null>(null);
  const [removedChoice, setRemovedChoice] = useState<number | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const answered = useRef(false);

  const handleTimeUp = useCallback(() => {
    if (answered.current) return;
    answered.current = true;
    handleWrongAnswer(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, choices]);

  const timerSeconds = TIMER_SECONDS[difficulty || 'easy'] || 10;
  const { timeLeft, progress, start: startTimer, stop: stopTimer, addTime, getElapsed } = useTimer(timerSeconds, handleTimeUp);

  // Stop bg music on unmount
  useEffect(() => {
    return () => { stopBgMusic(); };
  }, [stopBgMusic]);

  // Load quiz
  useEffect(() => {
    if (topicFile && difficulty) {
      startQuiz(topicFile, difficulty);
    }
  }, [topicFile, difficulty, startQuiz]);

  // Setup choices for current question
  useEffect(() => {
    if (currentQuestion && questions.length > 0) {
      const allQs = allTopicQuestions.length > 0 ? allTopicQuestions : questions;
      const qIndex = allQs.findIndex((q) => q.answer === currentQuestion.answer);
      const newChoices = generateChoices(allQs, qIndex >= 0 ? qIndex : currentIndex);
      setChoices(newChoices);
      setAnswerStates(newChoices.map(() => 'idle'));
      setShowFeedback(false);
      setHintLetter(null);
      setRemovedChoice(null);
      answered.current = false;
      startTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, currentIndex]);

  function handleWrongAnswer(choiceIndex: number) {
    if (!currentQuestion) return;
    const correctIdx = choices.indexOf(currentQuestion.answer);
    setAnswerStates(
      choices.map((_, i) =>
        i === choiceIndex ? 'wrong' : i === correctIdx ? 'revealed' : 'disabled'
      )
    );
    stopTimer();
    setStreak(0);
    loseLife();
    playWrong();
    setShowFeedback(true);

    setTimeout(() => {
      if (lives <= 1) {
        finishQuiz(correctCount, total);
      } else {
        nextQuestion();
      }
    }, 1500);
  }

  function handleAnswer(choiceIndex: number) {
    if (answered.current || showFeedback) return;
    answered.current = true;
    stopTimer();

    const selected = choices[choiceIndex];
    const isCorrect = selected === currentQuestion?.answer;

    if (isCorrect) {
      // Start background music on first correct answer (needs user gesture)
      if (!musicStarted) {
        startBgMusic();
        setMusicStarted(true);
      }
      playCorrect();
      const elapsed = getElapsed();
      const newStreak = streak + 1;
      const xp = calculateXP(difficulty || 'easy', true, elapsed, newStreak);

      setAnswerStates(choices.map((_, i) => (i === choiceIndex ? 'correct' : 'disabled')));
      setStreak(newStreak);
      setCorrectCount((c) => c + 1);
      setXpGained((x) => x + xp);
      addXP(xp);
      updateStreak(newStreak);

      if (elapsed < 2) recordFastAnswer();
      if (newStreak === 5) unlockAchievement('hot_streak');
      if (newStreak === 10) unlockAchievement('on_fire');
      if (newStreak === 20) unlockAchievement('legendary');

      setShowFeedback(true);
      setTimeout(() => nextQuestion(), 1200);
    } else {
      handleWrongAnswer(choiceIndex);
    }
  }

  function finishQuiz(correct: number, totalQ: number) {
    const stars = calculateStars(correct, totalQ);
    const coins = calculateCoins(correct, stars);
    const perfectBonus = calculatePerfectBonus(stars);

    addCoins(coins);
    addXP(perfectBonus);
    addStats(correct, totalQ);
    if (topicFile && difficulty) {
      completeQuiz(topicFile, difficulty, stars);
    }
    unlockAchievement('first_steps');
    if (stars === 3 && difficulty === 'hard') unlockAchievement('sharpshooter');

    stopBgMusic();
    navigate(`/results`, {
      state: { correct, total: totalQ, stars, coins, xp: xpGained + perfectBonus, topicFile, difficulty },
    });
  }

  // Handle quiz end
  useEffect(() => {
    if (isFinished) {
      finishQuiz(correctCount, total);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  function handlePowerUp(type: keyof PowerUps) {
    if (showFeedback || !currentQuestion) return;
    const used = usePowerUp(type);
    if (!used) return;

    if (type === 'extraTime') {
      addTime(5);
    } else if (type === 'fiftyFifty') {
      const correctIdx = choices.indexOf(currentQuestion.answer);
      const wrongIndices = choices
        .map((_, i) => i)
        .filter((i) => i !== correctIdx && i !== removedChoice);
      if (wrongIndices.length > 0) {
        const removeIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        setRemovedChoice(removeIdx);
        setAnswerStates((prev) =>
          prev.map((s, i) => (i === removeIdx ? 'disabled' : s))
        );
      }
    } else if (type === 'hint') {
      setHintLetter(currentQuestion.answer[0]);
      setTimeout(() => setHintLetter(null), 2000);
    } else if (type === 'extraLife') {
      // Handled via store
      useGameStore.setState((s) => ({ lives: Math.min(5, s.lives + 1) }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-golden border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate('/')} className="text-cream/60 hover:text-cream font-heading text-sm">
          ✕ Quit
        </button>
        <span className="font-heading font-bold text-cream/80">
          {currentIndex + 1}/{total}
        </span>
        <div className="flex items-center gap-2">
          {streak > 0 && <span className="text-golden font-bold">🔥 {streak}</span>}
          <LivesDisplay lives={lives} />
        </div>
      </div>

      {/* Timer */}
      <TimerBar progress={progress} timeLeft={timeLeft} />

      {/* Streak Badge */}
      <div className="h-8 flex items-center justify-center">
        <StreakBadge streak={streak} />
      </div>

      {/* Photo */}
      <QuizPhoto answer={currentQuestion.answer} />

      {/* Hint */}
      <AnimatePresence>
        {hintLetter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mt-2 font-heading font-bold text-golden text-lg"
          >
            Starts with: "{hintLetter}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP feedback */}
      <AnimatePresence>
        {showFeedback && answerStates.includes('correct') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0 }}
            className="text-center text-golden font-bold font-heading text-lg"
          >
            +{calculateXP(difficulty || 'easy', true, 0, streak)} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Buttons */}
      <div className="flex-1 flex flex-col justify-center gap-3 mt-4">
        {choices.map((choice, i) => {
          if (i === removedChoice && answerStates[i] === 'disabled') {
            return <div key={i} className="h-14" />;
          }
          return (
            <AnswerButton
              key={`${currentIndex}-${i}`}
              text={choice}
              index={i}
              state={answerStates[i]}
              onClick={() => handleAnswer(i)}
            />
          );
        })}
      </div>

      {/* Power-ups */}
      <div className="mt-4 mb-2">
        <PowerUpBar powerUps={powerUps} onUse={handlePowerUp} disabled={showFeedback} />
      </div>
    </div>
  );
}
