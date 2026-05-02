import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  gravity: number;
  opacity: number;
  type: 'rect' | 'serpentine';
  waveAmplitude: number;
  waveSpeed: number;
  waveOffset: number;
}

interface ConfettiProps {
  active: boolean;
  type?: 'win' | 'lose';
}

const WIN_COLORS = ['#F9A825', '#66BB6A', '#29B6F6', '#FF6F00', '#E91E63', '#9C27B0', '#FF5722', '#00E676'];
const LOSE_COLORS = ['#78909C', '#546E7A', '#455A64', '#37474F', '#EF5350', '#90A4AE'];

export default function Confetti({ active, type = 'win' }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = type === 'win' ? WIN_COLORS : LOSE_COLORS;
    const particleCount = type === 'win' ? 150 : 60;

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const isSerpentine = type === 'win' && Math.random() > 0.4;
      particles.push({
        x: Math.random() * canvas.width,
        y: type === 'win' ? -20 - Math.random() * 200 : canvas.height + 20 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 6,
        vy: type === 'win' ? Math.random() * 2 + 1 : -(Math.random() * 2 + 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: isSerpentine ? 3 : Math.random() * 10 + 5,
        height: isSerpentine ? Math.random() * 30 + 20 : Math.random() * 10 + 5,
        gravity: type === 'win' ? 0.08 : -0.03,
        opacity: 1,
        type: isSerpentine ? 'serpentine' : 'rect',
        waveAmplitude: Math.random() * 3 + 1,
        waveSpeed: Math.random() * 0.05 + 0.02,
        waveOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      let allDone = true;
      for (const p of particlesRef.current) {
        // Update
        p.vy += p.gravity;
        p.x += p.vx + Math.sin(frame * p.waveSpeed + p.waveOffset) * p.waveAmplitude;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade after a while
        if (frame > 120) {
          p.opacity -= 0.008;
        }

        if (p.opacity <= 0) continue;
        if (p.y > canvas.height + 50 || p.y < -100) continue;
        allDone = false;

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === 'serpentine') {
          // Draw wavy serpentine ribbon
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          for (let j = 0; j < p.height; j += 2) {
            const sx = Math.sin((j + frame * 3) * 0.15) * 8;
            if (j === 0) ctx.moveTo(sx, j);
            else ctx.lineTo(sx, j);
          }
          ctx.stroke();
        } else {
          // Draw confetti rectangle
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }

        ctx.restore();
      }

      if (!allDone && frame < 350) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, type]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
