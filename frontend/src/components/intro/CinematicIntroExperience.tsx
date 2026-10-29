import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  Activity,
  Play,
  RotateCcw,
  FastForward,
  Volume2,
  VolumeX,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { CinematicDisassemblyCanvas } from './CinematicDisassemblyCanvas';
import { neuroAudio } from '../../utils/audio';

export interface CinematicIntroExperienceProps {
  onEnterApp: () => void;
  onSkip?: () => void;
  allowAutoDismiss?: boolean;
}

export type IntroStage =
  | 'idle'          // Opening scene: Floating brain + ENTER button
  | 'opening'       // Camera approaches & zigzag neural signals activate
  | 'disassembly'   // Vertical anatomical disassembly & HUD callouts
  | 'core_dive'     // Bright core reveals & camera dives through
  | 'eeg_head'      // 3D EEG Head & Electrodes & Waveforms
  | 'complete';     // Transition into existing app

export const CinematicIntroExperience: React.FC<CinematicIntroExperienceProps> = ({
  onEnterApp,
  onSkip,
  allowAutoDismiss = false,
}) => {
  const [stage, setStage] = useState<IntroStage>('idle');
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Toggle Mute
  const handleToggleSound = () => {
    const muted = neuroAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      neuroAudio.playSynapseBlip(680);
    }
  };

  // Skip Intro directly
  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    setStage('complete');
    if (onSkip) {
      onSkip();
    } else {
      onEnterApp();
    }
  };

  // Replay Intro from start
  const handleReplay = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    setStage('idle');
    setStageProgress(0);
  };

  // Trigger the Cinematic GSAP Animation Sequence (12 - 18s duration)
  const handleStartIntro = () => {
    neuroAudio.playSynapseBlip(540);

    if (isReducedMotion) {
      setStage('complete');
      onEnterApp();
      return;
    }

    setStage('opening');
    setStageProgress(0);

    const tl = gsap.timeline({
      onComplete: () => {
        setStage('complete');
        onEnterApp();
      },
    });

    timelineRef.current = tl;

    // Phase 1: Camera Approach & Neural Activation (0 to 3.0s)
    tl.to(
      {},
      {
        duration: 3.0,
        onUpdate: function () {
          setStageProgress(this.progress());
        },
      }
    );

    // Phase 2: Anatomical Disassembly with Reference HUD Labels (3.0s to 8.5s)
    tl.add(() => {
      setStage('disassembly');
      neuroAudio.playSynapseBlip(620);
    });
    tl.to(
      {},
      {
        duration: 5.5,
        onUpdate: function () {
          setStageProgress(this.progress());
        },
      }
    );

    // Phase 3: Core Revealing & Forward Dive (8.5s to 11.5s)
    tl.add(() => {
      setStage('core_dive');
      neuroAudio.playSynapseBlip(800);
    });
    tl.to(
      {},
      {
        duration: 3.0,
        onUpdate: function () {
          setStageProgress(this.progress());
        },
      }
    );

    // Phase 4: 3D EEG Scalp Electrode Head Scene (11.5s to 16.5s)
    tl.add(() => {
      setStage('eeg_head');
      neuroAudio.playSynapseBlip(720);
    });
    tl.to(
      {},
      {
        duration: 5.0,
        onUpdate: function () {
          setStageProgress(this.progress());
        },
      }
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] text-slate-100 overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* 3D WebGL Three.js Canvas Stage */}
      <div className="absolute inset-0 z-0">
        <CinematicDisassemblyCanvas
          currentStage={stage}
          progress={stageProgress}
          isReducedMotion={isReducedMotion}
          className="w-full h-full"
        />
      </div>

      {/* Cinematic Vignette & Ambient Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.85)_100%)]" />
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_70%_70%_at_50%_40%,rgba(0,229,255,0.06),transparent)]" />

      {/* ===================================================================== */}
      {/* TOP CONTROLS & HUD STRIP                                               */}
      {/* ===================================================================== */}
      <header className="relative z-30 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        {/* Brand Hologram */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-60" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-base sm:text-lg text-white tracking-widest uppercase">
              NEUROSCAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">AI</span>
            </span>
            <span className="block text-[10px] font-mono text-cyan-300/80 tracking-wider">
              10-20 EEG CORTICAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Reduced Motion Toggle */}
          <button
            onClick={() => setIsReducedMotion(!isReducedMotion)}
            title="Toggle Reduced Motion"
            className={`px-3 py-1.5 rounded-full border text-[11px] font-mono transition-all backdrop-blur-xl ${
              isReducedMotion
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isReducedMotion ? 'Motion: Reduced' : 'Motion: Cinematic'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Synapse Audio' : 'Mute Audio'}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-400 hover:text-white transition-all backdrop-blur-xl"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-mono font-medium transition-all backdrop-blur-xl shadow-lg group"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* SCENE 1: OPENING SCENE (Idle state)                                    */}
      {/* Matches user requirement: Glowing electric-blue floating brain,         */}
      {/* "NEUROSCAN.AI", "Explore the Intelligence Within", ENTER button         */}
      {/* ===================================================================== */}
      {stage === 'idle' && (
        <main className="relative z-20 my-auto text-center px-4 max-w-4xl mx-auto space-y-8 pointer-events-auto">
          {/* Scientific Telemetry Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_25px_rgba(0,240,255,0.25)] backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>CLINICAL-GRADE DEEP LEARNING EEG DIAGNOSTIC PLATFORM</span>
          </motion.div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.15 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black font-heading tracking-tight text-white leading-none drop-shadow-[0_0_40px_rgba(0,229,255,0.35)]"
            >
              NEUROSCAN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">.AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.35 }}
              className="text-xl sm:text-2xl md:text-3xl font-heading font-medium text-slate-200 tracking-wide"
            >
              Explore the Intelligence Within
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.45 }}
              className="text-xs sm:text-sm font-mono text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              A high-precision neural architecture decodes 19-channel 10-20 EEG oscillations through a calibrated ensemble of CNN-Transformer, Welch PSD + XGBoost, and EEGNet.
            </motion.p>
          </div>

          {/* ENTER BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={handleStartIntro}
              className="relative group px-9 py-4 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:shadow-[0_0_60px_rgba(0,240,255,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>ENTER NEUROSCAN.AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleSkip}
              className="px-6 py-4 rounded-full font-mono text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 hover:border-cyan-400 hover:text-white transition-all backdrop-blur-xl"
            >
              Access Neural Dashboard Directly
            </button>
          </motion.div>

          {/* Real-time Telemetry Metrics Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-4 text-[11px] font-mono text-slate-400"
          >
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              19 Cortical Channels
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              128 Hz Resampled
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              3-Model Ensemble
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-cyan-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Real Anatomical Disassembly
            </span>
          </motion.div>
        </main>
      )}

      {/* ===================================================================== */}
      {/* SCENE 2 & 3: BRAIN DISASSEMBLY HUD OVERLAYS (Matches Video Reference) */}
      {/* Displays identical anatomical labels & brackets as in reference video  */}
      {/* ===================================================================== */}
      {(stage === 'opening' || stage === 'disassembly' || stage === 'core_dive') && (
        <div className="relative z-20 pointer-events-none w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-6">
          {/* Top Stage Indicator */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-lg backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold">
                {stage === 'opening' && 'PHASE 01: NEURAL ACTIVATION & AXONAL EXCITATION'}
                {stage === 'disassembly' && 'PHASE 02: ANATOMICAL LAYER EXPLODED DISASSEMBLY'}
                {stage === 'core_dive' && 'PHASE 03: HYPERSPACE DIVE INTO NEURAL CORE'}
              </span>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Choreography: {(stageProgress * 100).toFixed(0)}%
            </span>
          </div>

          {/* Anatomical HUD Callout Lines Matching Video */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
            {/* Left HUD Column: Anatomical Tiers 01 - 04 */}
            <div className="md:col-span-4 space-y-4 text-left">
              {[
                { id: '01', title: 'Outer cranial shell', sub: 'Translucent protective acrylic cranial contour', top: '15%' },
                { id: '02', title: 'Cerebral cortex', sub: 'Superior fronto-parietal cognitive lobes', top: '35%' },
                { id: '03', title: 'Vascular & neural network', sub: 'Micro-capillary plexus & synaptic branches', top: '55%' },
                { id: '04', title: 'Inner brain', sub: 'Thalamic gate & limbic emotional loop', top: '75%' },
              ].map((layer, idx) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="p-3.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                      {layer.id}
                    </span>
                    <h4 className="text-sm font-heading font-bold text-white tracking-wide">
                      {layer.title}
                    </h4>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{layer.sub}</p>
                  {/* Technical Bracket Indicator */}
                  <div className="absolute right-2 top-3 w-2 h-6 border-r-2 border-t-2 border-b-2 border-cyan-400/50" />
                </motion.div>
              ))}
            </div>

            {/* Center: Open Space for 3D Floating Separating Brain Layers */}
            <div className="md:col-span-4" />

            {/* Right HUD Column: Anatomical Tiers 05 - 07 */}
            <div className="md:col-span-4 space-y-4 text-right">
              {[
                { id: '05', title: 'midbrain', sub: 'Mesencephalic dopaminergic reward pathway' },
                { id: '06', title: 'Brainstem & spinal cord', sub: 'Autonomic respiratory & motor conduction trunk' },
                { id: '07', title: 'Cerebellum', sub: 'Sensorimotor coordination & timing synchronization' },
              ].map((layer, idx) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.2 }}
                  className="p-3.5 rounded-2xl bg-slate-950/85 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] relative text-right"
                >
                  <div className="flex items-center justify-end gap-2.5">
                    <h4 className="text-sm font-heading font-bold text-white tracking-wide">
                      {layer.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-400/30">
                      {layer.id}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{layer.sub}</p>
                  {/* Technical Bracket Indicator */}
                  <div className="absolute left-2 top-3 w-2 h-6 border-l-2 border-t-2 border-b-2 border-violet-400/50" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Telemetry Strip */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Coordinate System: RAS (Right-Anterior-Superior)</span>
            <span className="text-cyan-300">Exploded Separation: 100% Synchronized</span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCENE 4: 3D EEG SCALP ELECTRODE SCENE (Matches Video Reference)         */}
      {/* Transparent rotating head, 10-20 electrode cap, live waveforms         */}
      {/* ===================================================================== */}
      {stage === 'eeg_head' && (
        <div className="relative z-20 pointer-events-none w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-6">
          {/* Header Title Display: EXACT REQUIREMENT FROM USER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-lg backdrop-blur-xl">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>PHASE 04: ELECTROPHYSIOLOGICAL CAP RESOLUTION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_0_30px_rgba(0,229,255,0.4)]">
              Decoding Brain Signals Through Artificial Intelligence
            </h2>
          </motion.div>

          {/* Side Waveform & Telemetry Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
            {/* Left: Live Multi-Band EEG Waveforms */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-4 p-5 rounded-3xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-3 pointer-events-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Live 10-20 Microvolt Streams
                </span>
                <span className="text-[10px] font-mono text-cyan-300">128 Hz</span>
              </div>

              {[
                { ch: 'Fp1-Fz', band: 'Theta (4.5 Hz)', col: '#00f0ff' },
                { ch: 'F3-C3',  band: 'Frontal (6.2 Hz)', col: '#38bdf8' },
                { ch: 'Cz-Pz',  band: 'Alpha (10.0 Hz)', col: '#8b5cf6' },
                { ch: 'O1-O2',  band: 'Posterior (9.8 Hz)', col: '#f02bd5' },
              ].map((sig, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-300 font-bold">{sig.ch}</span>
                  <svg viewBox="0 0 80 12" className="w-24 h-3" preserveAspectRatio="none">
                    <path
                      d="M0,6 Q10,0 20,6 T40,6 T60,6 T80,6"
                      fill="none"
                      stroke={sig.col}
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-slate-400">{sig.band}</span>
                </div>
              ))}
            </motion.div>

            {/* Center Space for 3D Head */}
            <div className="md:col-span-4" />

            {/* Right: Scalp Montage & Impedance Telemetry */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-4 p-5 rounded-3xl bg-slate-950/85 border border-violet-500/30 backdrop-blur-2xl shadow-2xl space-y-3 pointer-events-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Electrode Status
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Balanced &lt; 5kΩ</span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Montage:</span>
                  <span className="text-white font-bold">19-Channel 10-20 Standard</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Filtering:</span>
                  <span className="text-cyan-300 font-bold">1.0 – 45.0 Hz Bandpass</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Inference Engine:</span>
                  <span className="text-violet-300 font-bold">3-Model Heterogeneous Ensemble</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Action Prompt */}
          <div className="flex items-center justify-center pointer-events-auto">
            <button
              onClick={handleSkip}
              className="px-8 py-3.5 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Continue to Neuroscan Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* BOTTOM TIMELINE PROGRESS BAR                                          */}
      {/* ===================================================================== */}
      <footer className="relative z-30 p-6 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Timeline:</span>
          <div className="w-36 sm:w-64 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 transition-all duration-300"
              style={{
                width: `${
                  stage === 'idle'
                    ? 0
                    : stage === 'opening'
                    ? stageProgress * 25
                    : stage === 'disassembly'
                    ? 25 + stageProgress * 35
                    : stage === 'core_dive'
                    ? 60 + stageProgress * 20
                    : 80 + stageProgress * 20
                }%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage !== 'idle' && (
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Intro</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
