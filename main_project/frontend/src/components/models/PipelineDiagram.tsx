import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode,
  CheckCircle2,
  GitBranch,
  Activity,
  Filter,
  Zap,
  Sliders,
  Grid,
  Cpu,
  Layers,
  Sparkles,
  Award,
  ChevronDown,
} from 'lucide-react';

export const PipelineDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'EEG Input Ingestion',
      subtitle: '.mat, .csv, .tsv, .npy, .edf, .bdf, .gdf, .fif, .set, .zip',
      icon: FileCode,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      details:
        'Safe multi-format ingestion engine with Zip-Slip defense and companion file segregation (chan.mat, triggers, stimulus labels).',
    },
    {
      id: 2,
      title: 'Polymorphic File Parsing',
      subtitle: 'MATLAB v5/v7/v7.3, MCOS Tables, EDF+ Reader',
      icon: GitBranch,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      details:
        'Extracts multidimensional microvolt voltage matrices from nested MATLAB structs, HDF5 trees, IEEE double arrays, or MNE biosignal formats.',
    },
    {
      id: 3,
      title: '19-Channel Harmonization',
      subtitle: 'Standard 10-20 Montage Lookup (60+ Aliases)',
      icon: Grid,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      details:
        'Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2. Missing or sparse channels are projected topographically across the scalp.',
    },
    {
      id: 4,
      title: 'Polyphase Rational Resampling',
      subtitle: 'Target Frequency = 128.0 Hz',
      icon: Activity,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      details:
        'Uses polyphase rational resampling to convert varying clinical sampling rates (200, 250, 256, 500, 1000 Hz) to the exact 128 Hz expected by trained neural weights.',
    },
    {
      id: 5,
      title: 'Butterworth DSP & Notch Filtering',
      subtitle: '1.0 – 45.0 Hz Bandpass + 50.0 Hz Notch Filter',
      icon: Filter,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      details:
        '4th-order zero-phase Butterworth bandpass filter (1–45 Hz) removes DC drift and muscle noise; IIR notch filter removes 50 Hz powerline interference.',
    },
    {
      id: 6,
      title: 'Per-Channel Z-Score Normalization',
      subtitle: 'Zero-Mean & Unit-Variance Standardization',
      icon: Sliders,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      details:
        'Normalizes each electrode trace independently (x - μ) / σ to stabilize gradient propagation and eliminate subject-specific skin impedance offsets.',
    },
    {
      id: 7,
      title: 'Temporal Windowing Segmentation',
      subtitle: '10-Second Windows (1280 samples) with 50% Overlap',
      icon: Layers,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      details:
        'Segments continuous multi-channel signals into [Windows, 1280, 19] tensors with 640-sample (5.0s) temporal stride.',
    },
    {
      id: 8,
      title: 'Three-Model Hybrid Execution',
      subtitle: 'CNN-Transformer (50%) • EEGNet (25%) • PSD-XGBoost (25%)',
      icon: Cpu,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/15',
      borderColor: 'border-cyan-400/50',
      details:
        'Runs parallel inference: spatial-temporal self-attention, depthwise EEGNet convolutions, and Welch spectral power feature classification.',
    },
    {
      id: 9,
      title: 'Weighted Ensemble Aggregation',
      subtitle: 'P_ens = 0.50·P_CNN + 0.25·P_EEG + 0.25·P_XGB',
      icon: Sparkles,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/15',
      borderColor: 'border-violet-400/50',
      details:
        'Window-level probabilities are aggregated via weighted sum and whole-recording mean voting compared against the configured decision threshold (0.50).',
    },
    {
      id: 10,
      title: 'Final Clinical Research Output',
      subtitle: 'Binary Prediction (ADHD vs Control) & Confidence',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      details:
        'Outputs detailed JSON report with window timeline, ADHD probability percentage, and full preprocessing telemetry.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white font-heading">
          End-to-End Signal & Inference Architecture
        </h3>
        <p className="text-xs md:text-sm text-slate-400 font-mono">
          Click any stage to expand technical pipeline specifications
        </p>
      </div>

      <div className="space-y-3 relative before:absolute before:left-7 md:before:left-1/2 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-violet-500/50 before:to-emerald-500/50 before:-translate-x-1/2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isEven = idx % 2 === 0;
          const isExpanded = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={`relative flex items-center gap-4 md:gap-8 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline Center Node */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-xl md:absolute md:left-1/2 md:-translate-x-1/2">
                <Icon className={`w-5 h-5 ${step.color}`} />
              </div>

              {/* Content Card */}
              <div
                onClick={() => setActiveStep(isExpanded ? null : step.id)}
                className={`flex-1 p-4 rounded-2xl glass-panel border ${step.borderColor} cursor-pointer transition-all duration-200 hover:border-cyan-400/60 md:w-[calc(50%-40px)] ${
                  isEven ? 'md:mr-auto' : 'md:ml-auto'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Step {step.id < 10 ? `0${step.id}` : step.id}
                    </span>
                    <h4 className="text-sm font-bold text-white font-heading">{step.title}</h4>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </div>

                <p className="text-xs text-slate-400 font-mono mt-1">{step.subtitle}</p>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-sans"
                  >
                    {step.details}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
