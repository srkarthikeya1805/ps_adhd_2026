import React, { useEffect, useRef } from 'react';

interface SynapseSpark {
  x: number;
  y: number;
  angle: number;
  speed: number;
  distance: number;
  maxDistance: number;
  radius: number;
  color: string;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic sparks radiating along the neural tendrils in the user's image
    const sparks: SynapseSpark[] = [];
    const colors = ['#71BBFD', '#20BFE8', '#0087FF', '#FFFFFF', '#A9D7FF'];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const moveX = (e.clientX / width - 0.5) * 12;
      const moveY = (e.clientY / height - 0.5) * 12;
      containerRef.current.style.transform = `scale(1.04) translate(${moveX}px, ${moveY}px)`;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn action potential pulses from center outwards along the user's neural paths
      if (sparks.length < 28 && Math.random() < 0.28) {
        const angle = Math.random() * Math.PI * 2;
        sparks.push({
          x: width * 0.5 + Math.cos(angle) * 30,
          y: height * 0.5 + Math.sin(angle) * 30,
          angle,
          speed: 1.2 + Math.random() * 2.2,
          distance: 30,
          maxDistance: Math.max(width, height) * (0.35 + Math.random() * 0.35),
          radius: 1.2 + Math.random() * 2.0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Update and draw traveling pulses
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.distance += s.speed;
        s.x = width * 0.5 + Math.cos(s.angle) * s.distance;
        s.y = height * 0.5 + Math.sin(s.angle) * s.distance;

        const progress = s.distance / s.maxDistance;
        if (progress >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        const alpha = Math.sin(progress * Math.PI);

        // Outer glow
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright nucleus
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#000214]">
      {/* 1. User Uploaded Neural Synapses Artwork as Global Background Theme (Balanced Sci-Fi Luminescence) */}
      <div
        ref={containerRef}
        className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] transition-transform duration-700 ease-out will-change-transform"
        style={{
          backgroundImage: 'url(/images/neural_synapse_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.28,
          mixBlendMode: 'screen',
          filter: 'brightness(0.85) contrast(1.10) saturate(1.05)',
        }}
      />

      {/* 2. Soft Ambient Vignette for Optimal Readability & Depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(0, 4, 30, 0.45) 0%, rgba(0, 4, 25, 0.72) 55%, rgba(0, 2, 20, 0.94) 100%)',
        }}
      />

      {/* 3. Subtle Cybernetic Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #71BBFD 1px, transparent 1px), linear-gradient(to bottom, #71BBFD 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 4. Bioluminescent Sparks Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
