import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Brain,
  Cpu,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  Scissors,
  Layers,
  Zap,
  Target,
  Glasses,
  Ear,
  Info,
  X,
  FileText,
  BarChart2,
  Lock,
} from 'lucide-react';
import { BrainCanvas, ELECTRODE_10_20_COORDS } from '../components/brain/BrainCanvas';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { FileList } from '../components/upload/FileList';
import { ValidationModal } from '../components/upload/ValidationModal';
import { CinematicLoadingOverlay } from '../components/upload/CinematicLoadingOverlay';
import { EnsembleCard } from '../components/models/EnsembleCard';
import { BrainRegionKey, ValidationReport, FilePredictionResult, BatchPredictionResponse } from '../types';
import { BRAIN_REGIONS, STANDARD_19_CHANNELS, FREQUENCY_BANDS, BENCHMARK_DATASETS } from '../utils/sampleData';
import { validateEEG, predictEEG } from '../services/api';
import { saveLatestBatch, addToHistory, saveSelectedFileResult } from '../services/storage';
import { neuroAudio } from '../utils/audio';
import { useIntro } from '../App';
import {
  AuraBounceHeading,
  AuraScrollParagraph,
  AuraBounceBox,
} from '../components/common/AuraScrollText';
import { AuraTiltCard } from '../components/common/AuraTiltCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Scroll Progress State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Cinematic 360° Brain Intro Sequence States using combined_final_video.mp4
  type IntroPhase = 'init' | 'synapse' | 'rotating_center' | 'transitioning_right' | 'settled';
  const [introPhase, setIntroPhase] = useState<IntroPhase>('init');
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(30.2);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const { introTrigger } = useIntro();
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const [viewportDim, setViewportDim] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setViewportDim({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isFullscreen =
    introPhase === 'init' || introPhase === 'synapse' || introPhase === 'rotating_center';

  // Timeupdate handler syncing phases with combined_final_video.mp4 (compressed to 10s flat at 3.03x speed)
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const current = e.currentTarget.currentTime;
    const dur = e.currentTarget.duration || 30.29;
    setVideoCurrentTime(current);
    setVideoProgress(dur > 0 ? (current / dur) * 100 : 0);

    // At 3.03x speed, 25.5s in video occurs at ~8.4s real time (giving 1.6s for rotation to right hero before 10.0s end)
    if (current >= 25.5 && current < dur - 0.2) {
      if (introPhase !== 'transitioning_right') setIntroPhase('transitioning_right');
    }
  };

  const handleVideoEnded = () => {
    setIntroPhase('settled');
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }
  };

  const handleSkipIntro = () => {
    setIntroPhase('settled');
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.pause();
    }
    if (heroVideoRef.current) {
      heroVideoRef.current.currentTime = 0;
      heroVideoRef.current.play().catch(() => {});
    }
  };

  const handleJumpToRotation = () => {
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.currentTime = 20.0;
      fullscreenVideoRef.current.playbackRate = 3.03;
      setIntroPhase('rotating_center');
      fullscreenVideoRef.current.play().catch(() => {});
    }
  };

  const handleReplayIntro = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIntroPhase('init');
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 3.03;
      fullscreenVideoRef.current.currentTime = 0;
      fullscreenVideoRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    setIntroPhase('init');
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 3.03;
      fullscreenVideoRef.current.currentTime = 0;
      fullscreenVideoRef.current.play().catch(() => {});
    }

    // Safety fallback: ensure video completes in ~10s and never gets stuck
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setIntroPhase('settled');
      if (heroVideoRef.current) {
        heroVideoRef.current.play().catch(() => {});
      }
    }, 10200);

    return () => clearTimeout(timer);
  }, [introTrigger]);

  // Interactive 3D Brain States
  const [activeLobe, setActiveLobe] = useState<BrainRegionKey | null>(null);
  const [activeElectrode, setActiveElectrode] = useState<string | null>(null);
  const [selectedFreqBand, setSelectedFreqBand] = useState<string>('Theta');

  // Interactive Neural Lab Upload & Inference States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [samplingRateOverride, setSamplingRateOverride] = useState<string>('');
  const [validationReports, setValidationReports] = useState<ValidationReport[] | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inlinePredictionResult, setInlinePredictionResult] = useState<BatchPredictionResponse | null>(null);

  // Monitor Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60 && introPhase !== 'settled') {
        handleSkipIntro();
      }

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      setScrollProgress(progress);

      // Determine active scene based on progress
      if (progress < 0.22) {
        setActiveSection('hero');
      } else if (progress < 0.52) {
        setActiveSection('montage');
      } else if (progress < 0.78) {
        setActiveSection('pipeline');
      } else {
        setActiveSection('lab');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [introPhase]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sample Loaders for 1-Click Neural Testing
  const handleLoadSample = (sampleType: 'single_csv' | 'multi_mat' | 'zip_archive') => {
    setErrorMessage(null);
    setValidationReports(null);
    setInlinePredictionResult(null);
    neuroAudio.playSynapseBlip(600);

    const channels = STANDARD_19_CHANNELS;
    if (sampleType === 'single_csv') {
      let csvContent = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        const row = channels.map((_, chIdx) => {
          const val = Math.sin(i * 0.1 + chIdx) * 15 + (Math.random() - 0.5) * 5;
          return val.toFixed(3);
        });
        csvContent += row.join(',') + '\n';
      }
      const file = new File([csvContent], 'v1p_sample.csv', { type: 'text/csv' });
      setSelectedFiles([file]);
    } else if (sampleType === 'multi_mat') {
      let csv1 = channels.join(',') + '\n';
      let csv2 = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        csv1 += channels.map((_, c) => (Math.sin(i * 0.12 + c) * 14).toFixed(3)).join(',') + '\n';
        csv2 += channels.map((_, c) => (Math.cos(i * 0.08 + c) * 16).toFixed(3)).join(',') + '\n';
      }
      const file1 = new File([csv1], 'Subject_01_ADHD.csv', { type: 'text/csv' });
      const file2 = new File([csv2], 'Subject_02_Control.csv', { type: 'text/csv' });
      setSelectedFiles([file1, file2]);
    } else {
      let csv = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        csv += channels.map(() => (Math.random() * 20 - 10).toFixed(3)).join(',') + '\n';
      }
      const file = new File([csv], 'benchmark_recording.csv', { type: 'text/csv' });
      setSelectedFiles([file]);
    }
  };

  // Run Pre-validation (POST /api/validate)
  const handleValidate = async () => {
    if (selectedFiles.length === 0) return;
    setIsValidating(true);
    setErrorMessage(null);
    neuroAudio.playSynapseBlip(720);

    const fsVal = samplingRateOverride.trim() ? parseFloat(samplingRateOverride) : undefined;
    try {
      const reports = await validateEEG(selectedFiles, fsVal);
      setValidationReports(reports);
      setIsValidationModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation failed. Ensure backend is running.');
    } finally {
      setIsValidating(false);
    }
  };

  // Run Full Prediction (POST /api/predict)
  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    neuroAudio.playSynapseBlip(800);

    const fsVal = samplingRateOverride.trim() ? parseFloat(samplingRateOverride) : undefined;
    try {
      const batchResponse = await predictEEG(selectedFiles, fsVal);
      saveLatestBatch(batchResponse);
      setInlinePredictionResult(batchResponse);

      batchResponse.results.forEach((res: FilePredictionResult) => {
        if (res.status === 'success') {
          addToHistory(res, batchResponse.batch_type);
        }
      });

      if (batchResponse.batch_type === 'single_file' && batchResponse.results[0]) {
        saveSelectedFileResult(batchResponse.results[0]);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Analysis failed. Ensure FastAPI backend is running and models are accessible.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ambient Radial Vignette Overlay for High Readability */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,135,255,0.08),rgba(0,4,37,0.85))]" />

      {/* ========================================================================= */}
      {/* CINEMATIC FULLSCREEN VIDEO INTRO                                          */}
      {/* Unobstructed, edge-to-edge pure video covering 100% of the screen         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            key="fullscreen-cinema"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 0.5,
              x: isDesktop ? '28vw' : '0vw',
              y: isDesktop ? '-4vh' : '-8vh',
              transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
            }}
            className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#000214]"
          >
            {/* The Cinematic Video (Edge-to-edge covering whole area without boxes) */}
            <video
              ref={fullscreenVideoRef}
              src="/videos/combined_final_video.mp4"
              autoPlay
              playsInline
              muted
              preload="auto"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                v.playbackRate = 3.03; // Compressed to ~10.0s flat
                setVideoDuration(v.duration || 30.29);
                v.play().catch(() => {});
              }}
              onCanPlay={(e) => {
                const v = e.currentTarget;
                v.playbackRate = 3.03;
                v.play().catch(() => {});
              }}
              onPlay={(e) => {
                e.currentTarget.playbackRate = 3.03;
              }}
              onWaiting={(e) => {
                // Ensure uninterrupted fluid playback
                e.currentTarget.play().catch(() => {});
              }}
              onError={() => {
                // Settle immediately on any decode error so screen never freezes
                setIntroPhase('settled');
              }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full w-screen h-screen object-cover pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sci-Fi HUD Navigation Pill (hidden during fullscreen, smoothly reveals for dashboards) */}
      <motion.div
        animate={{ opacity: isFullscreen ? 0 : 1, y: isFullscreen ? -20 : 0 }}
        transition={{ duration: 1.0, delay: isFullscreen ? 0 : 0.3 }}
        className="relative z-30"
      >
        <Navbar
          activeSection={activeSection}
          onNavigateSection={scrollToSection}
          onReplayIntro={handleReplayIntro}
        />
      </motion.div>

      {/* ========================================================================= */}
      {/* SCENE 01: THE AWAKENING — CINEMATIC BRAIN HERO                             */}
      {/* Matches Reference: 01 — Continuous 360° rotation to right-side hero        */}
      {/* ========================================================================= */}
      <section
        id="scene-hero"
        className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 px-4 sm:px-8 z-10 max-w-7xl mx-auto w-full overflow-hidden"
      >
        {/* Ambient Cyan Halo */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none -z-0" />

        {/* Top Telemetry & Neuroscience Badge */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0087FF]/20 border border-[#71BBFD]/40 text-[#71BBFD] text-xs font-heading font-semibold tracking-widest uppercase shadow-[0_0_20px_rgba(0,135,255,0.25)] backdrop-blur-xl w-fit"
          >
            <Activity className="w-3.5 h-3.5 text-[#20BFE8] animate-pulse" />
            <span>NEUROSCIENCE × ARTIFICIAL INTELLIGENCE</span>
          </motion.div>

          {/* Quick HUD Telemetry Strip */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#A5B8CC]">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#030720]/90 border border-slate-800 text-[#F3F8FF] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20BFE8]" />
              19-Channel 10-20 Standard
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#030720]/90 border border-slate-800 text-[#F3F8FF] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0087FF]" />
              128 Hz Resampling
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#030720]/90 border border-[#20BFE8]/30 text-[#71BBFD] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              3D Rotating Brain Stream
            </span>
          </div>
        </div>

        {/* Hero Central HUD Overlays (Left Typography + Right Rotating 3D Brain) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto pointer-events-none">
          {/* Left Column: Title, Subtitle, and Direct Actions with Staggered Cascade Entrance */}
          <motion.div
            initial={false}
            animate={{
              opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
              x: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : -50,
            }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              delay: introPhase === 'transitioning_right' ? 0.2 : 0,
            }}
            className={`lg:col-span-6 space-y-6 ${
              introPhase === 'transitioning_right' || introPhase === 'settled'
                ? 'pointer-events-auto'
                : 'pointer-events-none'
            }`}
          >
            <div className="space-y-3">
              {/* Item 1: Main Title NEUROSCAN AI (Slide up with spring curve) */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{
                  opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                  y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 35,
                }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <AuraBounceHeading
                  as="h1"
                  className="text-4xl sm:text-6xl md:text-7xl font-bold font-heading text-white tracking-tight leading-[1.08]"
                >
                  NEUROSCAN{' '}
                  <span className="aura-gradient-title text-glow-cyan">
                    AI
                  </span>
                </AuraBounceHeading>
              </motion.div>

              {/* Item 2: Subtitle (Slide in following title) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                  y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 30,
                }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <AuraBounceHeading
                  as="p"
                  className="text-base sm:text-xl font-heading font-semibold text-[#C9E5FF] leading-snug"
                >
                  Hybrid Deep Learning Model for Identification of ADHD Using EEG
                </AuraBounceHeading>
              </motion.div>
            </div>

            {/* Item 3: Clinical Description Paragraph (Slide in) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{
                opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 25,
              }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuraScrollParagraph
                text="An immersive, clinical-grade neuroscience interface analyzing 19-channel 10-20 EEG signals through our calibrated 3-model deep learning ensemble (CNN-Transformer, Welch PSD + XGBoost, and EEGNet)."
                className="text-xs sm:text-sm text-slate-300 font-sans font-normal leading-relaxed max-w-xl"
                delay={0.15}
              />
            </motion.div>

            {/* Item 4: Action Buttons (Slide in & scale up one after the other) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                  y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 20,
                  scale: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0.95,
                }}
                transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0087FF] to-[#20BFE8] text-white shadow-[0_0_30px_rgba(0,135,255,0.4)] hover:shadow-[0_0_40px_rgba(0,135,255,0.6)] hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Enter Neural Lab</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                  y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 20,
                  scale: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0.95,
                }}
                transition={{ duration: 0.7, delay: 0.80, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => scrollToSection('scene-montage')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-heading text-xs font-bold text-slate-200 bg-[#061426]/90 border border-slate-700/80 hover:border-[#20BFE8] hover:text-white transition-all backdrop-blur-xl cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#20BFE8]" />
                  <span>Explore 10-20 Montage</span>
                </button>
              </motion.div>
            </div>

            {/* Item 5: 4 Interactive Lobe Highlight Pills (One by one cascade with 3D Hover Tilt & Floating) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 20,
              }}
              transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4 border-t border-slate-800/80 space-y-2.5"
            >
              <span className="text-[10px] font-heading font-extrabold text-[#A5B8CC] uppercase tracking-widest block">
                Interactive Cortical Lobe Spotlight:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: 'frontal' as BrainRegionKey, label: 'Frontal Lobe', role: 'Executive & Attention', color: 'border-[#20BFE8]/40 text-[#20BFE8]', float: 'animate-aura-float', delay: 0.95 },
                  { key: 'parietal' as BrainRegionKey, label: 'Parietal Lobe', role: 'Sensory Integration', color: 'border-[#087CFF]/40 text-[#79DFFF]', float: 'animate-aura-float-slow', delay: 1.05 },
                  { key: 'temporal' as BrainRegionKey, label: 'Temporal Lobe', role: 'Auditory & Memory', color: 'border-[#45CFFF]/40 text-[#45CFFF]', float: 'animate-aura-float-delicate', delay: 1.15 },
                  { key: 'occipital' as BrainRegionKey, label: 'Occipital Lobe', role: 'Visual & Alpha Gating', color: 'border-[#20BFE8]/40 text-[#20BFE8]', float: 'animate-aura-float-reverse', delay: 1.25 },
                ].map((lobe) => (
                  <motion.div
                    key={lobe.key}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                      opacity: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0,
                      y: introPhase === 'transitioning_right' || introPhase === 'settled' ? 0 : 20,
                      scale: introPhase === 'transitioning_right' || introPhase === 'settled' ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.5, delay: lobe.delay, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AuraTiltCard
                      maxTilt={12}
                      scale={1.05}
                      glare={true}
                      floatClass={lobe.float}
                      className="rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setActiveLobe(activeLobe === lobe.key ? null : lobe.key);
                          neuroAudio.playSynapseBlip(activeLobe === lobe.key ? 450 : 650);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-heading font-bold transition-all backdrop-blur-xl flex items-center gap-2 cursor-pointer w-full ${
                          activeLobe === lobe.key
                            ? 'bg-[#061426] border-[#20BFE8] text-white shadow-[0_0_20px_rgba(32,191,232,0.4)] scale-105'
                            : `bg-[#030914]/80 ${lobe.color} hover:border-[#20BFE8] hover:text-white`
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20BFE8] animate-pulse" />
                        <span className="font-extrabold">{lobe.label}</span>
                        <span className="text-[9px] text-[#A5B8CC] hidden sm:inline">({lobe.role})</span>
                      </button>
                    </AuraTiltCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Seamless 360° Rotating Brain with 3D Hover Tilt & Floating Animation */}
          <motion.div
            initial={false}
            animate={{
              opacity: isFullscreen ? 0 : 1,
              scale: isFullscreen ? 0.8 : 1.0,
              x: isFullscreen ? -30 : 0,
            }}
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-6 flex flex-col items-center justify-center relative pointer-events-auto z-10"
          >
            <AuraTiltCard
              maxTilt={14}
              scale={1.04}
              glare={true}
              floatClass="animate-aura-float-slow"
              className="relative w-full max-w-[580px] h-[460px] md:h-[520px] flex items-center justify-center cursor-pointer rounded-3xl"
            >
              {/* Glowing Radial Halo behind the rotating brain */}
              <div className="absolute w-72 h-72 rounded-full bg-cyan-400/20 filter blur-3xl pointer-events-none animate-pulse" />

              {/* Frameless Holographic Brain Video with clean seamless loop */}
              <video
                ref={heroVideoRef}
                src="/videos/brain_rotating_clean.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  maskImage: 'radial-gradient(circle at 50% 50%, black 44%, rgba(0,0,0,0.7) 56%, transparent 68%)',
                  WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 44%, rgba(0,0,0,0.7) 56%, transparent 68%)',
                }}
                className="w-full h-full object-contain mix-blend-screen filter brightness-115 contrast-125 drop-shadow-[0_0_40px_rgba(32,191,232,0.9)] transition-all duration-700"
              />
            </AuraTiltCard>
          </motion.div>
        </div>

        {/* Bottom Scroll Prompt */}
        <motion.div
          animate={{ opacity: introPhase === 'settled' ? 1 : 0.4 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center justify-center gap-1.5 text-center text-slate-400 font-mono text-xs pointer-events-none"
        >
          <span className="tracking-widest uppercase text-[10px] text-cyan-300 font-bold">
            Scroll to Dive into the Brain
          </span>
          <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* SCENE 02: SCROLL INTO THE BRAIN & 10-20 MONTAGE                           */}
      {/* Matches Reference: 02 — Scroll into the brain                             */}
      {/* ========================================================================= */}
      <section
        id="scene-montage"
        className="relative min-h-screen flex flex-col justify-center py-24 px-4 sm:px-8 z-10 max-w-7xl mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Scientific Telemetry on ADHD Neurobiology */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>02 — CORTICAL ARCHITECTURE & 10-20 MONTAGE</span>
            </div>

            <div className="space-y-3">
              <AuraBounceHeading
                as="h2"
                className="text-3xl sm:text-5xl font-bold font-heading text-white tracking-tight leading-tight"
              >
                Anatomy of Attention &{' '}
                <span className="aura-gradient-title">
                  Neural Gating
                </span>
              </AuraBounceHeading>
              
              <AuraScrollParagraph
                text="The international 10-20 electrode system records cortical microvolt fluctuations conducted across skull and scalp tissues. In ADHD, neuroimaging reveals prominent fronto-striatal dopaminergic hypoarousal and altered frequency band synchronization."
                className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-normal"
              />
            </div>

            {/* Clinical Frequency Bands Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Clinical EEG Frequency Bands:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FREQUENCY_BANDS.map((band, idx) => (
                  <motion.button
                    key={band.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      setSelectedFreqBand(band.name);
                      neuroAudio.playSynapseBlip(band.name === 'Theta' ? 520 : 640);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedFreqBand === band.name
                        ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-white">{band.name}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 block mt-1">{band.range}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Active Frequency Band Clinical Explanation (Reveals after bands) */}
            {(() => {
              const band = FREQUENCY_BANDS.find((b) => b.name === selectedFreqBand) || FREQUENCY_BANDS[1];
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color }} />
                    <h4 className="text-sm font-bold font-heading text-white">
                      {band.name} Band ({band.range}) — ADHD Diagnostic Significance
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{band.description}</p>
                  <p className="text-[11px] font-mono text-cyan-300 border-t border-slate-800 pt-2">
                    Clinical Correlation: Frontal Theta/Beta Ratio (TBR) {band.name === 'Theta' ? 'exceeds 3.0 in ADHD cohorts during resting and continuous performance tasks.' : 'acts as a primary biomarker extracted by our Welch PSD and CNN-Transformer branches.'}
                  </p>
                </motion.div>
              );
            })()}
          </div>

          {/* Right Column: 10-20 Scalp Electrode Grid Explorer */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl glass-panel border border-violet-500/30 backdrop-blur-2xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    10-20 Electrode Montage
                  </span>
                </div>
                <span className="text-[10px] font-mono text-violet-300">19 Channels Active</span>
              </div>

              {/* Scalp Channels Grid (One by one staggered reveal) */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {STANDARD_19_CHANNELS.map((ch, idx) => (
                  <motion.button
                    key={ch}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: 0.25 + idx * 0.025, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      setActiveElectrode(activeElectrode === ch ? null : ch);
                      neuroAudio.playSynapseBlip(680);
                    }}
                    className={`py-2 px-1 rounded-xl border text-xs font-mono font-bold transition-all ${
                      activeElectrode === ch
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-105'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-cyan-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </motion.button>
                ))}
              </div>

              {/* Active Channel Details */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1">
                <span className="text-cyan-400 font-bold">
                  {activeElectrode ? `Electrode ${activeElectrode} Spotlight:` : 'Click any electrode to isolate scalp location:'}
                </span>
                <p className="text-slate-400 leading-snug">
                  {activeElectrode
                    ? `Coordinates: [${ELECTRODE_10_20_COORDS[activeElectrode]?.join(', ')}]. Harmonized across 60+ clinical recording aliases to the standard 19-channel 10-20 montage.`
                    : 'All 19 channels are resampled to 128 Hz, bandpass filtered (1.0-45.0 Hz), and standardized via z-score normalization.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCENE 03: INSIDE THE AI MODEL — DEEP LEARNING PIPELINE                    */}
      {/* Matches Reference: 03 — Inside the AI model                               */}
      {/* ========================================================================= */}
      <section
        id="scene-pipeline"
        className="relative min-h-screen flex flex-col justify-center py-24 px-4 sm:px-8 z-10 max-w-7xl mx-auto w-full"
      >
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5 text-pink-400" />
              <span>03 — INSIDE THE HYBRID AI MODEL PIPELINE</span>
            </div>
            <AuraBounceHeading
              as="h2"
              className="text-3xl sm:text-5xl font-bold font-heading text-white tracking-tight leading-tight"
            >
              Calibrated Heterogeneous{' '}
              <span className="aura-gradient-title">
                Ensemble Architecture
              </span>
            </AuraBounceHeading>
            
            <AuraScrollParagraph
              text="Continuous 10-second temporal windows (1280 samples at 128 Hz) are ingested across 3 heterogeneous classifiers and fused via calibrated decision boundary."
              className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-normal justify-center"
            />
          </div>

          {/* Interactive Signal Flow Stages */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Polymorphic Ingestion',
                tech: '.mat, .edf, .set, .csv, .zip',
                desc: 'Sniffs magic bytes and extracts full 19-channel arrays safely.',
                color: 'border-cyan-500/40 text-cyan-400',
              },
              {
                step: '02',
                title: 'Universal Preprocessing',
                tech: '128 Hz Resample + 1-45 Hz Bandpass',
                desc: 'Polyphase decimation, 50 Hz notch, and robust z-score scaling.',
                color: 'border-blue-500/40 text-blue-400',
              },
              {
                step: '03',
                title: 'CNN-Transformer (60%)',
                tech: '1D Convolutions + Self-Attention',
                desc: 'Captures local temporal motifs & long-range attention dependencies.',
                color: 'border-violet-500/40 text-violet-400',
              },
              {
                step: '04',
                title: 'Welch PSD + XGBoost (30%)',
                tech: '5-Band Spectral Power Density',
                desc: 'Delta, Theta, Alpha, Beta, Gamma power distribution features.',
                color: 'border-pink-500/40 text-pink-400',
              },
              {
                step: '05',
                title: 'EEGNet (10%)',
                tech: 'Depthwise & Separable Convolutions',
                desc: 'Compact spatial-temporal representation across scalp electrodes.',
                color: 'border-teal-500/40 text-teal-400',
              },
            ].map((stg, idx) => (
              <motion.div
                key={stg.step}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: idx * 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-400/60 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${stg.color}`}>STEP {stg.step}</span>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-60 group-hover:scale-150 transition-transform" />
                </div>
                <h4 className="text-sm font-heading font-bold text-white leading-tight">{stg.title}</h4>
                <span className="text-[10px] font-mono text-cyan-300 block">{stg.tech}</span>
                <p className="text-xs text-slate-400 leading-snug">{stg.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Mathematical Fusion Formula Banner (Reveals after steps) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-2 shadow-xl"
          >
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              Calibrated Ensemble Decision Equation:
            </span>
            <div className="text-base sm:text-xl font-mono text-white font-bold tracking-wide">
              <span className="text-cyan-400">0.60 · P(CNN-Transformer)</span> +{' '}
              <span className="text-pink-400">0.30 · P(PSD-XGBoost)</span> +{' '}
              <span className="text-violet-400">0.10 · P(EEGNet)</span> ≥{' '}
              <span className="text-emerald-400">0.49 → ADHD</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Score &lt; 0.49 classifies as Control. Hot-reloaded live on disk via models/ensemble_config.json.
            </p>
          </motion.div>

          {/* The 3 AI Model Interactive Cards with 3D Tilt & Canvases */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interactive Model Cards (Hover to Tilt)</span>
            </h3>
            <EnsembleCard weights={{ cnn_transformer: 0.6, eegnet: 0.1, psd_xgboost: 0.3 }} threshold={0.49} />
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCENE 04: THE NEURAL LAB — INTERACTIVE EEG STUDIO                         */}
      {/* Direct Functional Integration of Single/Batch Upload, Validation, Prediction*/}
      {/* ========================================================================= */}
      <section
        id="scene-lab"
        className="relative min-h-screen flex flex-col justify-center py-24 px-4 sm:px-8 z-10 max-w-7xl mx-auto w-full"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>04 — NEURAL LAB: INTERACTIVE EEG ANALYSIS STUDIO</span>
              </div>
              <AuraBounceHeading
                as="h2"
                className="text-3xl sm:text-5xl font-bold font-heading text-white tracking-tight leading-tight"
              >
                Live Recording Diagnostic{' '}
                <span className="aura-gradient-title">
                  Workspace
                </span>
              </AuraBounceHeading>
              
              <AuraScrollParagraph
                text="Upload real scientific EEG recordings or select benchmark samples for pre-validation and live ensemble classification."
                className="text-xs sm:text-sm text-slate-300 font-sans font-normal"
              />
            </div>

            {/* Quick Links to Full Workspace Dashboard (Cascading entrance) */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/dashboard">
                  <Button size="sm" variant="secondary" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/dashboard/results">
                  <Button size="sm" variant="secondary" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                    Results
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">Pipeline Error:</span>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Main 2-Column Lab Grid: Left Upload Controls | Right Inline Predictions / 3D Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Dropzone & File Management */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Dropzone with 1-Click Sample Generators */}
              <UploadDropzone
                onFilesSelected={(newFiles) => {
                  setErrorMessage(null);
                  setValidationReports(null);
                  setInlinePredictionResult(null);
                  setSelectedFiles((prev) => [...prev, ...newFiles]);
                }}
                onLoadSample={handleLoadSample}
                disabled={isAnalyzing || isValidating}
              />

              {/* Selected Files List */}
              <FileList
                files={selectedFiles}
                validationReports={validationReports}
                onRemoveFile={(idx) => {
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                  setValidationReports(null);
                  setInlinePredictionResult(null);
                }}
                onClearAll={() => {
                  setSelectedFiles([]);
                  setValidationReports(null);
                  setErrorMessage(null);
                  setInlinePredictionResult(null);
                }}
                disabled={isAnalyzing || isValidating}
              />

              {/* Options & Action Bar */}
              {selectedFiles.length > 0 && (
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Optional Sampling Rate Override */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sampling Rate Override (Optional, Hz)</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="2000"
                        step="1"
                        placeholder="Auto-detect from file header"
                        value={samplingRateOverride}
                        onChange={(e) => setSamplingRateOverride(e.target.value)}
                        disabled={isAnalyzing || isValidating}
                        className="w-full sm:w-60 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={handleValidate}
                        isLoading={isValidating}
                        disabled={isAnalyzing}
                        leftIcon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      >
                        7-Tier Validate
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleAnalyze}
                        isLoading={isAnalyzing}
                        disabled={isValidating}
                        leftIcon={<Play className="w-4 h-4 fill-current" />}
                        className="shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                      >
                        Analyze (Ensemble)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right 5 Columns: Inline Prediction Results Card or Telemetry Monitor */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-6"
            >
              {inlinePredictionResult ? (
                <div className="p-6 rounded-3xl glass-panel border border-emerald-500/40 backdrop-blur-2xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Ensemble Classification Telemetry
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      SUCCESS
                    </span>
                  </div>

                  {inlinePredictionResult.results.map((res, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 truncate max-w-[180px]">
                          {res.filename}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase ${
                            res.prediction === 'ADHD'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          }`}
                        >
                          {res.prediction}
                        </span>
                      </div>

                      {/* Probability Score Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Ensemble Probability:</span>
                          <span className="text-white font-bold">
                            {((res.adhd_probability ?? res.confidence ?? 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              res.prediction === 'ADHD'
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                            }`}
                            style={{ width: `${Math.max((res.adhd_probability ?? res.confidence ?? 0) * 100, 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Individual Sub-model Scores */}
                      {(res.model_probabilities || res.details?.model_probabilities) && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                          {(() => {
                            const scores = res.model_probabilities || res.details?.model_probabilities || {};
                            return (
                              <>
                                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                  <span className="text-slate-400 block">CNN-Trans</span>
                                  <span className="text-cyan-300 font-bold">
                                    {(((scores['CNN + Transformer'] ?? scores['cnn_transformer'] ?? 0)) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                  <span className="text-slate-400 block">PSD-XGB</span>
                                  <span className="text-pink-300 font-bold">
                                    {(((scores['PSD + XGBoost'] ?? scores['xgboost'] ?? 0)) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                  <span className="text-slate-400 block">EEGNet</span>
                                  <span className="text-violet-300 font-bold">
                                    {(((scores['EEGNet'] ?? scores['eegnet'] ?? 0)) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Direct Inspection Action */}
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full text-xs"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          onClick={() => {
                            if (inlinePredictionResult.batch_type === 'single_file') {
                              navigate('/dashboard/results');
                            } else {
                              navigate('/dashboard/batch');
                            }
                          }}
                        >
                          Open In-Depth Diagnostic Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-3xl glass-panel border border-slate-800 backdrop-blur-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      7-Tier Bio-Signal Gatekeeper
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Every uploaded file passes through 7 deterministic biological criteria before entering the deep learning models. Rejects flatlines, voltage saturation, non-biological noise, and incompatible montages.
                  </p>

                  <div className="space-y-2 text-[11px] font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Tier 0A: Numeric Finite Samples (≥128)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Tier 1: Flatline & Dead Channels (std &lt; 1e-6)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Tier 3: Shannon Entropy & Gaussian Noise Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Tier 4: Physiological Bands & 1/f Pink Slope</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Tier 7: 19-Channel 10-20 Standard Montage</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    Upload or select a sample recording to run live validation now.
                  </div>
                </div>
              )}

              {/* Benchmark Reference Datasets Table */}
              <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                  Benchmark Clinical Concordance
                </span>
                <div className="space-y-2 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                    <span>IEEE DataPort (121 children)</span>
                    <span className="text-emerald-400 font-bold">90.91% Concordance</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                    <span>ADHD Cohorts (Part 1 & 2)</span>
                    <span className="text-cyan-300 font-bold">96.7% Sensitivity</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                    <span>Control Cohorts (Part 1 & 2)</span>
                    <span className="text-violet-300 font-bold">85.0% Specificity</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-400">
                    <span>BCI Motor Imagery Non-ADHD</span>
                    <span className="font-bold">100% Correctly Rejected</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Validation Modal Report */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        reports={validationReports}
        onProceedToAnalyze={() => {
          setIsValidationModalOpen(false);
          handleAnalyze();
        }}
      />

      {/* 5-Stage Cinematic Loading Overlay */}
      <CinematicLoadingOverlay
        isAnalyzing={isAnalyzing}
        filename={selectedFiles[0]?.name || 'Recording.eeg'}
        onCancel={() => setIsAnalyzing(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
