import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds: number, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  const startTimeRef = useRef(0);
  onTimeUpRef.current = onTimeUp;

  const start = useCallback(() => {
    setTimeLeft(initialSeconds);
    startTimeRef.current = Date.now();
    setRunning(true);
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft((t) => t + seconds);
  }, []);

  const getElapsed = useCallback(() => {
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setRunning(false);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [running]);

  const progress = timeLeft / initialSeconds;

  return { timeLeft, progress, running, start, stop, addTime, getElapsed };
}
