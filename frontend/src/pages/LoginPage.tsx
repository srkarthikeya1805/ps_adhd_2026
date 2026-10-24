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
} from 'lucide-react';
import { saveSession } from '../services/storage';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';

// ---------------------------------------------------------------------------
// Animated Left Panel Neural Waveform & Particles
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

      // Multi-layer sine waveform
      const layers = [
        { color: '#00E5FF', freq: 0.04, speed: 2.2, amp: 18, y: 70 },
        { color: '#8B5CF6', freq: 0.06, speed: -1.8, amp: 14, y: 70 },
        { color: '#F472D0', freq: 0.09, speed: 2.8, amp: 8, y: 70 },
      ];

      layers.forEach((l) => {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = l.y + Math.sin(x * l.freq + t * l.speed) * l.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Floating sparks
      for (let i = 0; i < 8; i++) {
        const sx = ((t * 40 + i * 50) % w);
        const sy = 70 + Math.sin(sx * 0.05 + t) * 20;
        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[140px] rounded-2xl bg-slate-950/70 border border-cyan-500/20" />;
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
      setErrorMsg('Please enter both email and password, or use Guest Demo Mode.');
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
    }, 600);
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
    <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col relative z-10">
      <Navbar />

      <div className="flex-1 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          {/* Left Column: Atmospheric Neural Lab Art (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative p-10 bg-gradient-to-br from-[#080B1B] via-[#10152B] to-[#050816] flex-col justify-between overflow-hidden border-r border-slate-800">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white">
                Universal EEG ADHD Analysis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Access calibrated models, window-level probability trends, and 19-channel signal spectrograms in a unified clinical AI analytics suite.
              </p>
            </div>

            {/* Animated Waveform Visualizer on Left */}
            <div className="relative z-10 my-4 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Synchronized Scalp Conduction:
              </span>
              <LoginNeuralArt />
            </div>

            {/* Neural Features List */}
            <div className="relative z-10 space-y-2.5 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>CNN + Transformer Attention (50%)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span>EEGNet Spatio-Temporal Conv (25%)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
                <span>PSD + XGBoost Decision Trees (25%)</span>
              </div>
            </div>

            {/* Honest Demo Notice */}
            <div className="relative z-10 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono mt-4">
              <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1.5" />
              Academic demo mode is available for faculty evaluation and project presentation without credentials.
            </div>
          </div>

          {/* Right Column: Authentication / Demo Access Panel */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-8 bg-[#080B1B]/80 backdrop-blur-xl">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                RESEARCH ACCESS PORTAL
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
                Welcome to the Neural Lab
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-sans mt-1">
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
                <label className="text-xs font-mono text-slate-300 block">Researcher Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 block">Workspace Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                  isLoading={isSubmitting}
                >
                  Sign In to Workspace
                </Button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-[#080B1B] px-3 text-[11px] font-mono text-slate-500 uppercase">
                    or
                  </span>
                </div>

                {/* Continue as Guest (Research Demo) */}
                <Button
                  type="button"
                  variant="glow-cyan"
                  size="md"
                  onClick={handleGuestAccess}
                  className="w-full"
                  leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
                >
                  Continue as Guest (Research Demo Mode)
                </Button>
              </div>
            </form>

            {/* Architecture Transparency Requirement */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
              <span className="text-slate-400 font-semibold block">Authentication Architecture Note:</span>
              <p className="leading-relaxed">
                The current backend provides universal stateless EEG inference and pipeline endpoints (<code>/api/predict</code>, <code>/api/validate</code>). Demo mode provides immediate access to all analysis capabilities for evaluation without mock credential storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
