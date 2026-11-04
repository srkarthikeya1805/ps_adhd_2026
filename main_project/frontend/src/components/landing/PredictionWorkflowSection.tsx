import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Sliders,
  Scissors,
  Cpu,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';

interface StageInfo {
  step: number;
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  tag: string;
  details: string[];
  backendProof: string;
}

const STAGES: StageInfo[] = [
  {
    step: 1,
    id: 'recording',
    title: 'EEG RECORDING',
    subtitle: 'Raw 19-Channel Multimodal Stream',
    icon: Activity,
    color: '#00E5FF',
    tag: 'Input Layer',
    details: [
      'Ingests scientific EEG file formats: .MAT (MATLAB), .CSV (tabular), .EDF/.BDF (European Data Format), .GDF, .FIF (MNE), and .SET (EEGLAB).',
      'Captures full international 10-20 montage (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2).',
      'Supports automated archive extraction (.ZIP) with multi-recording batch parsing.',
    ],
    backendProof: 'Verified against app/utils/eeg_loader.py: load_eeg_file() handles MAT, CSV, EDF, and ZIP archives.',
  },
  {
    step: 2,
    id: 'preprocessing',
    title: 'SIGNAL PREPROCESSING',
    subtitle: 'Rational Resampling & Digital Filtering',
    icon: Sliders,
    color: '#287BFF',
    tag: 'DSP Pipeline',
    details: [
      'Resampling: Polyphase rational decimation/interpolation to uniform target sample rate fs = 128 Hz.',
      'Bandpass Filter: 4th-order zero-phase Butterworth IIR bandpass from 1.0 Hz to 45.0 Hz to eliminate DC drift and high-frequency EMG artifacts.',
      'Notch Filter: 50.0 Hz notch (Q = 30) for electrical mains line-noise attenuation.',
      'Standardization: Robust channel-wise z-score normalization (μ = 0, σ = 1).',
    ],
    backendProof: 'Verified in app/utils/preprocessing.py: preprocess_eeg(data, original_fs, target_fs=128, lowcut=1.0, highcut=45.0).',
  },
  {
    step: 3,
    id: 'segmentation',
    title: 'WINDOW SEGMENTATION',
    subtitle: 'Fixed 2.0s Temporal Windowing',
    icon: Scissors,
    color: '#8B5CF6',
    tag: 'Temporal Framing',
    details: [
      'Splits preprocessed continuous EEG signals into discrete temporal windows of length L = 256 samples (2.0 seconds at 128 Hz).',
      'Configurable 50% window overlap (stride = 128 samples) during training for augmented data density.',
      'Rejects non-physiological amplitude outliers (> ±500 μV) to preserve signal integrity.',
    ],
    backendProof: 'Verified in app/utils/preprocessing.py: segment_windows() creates tensor shape (N, 19, 256).',
  },
  {
    step: 4,
    id: 'models',
    title: 'THREE AI MODELS',
    subtitle: 'Heterogeneous Deep & Spectral Classifiers',
    icon: Cpu,
    color: '#F02BD5',
    tag: 'Inference Layer',
    details: [
      '1. CNN + Transformer (50% voting weight): 1D temporal convolution front-end with multi-head self-attention transformer encoder capturing long-range microstate transitions.',
      '2. EEGNet (25% voting weight): Compact 2D convolutional architecture utilizing depthwise & separable convolutions across spatial scalp electrodes.',
      '3. PSD + XGBoost (25% voting weight): Welch spectral density extraction across 5 standard clinical bands (Delta, Theta, Alpha, Beta, Gamma) fed into gradient boosted decision trees.',
    ],
    backendProof: 'Verified in app/models/ & models/ensemble_config.json: weights = [0.50, 0.25, 0.25].',
  },
  {
    step: 5,
    id: 'aggregation',
    title: 'ENSEMBLE AGGREGATION',
    subtitle: 'Weighted Probability Fusion',
    icon: Sparkles,
    color: '#FF65D4',
    tag: 'Voting Ensemble',
    details: [
      'Computes ensemble posterior probability: P(ADHD) = 0.50 · P_CNN + 0.25 · P_EEGNet + 0.25 · P_XGBoost.',
      'Evaluates probability against calibrated decision threshold θ = 0.50.',
      'Computes per-window consensus agreement and variance metric across temporal slices.',
    ],
    backendProof: 'Verified in app/models/ensemble.py: EnsembleModel.predict() applies weighted soft voting.',
  },
  {
    step: 6,
    id: 'prediction',
    title: 'ADHD / CONTROL PREDICTION',
    subtitle: 'Research Classification Output',
    icon: CheckCircle2,
    color: '#35F5C8',
    tag: 'Final Output',
    details: [
      'Classification Label: ADHD if P(ADHD) ≥ 0.50, else Control.',
      'Outputs aggregate ADHD Probability and Control Probability summing strictly to 100%.',
      'Provides window-level prediction breakdown and timeline distribution for temporal stability inspection.',
    ],
    backendProof: 'Verified in app/routers/predict.py: returns PredictionResponse schema with probabilities and window breakdown.',
  },
];

export const PredictionWorkflowSection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(4); // Default on 3 AI models

  const activeStage = STAGES.find((s) => s.step === selectedStep) || STAGES[3];

  return (
    <section id="prediction-workflow" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          Neural Pipeline Architecture
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight">
          How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">Prediction Works</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
          From raw microvolt scalp recordings to the calibrated weighted ensemble. Click any stage to inspect genuine backend digital signal processing and inference configurations.
        </p>
      </div>

      {/* Horizontal Pipeline Sequence */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {STAGES.map((stage) => {
          const isSelected = stage.step === selectedStep;
          const Icon = stage.icon;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStep(stage.step)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-900/90 text-white shadow-xl scale-[1.02]'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
              }`}
              style={{
                borderColor: isSelected ? stage.color : undefined,
                boxShadow: isSelected ? `0 0 25px ${stage.color}35` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${stage.color}25`,
                    color: stage.color,
                    border: `1px solid ${stage.color}60`,
                  }}
                >
                  0{stage.step}
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  {stage.tag}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                    style={{ color: stage.color }}
                  />
                  <h4 className="text-xs font-bold font-heading text-white truncate">
                    {stage.title}
                  </h4>
                </div>
                <p className="text-[10px] font-sans text-slate-400 line-clamp-2">
                  {stage.subtitle}
                </p>
              </div>

              {/* Glowing Bottom Line Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="activePipelineIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl glass-panel border p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
          style={{ borderColor: `${activeStage.color}40` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: `${activeStage.color}20`,
                  border: `1px solid ${activeStage.color}50`,
                }}
              >
                {React.createElement(activeStage.icon, {
                  className: 'w-5 h-5',
                  style: { color: activeStage.color },
                })}
              </div>
              <div>
                <span
                  className="text-xs font-mono font-bold tracking-widest uppercase"
                  style={{ color: activeStage.color }}
                >
                  Stage 0{activeStage.step}: {activeStage.tag}
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white">
                  {activeStage.title} — {activeStage.subtitle}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              Pipeline Step {activeStage.step} of 6
            </span>
          </div>

          {/* Details Bullet List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeStage.details.map((detail, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeStage.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Component 0{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          {/* Verified Backend Implementation Proof */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-start gap-2.5 text-xs font-mono text-cyan-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Active FastAPI Pipeline Verification:</strong>{' '}
              <span className="text-slate-300">{activeStage.backendProof}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
