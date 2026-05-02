import { useRef, useCallback, useEffect } from 'react';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNote(ctx: AudioContext, freq: number, start: number, duration: number, type: OscillatorType = 'square', volume = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

// Fun kids background melody - loops a cheerful jungle-style tune
function createBackgroundLoop(ctx: AudioContext): { start: () => void; stop: () => void } {
  let intervalId: number | null = null;
  let playing = false;

  // Cheerful pentatonic melody notes (C major pentatonic)
  const melodyNotes = [
    523, 587, 659, 784, 880, 784, 659, 587, // C5 D5 E5 G5 A5 G5 E5 D5
    523, 659, 784, 880, 1047, 880, 784, 659, // C5 E5 G5 A5 C6 A5 G5 E5
    392, 440, 523, 587, 659, 587, 523, 440, // G4 A4 C5 D5 E5 D5 C5 A4
    523, 659, 523, 392, 440, 523, 659, 523, // C5 E5 C5 G4 A4 C5 E5 C5
  ];

  // Bass notes
  const bassNotes = [
    262, 262, 330, 330, 392, 392, 330, 330,
    262, 262, 330, 330, 392, 392, 330, 330,
    196, 196, 262, 262, 330, 330, 262, 262,
    262, 262, 262, 262, 196, 262, 330, 262,
  ];

  let noteIndex = 0;

  const playTick = () => {
    if (!playing) return;
    const now = ctx.currentTime;
    const note = melodyNotes[noteIndex % melodyNotes.length];
    const bass = bassNotes[noteIndex % bassNotes.length];

    // Melody
    playNote(ctx, note, now, 0.18, 'square', 0.04);
    // Bass
    playNote(ctx, bass, now, 0.2, 'triangle', 0.05);

    // Percussion - light hi-hat on every beat
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // Kick on every 4th beat
    if (noteIndex % 4 === 0) {
      const kick = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, now);
      kick.frequency.exponentialRampToValueAtTime(30, now + 0.1);
      kickGain.gain.setValueAtTime(0.1, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      kick.connect(kickGain);
      kickGain.connect(ctx.destination);
      kick.start(now);
      kick.stop(now + 0.15);
    }

    noteIndex++;
  };

  return {
    start: () => {
      if (playing) return;
      playing = true;
      noteIndex = 0;
      intervalId = window.setInterval(playTick, 220); // ~136 BPM
    },
    stop: () => {
      playing = false;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}

// Yahoo! celebration win sound
function playWinSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Rising triumphant arpeggio
  const winNotes = [523, 659, 784, 1047, 1319, 1568];
  winNotes.forEach((freq, i) => {
    playNote(ctx, freq, now + i * 0.1, 0.3, 'square', 0.07);
    playNote(ctx, freq * 0.5, now + i * 0.1, 0.3, 'triangle', 0.06);
  });

  // Big final chord
  const chordTime = now + 0.65;
  [523, 659, 784, 1047].forEach((freq) => {
    playNote(ctx, freq, chordTime, 1.0, 'square', 0.05);
    playNote(ctx, freq, chordTime, 1.2, 'triangle', 0.06);
  });

  // Sparkle effect
  for (let i = 0; i < 8; i++) {
    const sparkleFreq = 2000 + Math.random() * 3000;
    playNote(ctx, sparkleFreq, chordTime + 0.3 + i * 0.08, 0.15, 'sine', 0.03);
  }

  // "Yahoo" simulation - frequency sweep
  const yahoo = ctx.createOscillator();
  const yahooGain = ctx.createGain();
  yahoo.type = 'sawtooth';
  yahoo.frequency.setValueAtTime(400, now + 0.8);
  yahoo.frequency.linearRampToValueAtTime(900, now + 1.0);
  yahoo.frequency.linearRampToValueAtTime(600, now + 1.2);
  yahoo.frequency.linearRampToValueAtTime(1200, now + 1.4);
  yahooGain.gain.setValueAtTime(0.06, now + 0.8);
  yahooGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  yahoo.connect(yahooGain);
  yahooGain.connect(ctx.destination);
  yahoo.start(now + 0.8);
  yahoo.stop(now + 1.5);
}

// Sad lose sound
function playLoseSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Descending sad notes
  const sadNotes = [440, 415, 392, 349, 330, 262, 247];
  sadNotes.forEach((freq, i) => {
    playNote(ctx, freq, now + i * 0.2, 0.35, 'triangle', 0.07);
  });

  // Low wobble
  const wobble = ctx.createOscillator();
  const wobbleGain = ctx.createGain();
  wobble.type = 'sine';
  wobble.frequency.setValueAtTime(200, now + 1.0);
  wobble.frequency.linearRampToValueAtTime(100, now + 2.0);
  wobbleGain.gain.setValueAtTime(0.08, now + 1.0);
  wobbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
  wobble.connect(wobbleGain);
  wobbleGain.connect(ctx.destination);
  wobble.start(now + 1.0);
  wobble.stop(now + 2.2);

  // Sad "wah wah" trombone
  const trombone = ctx.createOscillator();
  const tromboneGain = ctx.createGain();
  trombone.type = 'sawtooth';
  trombone.frequency.setValueAtTime(250, now + 0.5);
  trombone.frequency.linearRampToValueAtTime(220, now + 0.9);
  trombone.frequency.setValueAtTime(230, now + 1.0);
  trombone.frequency.linearRampToValueAtTime(180, now + 1.5);
  tromboneGain.gain.setValueAtTime(0.04, now + 0.5);
  tromboneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
  trombone.connect(tromboneGain);
  tromboneGain.connect(ctx.destination);
  trombone.start(now + 0.5);
  trombone.stop(now + 1.6);
}

// Correct answer ding
function playCorrectSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  playNote(ctx, 880, now, 0.15, 'sine', 0.08);
  playNote(ctx, 1109, now + 0.1, 0.15, 'sine', 0.08);
  playNote(ctx, 1319, now + 0.18, 0.25, 'sine', 0.1);
}

// Wrong answer buzz
function playWrongSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  playNote(ctx, 200, now, 0.25, 'sawtooth', 0.06);
  playNote(ctx, 180, now + 0.15, 0.3, 'sawtooth', 0.05);
}

export function useSound() {
  const bgMusicRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const startBgMusic = useCallback(() => {
    const ctx = getAudioContext();
    if (bgMusicRef.current) bgMusicRef.current.stop();
    bgMusicRef.current = createBackgroundLoop(ctx);
    bgMusicRef.current.start();
  }, []);

  const stopBgMusic = useCallback(() => {
    bgMusicRef.current?.stop();
    bgMusicRef.current = null;
  }, []);

  const playWin = useCallback(() => {
    playWinSound(getAudioContext());
  }, []);

  const playLose = useCallback(() => {
    playLoseSound(getAudioContext());
  }, []);

  const playCorrect = useCallback(() => {
    playCorrectSound(getAudioContext());
  }, []);

  const playWrong = useCallback(() => {
    playWrongSound(getAudioContext());
  }, []);

  useEffect(() => {
    return () => {
      bgMusicRef.current?.stop();
    };
  }, []);

  return { startBgMusic, stopBgMusic, playWin, playLose, playCorrect, playWrong };
}
