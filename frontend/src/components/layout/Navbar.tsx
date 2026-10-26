import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  Database,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { getHealth } from '../../services/api';
import { HealthResponse } from '../../types';
import { neuroAudio } from '../../utils/audio';
import { useIntro } from '../../App';

interface NavbarProps {
  activeSection?: string;
  onNavigateSection?: (sectionId: string) => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection = 'hero', onNavigateSection, onReplayIntro }) => {
  const { replayIntro } = useIntro();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    let isMounted = true;
    getHealth()
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch(() => {
        if (isMounted) setHealth(null);
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleAudio = () => {
    const muted = neuroAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      neuroAudio.playSynapseBlip(680);
    }
  };

  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    neuroAudio.playSynapseBlip(740);
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Brand Holographic Pill */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all group"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/15 animate-ping opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wider">
              NEUROSCAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">AI</span>
            </span>
            <span className="hidden md:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              v3.0 EEG
            </span>
          </div>
        </Link>

        {/* Center Waypoint Navigator (When on Landing Page) */}
        {isLandingPage ? (
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-[#061426]/90 border border-[#20BFE8]/25 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.9)] text-[11px] font-heading font-extrabold tracking-wider">
            <button
              onClick={() => scrollTo('scene-hero')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSection === 'hero'
                  ? 'bg-[#20BFE8]/25 border border-[#20BFE8]/70 text-[#79DFFF] shadow-[0_0_15px_rgba(32,191,232,0.3)] font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              01 BRAIN
            </button>
            <button
              onClick={() => scrollTo('scene-montage')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSection === 'montage'
                  ? 'bg-[#087CFF]/25 border border-[#087CFF]/70 text-[#79DFFF] shadow-[0_0_15px_rgba(8,124,255,0.3)] font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              02 10-20 MONTAGE
            </button>
            <button
              onClick={() => scrollTo('scene-pipeline')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSection === 'pipeline'
                  ? 'bg-[#20BFE8]/25 border border-[#20BFE8]/70 text-[#79DFFF] shadow-[0_0_15px_rgba(32,191,232,0.3)] font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              03 AI PIPELINE
            </button>
            <Link
              to="/login"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSection === 'lab'
                  ? 'bg-emerald-500/25 border border-emerald-400/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              04 NEURAL LAB
            </Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-2 p-1 rounded-full bg-[#061426]/90 border border-slate-800 backdrop-blur-2xl text-xs font-mono text-slate-300">
            <Link to="/" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Cinematic Home
            </Link>
            <Link to="/dashboard" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Overview
            </Link>
            <Link to="/dashboard/upload" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Upload
            </Link>
            <Link to="/dashboard/results" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Results
            </Link>
            <Link to="/dashboard/neuro-care" className="px-3 py-1 rounded-full hover:text-[#20BFE8] text-[#79DFFF] font-bold transition-colors">
              Brain Care
            </Link>
            <Link to="/dashboard/signal-explorer" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Signals
            </Link>
            <Link to="/dashboard/models" className="px-3 py-1 rounded-full hover:text-[#20BFE8] transition-colors">
              Models
            </Link>
          </nav>
        )}

        {/* Right HUD Controls: Sound, API Status, Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Soundscape Synthesizer Toggle */}
          <button
            onClick={handleToggleAudio}
            title={isMuted ? 'Enable Neuro-Soundscape' : 'Mute Soundscape'}
            className={`p-2 rounded-full border backdrop-blur-2xl transition-all cursor-pointer ${
              !isMuted
                ? 'bg-[#20BFE8]/20 border-[#20BFE8] text-[#20BFE8] shadow-[0_0_15px_rgba(32,191,232,0.4)]'
                : 'bg-[#030914]/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {!isMuted ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Replay 3D Brain Intro Button */}
          <button
            onClick={() => (onReplayIntro ? onReplayIntro() : replayIntro())}
            title="Replay 3D Brain Intro"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#087CFF]/15 border border-[#20BFE8]/40 text-[#20BFE8] hover:bg-[#20BFE8]/25 hover:border-[#20BFE8] text-xs font-mono font-medium transition-all shadow-[0_0_15px_rgba(32,191,232,0.2)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#20BFE8]" />
            <span className="hidden sm:inline">3D Intro</span>
          </button>

          {/* Backend API Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#030914]/90 border border-slate-800 text-[11px] font-mono backdrop-blur-2xl shadow-lg">
            {isChecking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400">Pinging API</span>
              </>
            ) : health ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                <span className="text-emerald-300 font-semibold">FastAPI Connected</span>
                <span className="text-[10px] text-slate-400">({health.device || 'CPU'})</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-400">API Offline</span>
              </>
            )}
          </div>

          {/* Launch Lab Action Pill */}
          {isLandingPage ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#087CFF] to-[#20BFE8] text-[#030914] shadow-[0_0_20px_rgba(32,191,232,0.35)] hover:shadow-[0_0_30px_rgba(32,191,232,0.55)] hover:scale-105 transition-all cursor-pointer"
            >
              <span>Launch Lab</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#030914] stroke-[2.5]" />
            </Link>
          ) : (
            <Link
              to="/dashboard/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider bg-[#087CFF]/25 border border-[#20BFE8]/70 text-white shadow-[0_0_20px_rgba(32,191,232,0.35)] hover:border-[#20BFE8] hover:scale-105 transition-all"
            >
              <span>Upload EEG</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#20BFE8] stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
