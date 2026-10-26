import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  Brain,
  CheckCircle2,
  Info,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { saveSession } from '../services/storage';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { AuraBounceHeading, AuraBounceBox } from '../components/common/AuraScrollText';

// ---------------------------------------------------------------------------
// Animated Left Panel Neural Waveform & Particles (Pure Cyan & Deep Blue)
// ---------------------------------------------------------------------------
const LoginNeuralArt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 360);
      const h = (canvas.height = 140);
      ctx.clearRect(0, 0, w, h);

      // Multi-layer sine waveform in pure cyan and neuroscience blue
      const layers = [
        { color: '#20BFE8', freq: 0.038, speed: 2.0, amp: 18, y: 70, width: 2.0 },
        { color: '#087CFF', freq: 0.055, speed: -1.6, amp: 14, y: 70, width: 1.6 },
        { color: '#79DFFF', freq: 0.085, speed: 2.4, amp: 10, y: 70, width: 1.4 },
      ];

      layers.forEach((l) => {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.width;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = l.y + Math.sin(x * l.freq + t * l.speed) * l.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Floating bio-luminescent sparks
      for (let i = 0; i < 9; i++) {
        const sx = (t * 35 + i * 42) % w;
        const sy = 70 + Math.sin(sx * 0.045 + t) * 22;
        ctx.fillStyle = i % 2 === 0 ? '#79DFFF' : '#20BFE8';
        ctx.shadowColor = '#20BFE8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[140px] rounded-2xl bg-[#030914]/80 border border-[#20BFE8]/25 shadow-inner"
    />
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submit handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password, or proceed via Research Demo Mode.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      saveSession({
        email,
        name: email.split('@')[0] || 'Research User',
        isGuest: false,
        role: 'Neuroscience Researcher',
        loginTime: new Date().toISOString(),
      });
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 500);
  };

  // One-click Guest Demo access handler
  const handleGuestAccess = () => {
    saveSession({
      email: 'demo.researcher@neuroscan.ai',
      name: 'Dr. Keerthi (Guest)',
      isGuest: true,
      role: 'Clinical AI Reviewer',
      loginTime: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen text-[#F3F8FF] flex flex-col relative z-10 selection:bg-[#20BFE8]/30 selection:text-[#79DFFF]">
      <Navbar />

      <div className="flex-1 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <AuraBounceBox className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-[#20BFE8]/25 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
          {/* Left Column: Atmospheric Neural Lab Art (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative p-10 bg-gradient-to-br from-[#061426] via-[#071426] to-[#030914] flex-col justify-between overflow-hidden border-r border-[#20BFE8]/20">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#087CFF]/15 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#20BFE8]/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#087CFF]/15 border border-[#20BFE8]/40 flex items-center justify-center text-[#20BFE8] shadow-[0_0_20px_rgba(32,191,232,0.3)]">
                <Brain className="w-6 h-6" />
              </div>
              <AuraBounceHeading as="h3" className="text-2xl font-bold font-heading text-[#F3F8FF] tracking-tight">
                Universal EEG ADHD Analysis
              </AuraBounceHeading>
              <p className="text-xs text-[#A5B8CC] leading-relaxed font-sans">
                Access calibrated models, window-level probability trends, and 19-channel signal spectrograms in a unified clinical AI analytics suite.
              </p>
            </div>

            {/* Animated Waveform Visualizer on Left */}
            <div className="relative z-10 my-4 space-y-1.5">
              <span className="text-[10px] font-mono text-[#20BFE8] uppercase tracking-wider block font-semibold">
                Synchronized Scalp Conduction:
              </span>
              <LoginNeuralArt />
            </div>

            {/* Neural Features List */}
            <div className="relative z-10 space-y-2.5 font-mono text-xs text-[#A5B8CC]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#20BFE8]" />
                <span className="text-[#F3F8FF] font-medium">CNN + Transformer Attention (50%)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#087CFF]" />
                <span className="text-[#F3F8FF] font-medium">EEGNet Spatio-Temporal Conv (25%)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#79DFFF]" />
                <span className="text-[#F3F8FF] font-medium">PSD + XGBoost Decision Trees (25%)</span>
              </div>
            </div>

            {/* Honest Demo Notice */}
            <div className="relative z-10 p-3.5 rounded-xl bg-[#030914]/85 border border-[#20BFE8]/20 text-[11px] text-[#A5B8CC] leading-relaxed font-mono mt-4">
              <Info className="w-3.5 h-3.5 text-[#20BFE8] inline mr-1.5" />
              Academic demo mode is available for faculty evaluation and project presentation without credentials.
            </div>
          </div>

          {/* Right Column: Authentication / Demo Access Panel */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-8 bg-[#061426]/85 backdrop-blur-xl">
            <div>
              <span className="text-[11px] font-mono text-[#20BFE8] uppercase tracking-widest block mb-1 font-semibold">
                RESEARCH ACCESS PORTAL
              </span>
              <AuraBounceHeading as="h2" className="text-2xl md:text-3xl font-bold font-heading text-[#F3F8FF] tracking-tight">
                Welcome to the Neural Lab
              </AuraBounceHeading>
              <p className="text-xs md:text-sm text-[#A5B8CC] font-sans mt-1">
                Sign in to access your EEG analysis workspace or proceed via research demo.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#A5B8CC] block">Researcher Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030914]/80 border border-slate-700/80 focus:border-[#20BFE8] focus:ring-1 focus:ring-[#20BFE8] text-sm text-[#F3F8FF] placeholder-slate-500 outline-none transition-all font-mono shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#A5B8CC] block">Workspace Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030914]/80 border border-slate-700/80 focus:border-[#20BFE8] focus:ring-1 focus:ring-[#20BFE8] text-sm text-[#F3F8FF] placeholder-slate-500 outline-none transition-all font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#20BFE8] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl font-heading font-bold text-sm tracking-wide bg-gradient-to-r from-[#087CFF] to-[#20BFE8] text-[#030914] shadow-[0_0_25px_rgba(32,191,232,0.4)] hover:shadow-[0_0_35px_rgba(32,191,232,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#030914] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-[#061426] px-3 text-[11px] font-mono text-slate-500 uppercase">
                    or
                  </span>
                </div>

                {/* Continue as Guest (Research Demo) */}
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  className="w-full py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#030914]/80 border border-[#20BFE8]/40 hover:border-[#20BFE8] hover:bg-[#087CFF]/15 text-[#20BFE8] shadow-[0_0_15px_rgba(32,191,232,0.2)] hover:shadow-[0_0_25px_rgba(32,191,232,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#20BFE8]" />
                  <span>Continue as Guest (Research Demo Mode)</span>
                </button>
              </div>
            </form>

            {/* Architecture Transparency Requirement */}
            <div className="p-3.5 rounded-xl bg-[#030914]/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1">
              <span className="text-[#20BFE8] font-semibold block">Authentication Architecture Note:</span>
              <p className="leading-relaxed">
                The current backend provides universal stateless EEG inference and pipeline endpoints (<code className="text-[#79DFFF]">/api/predict</code>, <code className="text-[#79DFFF]">/api/validate</code>). Demo mode provides immediate access to all analysis capabilities for evaluation without mock credential storage.
              </p>
            </div>
          </div>
        </AuraBounceBox>
      </div>
    </div>
  );
};
