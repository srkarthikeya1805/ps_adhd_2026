import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  GitBranch,
  FolderArchive,
  Maximize2,
} from 'lucide-react';

import cnnSpectrogramImg from '../../assets/spectrogram_cnn_input.jpg';
import eegnetImg from '../../assets/eegnet_visual.jpg';
import xgboostImg from '../../assets/xgboost_visual.jpg';

interface CinematicLoadingOverlayProps {
  isAnalyzing: boolean;
  filename?: string;
  onCancel?: () => void;
}

interface StepItem {
  id: number;
  badge: string;
  title: string;
  desc: string;
  model: string;
  image?: string;
  imageLabel?: string;
}

export const CinematicLoadingOverlay: React.FC<CinematicLoadingOverlayProps> = ({
  isAnalyzing,
  filename = 'Recording.zip',
  onCancel,
}) => {
  const [currentStage, setCurrentStage] = useState(1);

  const steps: StepItem[] = [
    {
      id: 1,
      badge: 'ARCHIVE & TENSOR INGESTION',
      title: 'Unpacking Archive & Aligning 19 Scalp Channels',
      desc: 'Decompressing ZIP / CSV tensors, normalizing to 128 Hz sampling rate across 10-20 standard leads.',
      model: 'Universal Ingestion Engine',
    },
    {
      id: 2,
      badge: 'TIME-FREQUENCY CONVERSION',
      title: 'Generating Spectrogram Images for CNN Input',
      desc: 'Converting 1D raw microvolt voltages into 2D Time-Frequency Spectrogram images via Short-Time Fourier Transform.',
      model: 'STFT / Wavelet Transformer',
      image: cnnSpectrogramImg,
      imageLabel: 'CNN Model Input: 2D Time-Frequency Spectrogram Image (0-50 Hz)',
    },
    {
      id: 3,
      badge: 'MODEL 1 / 3 INFERENCE',
      title: 'CNN + Transformer Spectrogram Vision Processing',
      desc: '2D Convolutional kernels scan the spectrogram image to detect frontal theta power bursts and multi-head attention.',
      model: 'CNN + Transformer (50% Weight)',
      image: cnnSpectrogramImg,
      imageLabel: '2D Convolutional Layers Extracting Spatial-Frequency Ridges',
    },
    {
      id: 4,
      badge: 'MODEL 2 / 3 INFERENCE',
      title: 'EEGNet Depthwise Spatio-Temporal Convolutions',
      desc: 'Directly filters raw temporal waveforms, applying spatial electrode filters across the 10-20 head montage.',
      model: 'EEGNet (25% Weight)',
      image: eegnetImg,
      imageLabel: 'EEGNet: Depthwise Temporal & Spatial Electrode Filters',
    },
    {
      id: 5,
      badge: 'MODEL 3 / 3 INFERENCE',
      title: 'PSD + XGBoost Decision Tree Forest',
      desc: 'Extracting 152 Welch Power Spectral Density features (Delta, Theta, Alpha, Beta, Gamma, TBR) through gradient boosted trees.',
      model: 'XGBoost (25% Weight)',
      image: xgboostImg,
      imageLabel: 'XGBoost: Frequency Band Splits & Theta/Beta Ratio (TBR) Trees',
    },
    {
      id: 6,
      badge: 'ENSEMBLE SYNTHESIS',
      title: '50-25-25 Weighted Soft-Voting Consensus',
      desc: 'Calculating calibrated probability: P = 0.50·CNN + 0.25·EEGNet + 0.25·XGBoost and compiling clinical report.',
      model: 'Bayesian Calibrated Ensemble',
    },
  ];

  // Fast, responsive animated stage timer (advances quickly so user is not kept waiting)
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 750); // Fast 750ms step transition

    return () => clearInterval(interval);
  }, [isAnalyzing, steps.length]);

  if (!isAnalyzing) return null;

  const currentStep = steps[currentStage - 1] || steps[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050816]/95 backdrop-blur-2xl select-none"
      >
        <div className="relative w-full max-w-2xl p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/50 shadow-[0_0_80px_rgba(0,229,255,0.3)] space-y-6 overflow-hidden">
          {/* Ambient Cyber Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-cyan-500/25 via-violet-500/20 to-transparent filter blur-3xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                Processing Recording
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700 truncate max-w-xs">
              {filename}
            </span>
          </div>

          {/* Dynamic Image Process Visual Showcase */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/80 shadow-2xl h-52 md:h-60 flex items-center justify-center">
            {currentStep.image ? (
              <motion.div
                key={currentStep.image}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex flex-col justify-end"
              >
                <img
                  src={currentStep.image}
                  alt={currentStep.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                />

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00e5ff] animate-pulse transform -translate-y-full" style={{
                    animation: 'scanline 2s infinite ease-in-out'
                  }} />
                </div>

                {/* Caption Bar */}
                <div className="relative z-10 bg-slate-950/85 backdrop-blur-md p-2.5 px-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {currentStep.imageLabel}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Stream</span>
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  <Cpu className="w-7 h-7 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <h4 className="text-base font-bold font-heading text-white">
                  {currentStep.title}
                </h4>
                <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                  {currentStep.desc}
                </p>
              </div>
            )}
          </div>

          {/* Current Step Description & Metadata */}
          <div className="space-y-1.5 relative z-10 text-left">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Step 0{currentStep.id} of 06 • {currentStep.badge}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {currentStep.model}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold font-heading text-white">
              {currentStep.title}
            </h3>

            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {currentStep.desc}
            </p>
          </div>

          {/* 6-Segment Progress Bar */}
          <div className="grid grid-cols-6 gap-2 pt-2 relative z-10">
            {steps.map((st) => (
              <div
                key={st.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  st.id <= currentStage
                    ? 'bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_10px_rgba(0,229,255,0.7)]'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
            <span>Synchronizing with FastAPI 3-Model Ensemble...</span>
            <span className="text-cyan-300 font-bold">
              {Math.min(100, Math.round((currentStage / steps.length) * 100))}%
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
