import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  pulseSpeed: number;
  pulsePhase: number;
  isSynapse: boolean;
  flash: number; // 0 to 1 flash intensity
}

interface Pulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isMobile ? 90 : 210;
    const maxDistance = isMobile ? 120 : 170;

    // Vibrant neon palette matching user reference image
    const palette = [
      { color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.85)' },    // Electric Cyan
      { color: '#287BFF', glow: 'rgba(40, 123, 255, 0.85)' },   // Deep Royal Blue
      { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.85)' },  // Electric Violet
      { color: '#F02BD5', glow: 'rgba(240, 43, 213, 0.85)' },  // Neon Magenta
      { color: '#FF65D4', glow: 'rgba(255, 101, 212, 0.85)' },  // Hot Pink
      { color: '#35F5C8', glow: 'rgba(53, 245, 200, 0.85)' },   // Mint / Bio-Teal
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const z = 0.6 + Math.random() * 1.5;
      const theme = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        vx: (Math.random() - 0.5) * 0.65 * z,
        vy: (Math.random() - 0.5) * 0.65 * z,
        baseRadius: (2.0 + Math.random() * 3.5) * z,
        color: theme.color,
        glowColor: theme.glow,
        pulseSpeed: 1.5 + Math.random() * 2.8,
        pulsePhase: Math.random() * Math.PI * 2,
        isSynapse: Math.random() < 0.35, // 35% are prominent firing synapses
        flash: 0,
      });
    }

    const pulses: Pulse[] = [];
    const maxPulses = isMobile ? 18 : 48;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / width - 0.5) * 50;
      mouseRef.current.targetY = (e.clientY / height - 0.5) * 50;
      mouseRef.current.active = true;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Mouse parallax smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // -------------------------------------------------------------
      // 1. Cosmic Colorful Nebula Clouds in Deep Background
      // -------------------------------------------------------------
      const n1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, 420);
      n1.addColorStop(0, 'rgba(0, 229, 255, 0.08)');
      n1.addColorStop(0.6, 'rgba(40, 123, 255, 0.03)');
      n1.addColorStop(1, 'transparent');
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, width, height);

      const n2 = ctx.createRadialGradient(width * 0.8, height * 0.65, 20, width * 0.8, height * 0.65, 450);
      n2.addColorStop(0, 'rgba(240, 43, 213, 0.08)');
      n2.addColorStop(0.6, 'rgba(139, 92, 246, 0.03)');
      n2.addColorStop(1, 'transparent');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, width, height);

      const n3 = ctx.createRadialGradient(width * 0.5, height * 0.15, 20, width * 0.5, height * 0.15, 360);
      n3.addColorStop(0, 'rgba(139, 92, 246, 0.06)');
      n3.addColorStop(1, 'transparent');
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // 2. Update and Draw Interconnected Axon / Dendrite Filaments
      // -------------------------------------------------------------
      const activePairs: [number, number, number][] = [];
      for (let i = 0; i < particleCount; i++) {
        const pi = particles[i];
        const xi = pi.x + mx * pi.z;
        const yi = pi.y + my * pi.z;

        for (let j = i + 1; j < particleCount; j++) {
          const pj = particles[j];
          const xj = pj.x + mx * pj.z;
          const yj = pj.y + my * pj.z;

          const dx = xi - xj;
          const dy = yi - yj;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const norm = 1 - dist / maxDistance;
            const alpha = norm * norm * 0.55;

            // Two-color glowing gradient filament between connected neurons
            const lineGrad = ctx.createLinearGradient(xi, yi, xj, yj);
            lineGrad.addColorStop(0, pi.color);
            lineGrad.addColorStop(1, pj.color);

            ctx.strokeStyle = lineGrad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = norm * 2.2;
            ctx.beginPath();
            ctx.moveTo(xi, yi);
            ctx.lineTo(xj, yj);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            activePairs.push([i, j, dist]);
          }
        }
      }

      // -------------------------------------------------------------
      // 3. Update and Draw Moving Neuron Somas & Firing Synapses
      // -------------------------------------------------------------
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around viewport edges smoothly
        if (p.x < -40) p.x = width + 40;
        else if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        else if (p.y > height + 40) p.y = -40;

        const posX = p.x + mx * p.z;
        const posY = p.y + my * p.z;

        // Random synaptic firing flare
        if (p.isSynapse && Math.random() < 0.012) {
          p.flash = 1.0;
        } else {
          p.flash *= 0.92;
        }

        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase);
        const radius = p.baseRadius * (1 + 0.35 * pulse + 0.6 * p.flash);

        // Radiant Outer Corona Glow
        const glowRad = radius * (p.isSynapse ? 5.5 : 3.8);
        const grad = ctx.createRadialGradient(posX, posY, 0, posX, posY, glowRad);
        grad.addColorStop(0, p.glowColor);
        grad.addColorStop(0.4, p.glowColor.replace('0.85', '0.35'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(posX, posY, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Neuron Body
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.isSynapse ? 16 : 8;
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Hot White Synaptic Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(posX, posY, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // -------------------------------------------------------------
      // 4. Randomly Spawn Fast Electrical Action Potentials (Sparks)
      // -------------------------------------------------------------
      if (pulses.length < maxPulses && activePairs.length > 0 && Math.random() < 0.32) {
        const pair = activePairs[Math.floor(Math.random() * activePairs.length)];
        const p1 = particles[pair[0]];
        const p2 = particles[pair[1]];
        pulses.push({
          fromIdx: pair[0],
          toIdx: pair[1],
          progress: 0,
          speed: 0.025 + Math.random() * 0.045, // fast electric speed
          color: Math.random() > 0.5 ? p1.color : p2.color,
          size: 3.0 + Math.random() * 3.0,
        });
      }

      // -------------------------------------------------------------
      // 5. Update and Draw Travelling Electrical Pulses
      // -------------------------------------------------------------
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(k, 1);
          continue;
        }

        const pA = particles[pulse.fromIdx];
        const pB = particles[pulse.toIdx];
        if (!pA || !pB) {
          pulses.splice(k, 1);
          continue;
        }

        const ax = pA.x + mx * pA.z;
        const ay = pA.y + my * pA.z;
        const bx = pB.x + mx * pB.z;
        const by = pB.y + my * pB.z;

        const px = ax + (bx - ax) * pulse.progress;
        const py = ay + (by - ay) * pulse.progress;

        // Bright white-hot spark center
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(px, py, pulse.size, 0, Math.PI * 2);
        ctx.fill();

        // Radiant electric corona
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(px, py, pulse.size * 2.0, 0, Math.PI * 2);
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh', opacity: 1.0 }}
    />
  );
};
