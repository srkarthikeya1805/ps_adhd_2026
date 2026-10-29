import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, FastForward, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

interface CinematicOpeningIntroProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const CinematicOpeningIntro: React.FC<CinematicOpeningIntroProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const [phase, setPhase] = useState<'loading' | 'video' | 'complete'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('INITIALIZING NEURAL NETWORKS');
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if intro has already been viewed in this session
  useEffect(() => {
    if (!forcePlay) {
      const viewed = sessionStorage.getItem('neuroscan_intro_viewed');
      if (viewed === 'true') {
        onComplete();
        return;
      }
    }

    // Preload video immediately
    if (videoRef.current) {
      videoRef.current.load();
    }

    // Phase 1: Fast Futuristic Loading Sequence (~800ms)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 6;
      setLoadingProgress(Math.min(progress, 100));

      if (progress < 30) {
        setLoadingStepText('INITIALIZING BLUE NEURAL PARTICLE MATRIX');
      } else if (progress < 65) {
        setLoadingStepText('CALIBRATING 19-CHANNEL 10-20 CORTICAL TELEMETRY');
      } else if (progress < 90) {
        setLoadingStepText('LOADING 3D BRAIN ANATOMICAL RECONSTRUCTION');
      } else {
        setLoadingStepText('SYNCHRONIZATION COMPLETE • COMMENCING FEED');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setPhase('video');
      }
    }, 35);

    return () => clearInterval(interval);
  }, [forcePlay, onComplete]);

  // Loading Screen Canvas: Animated Blue Neural Particles
  useEffect(() => {
    if (phase !== 'loading') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#087CFF', '#20BFE8', '#79DFFF', '#F3F8FF'];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Deep navy background gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
      bgGrad.addColorStop(0, '#061426');
      bgGrad.addColorStop(1, '#030914');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Connecting nerve lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0) p1.x = w;
        if (p1.x > w) p1.x = 0;
        if (p1.y < 0) p1.y = h;
        if (p1.y > h) p1.y = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(32, 191, 232, ${(1 - dist / 120) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Particle Glow
        ctx.fillStyle = p1.color;
        ctx.shadowColor = p1.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase]);

  // Video Autoplay handling
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = isMuted;
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Autoplay prevented by browser:', err);
            setAutoplayBlocked(true);
          });
      }
    }
  }, [phase, isMuted]);

  const handleFinish = () => {
    sessionStorage.setItem('neuroscan_intro_viewed', 'true');
    setPhase('complete');
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setAutoplayBlocked(false);
      });
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#030914] text-[#F3F8FF] flex flex-col items-center justify-center overflow-hidden select-none"
        >
          {/* Phase 1: Blue Neural Particle Loading Animation */}
          {phase === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
            >
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center space-y-6">
                {/* Glowing Core Radar / Synapse Icon */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-[#20BFE8]/30 animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-dashed border-[#087CFF]/50 animate-[spin_10s_linear_infinite_reverse]" />
                  <div className="absolute inset-4 rounded-full bg-[#087CFF]/15 animate-ping opacity-60" />
                  <div className="w-12 h-12 rounded-full bg-[#030914] border border-[#20BFE8] flex items-center justify-center shadow-[0_0_25px_rgba(32,191,232,0.8)]">
                    <Activity className="w-6 h-6 text-[#20BFE8] animate-pulse" />
                  </div>
                </div>

                {/* System Title */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono tracking-[0.25em] text-[#20BFE8] uppercase font-semibold">
                    NEUROSCAN AI • CLINICAL SUITE
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#F3F8FF] tracking-tight">
                    Initializing Neural Cortex
                  </h2>
                </div>

                {/* High-Tech Progress Bar */}
                <div className="w-full space-y-2">
                  <div className="h-1.5 w-full bg-[#061426] rounded-full overflow-hidden border border-[#20BFE8]/25 p-[1px]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#087CFF] via-[#20BFE8] to-[#79DFFF] shadow-[0_0_15px_#20BFE8]"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A5B8CC]">
                    <span className="tracking-wider">{loadingStepText}</span>
                    <span className="text-[#20BFE8] font-bold">{loadingProgress}%</span>
                  </div>
                </div>

                {/* Skip button right away if user is in a hurry */}
                <button
                  onClick={handleFinish}
                  className="text-xs font-mono text-slate-500 hover:text-[#20BFE8] transition-colors pt-4 tracking-wider uppercase underline underline-offset-4 cursor-pointer"
                >
                  Skip Directly to Dashboard →
                </button>
              </div>
            </motion.div>
          )}

          {/* Phase 2: HTML5 Video Playback of Supplied Video Asset (Full-screen Cover) */}
          <div
            className={`absolute inset-0 w-full h-full flex items-center justify-center bg-[#030914] ${
              phase === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity duration-700`}
          >
            {/* HTML5 Video Element - Fullscreen Cover */}
            <video
              ref={videoRef}
              src="/videos/combined_final_video.mp4"
              preload="auto"
              playsInline
              autoPlay
              muted={isMuted}
              onLoadedMetadata={(e) => {
                setVideoDuration(e.currentTarget.duration || 30);
                setVideoLoaded(true);
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
              }}
              onEnded={handleFinish}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark Vignette Overlay for Seamless Cinematic Lighting */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(3,9,20,0.85)_100%)]" />

              {/* Top HUD Overlay: Telemetry & Branding */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30 pointer-events-none">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#030914]/80 border border-[#20BFE8]/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#20BFE8] animate-ping" />
                  <span className="font-heading font-bold text-sm tracking-widest text-[#F3F8FF]">
                    NEUROSCAN AI
                  </span>
                  <span className="text-[10px] font-mono text-[#A5B8CC] hidden sm:inline">
                    • 19-CH CINEMATIC OVERVIEW
                  </span>
                </div>

                {/* Right Controls: Sound & Skip */}
                <div className="flex items-center gap-3 pointer-events-auto">
                  <button
                    onClick={toggleSound}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    className="p-2.5 rounded-full bg-[#030914]/80 border border-slate-700 hover:border-[#20BFE8] text-[#A5B8CC] hover:text-[#F3F8FF] backdrop-blur-xl transition-all shadow-lg cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#20BFE8]" />}
                  </button>

                  <button
                    onClick={handleFinish}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#030914]/80 border border-[#20BFE8]/40 hover:border-[#20BFE8] hover:bg-[#087CFF]/20 text-xs font-mono font-bold text-[#F3F8FF] backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(32,191,232,0.25)] cursor-pointer"
                  >
                    <span>ENTER DASHBOARD</span>
                    <FastForward className="w-3.5 h-3.5 text-[#20BFE8]" />
                  </button>
                </div>
              </div>

              {/* Autoplay Blocked Fallback Overlay */}
              {autoplayBlocked && (
                <div className="absolute inset-0 bg-[#030914]/85 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#087CFF]/20 border border-[#20BFE8] flex items-center justify-center shadow-[0_0_30px_#20BFE8]">
                    <Play className="w-8 h-8 text-[#20BFE8] ml-1" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Click to Begin Cinematic Intro
                  </h3>
                  <p className="text-xs font-mono text-[#A5B8CC] max-w-sm">
                    Browser audio policy requires user interaction before media playback.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleManualPlay}
                      className="px-6 py-2.5 rounded-full bg-[#087CFF] hover:bg-[#20BFE8] text-[#030914] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(32,191,232,0.5)] cursor-pointer"
                    >
                      Play Cinematic Video
                    </button>
                    <button
                      onClick={handleFinish}
                      className="px-5 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-[#A5B8CC] hover:text-white font-mono text-xs transition-all cursor-pointer"
                    >
                      Skip to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Video Progress Scrub Line */}
              <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
                <div className="max-w-2xl mx-auto space-y-1.5">
                  <div className="h-1 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#087CFF] to-[#20BFE8] transition-all duration-200"
                      style={{
                        width: videoDuration > 0 ? `${(currentTime / videoDuration) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#A5B8CC]/80">
                    <span>3D BRAIN RECONSTRUCTION</span>
                    <span>
                      {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
};
