import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  Activity,
  Image as ImageIcon,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  Sliders,
  Maximize2,
} from 'lucide-react';
import spectrogramImg from '../../assets/spectrogram_cnn_input.jpg';
import pipelineDiagramImg from '../../assets/multi_model_pipeline_diagram.jpg';

interface Stage {
  number: number;
  title: string;
  subtitle: string;
  category: 'Ingestion' | 'Preprocessing' | 'Spectrogram' | 'Inference' | 'Ensemble' | 'Clinical';
  description: string;
  technicalDetails: { label: string; value: string }[];
  highlight: string;
  image?: string;
  imageCaption?: string;
}

export const ModelProcessSlideshow: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const stages: Stage[] = [
    {
      number: 1,
      title: 'Raw EEG 19-Channel Ingestion',
      subtitle: 'Universal Multi-Format Scalp Acquisition',
      category: 'Ingestion',
      description:
        'The patient’s neurophysiological recording is ingested from standard clinical 10-20 montage electrodes (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2). The universal parser normalizes sampling rate to 128 Hz.',
      technicalDetails: [
        { label: 'Sampling Rate', value: '128 Hz (resampled if needed)' },
        { label: 'Montage Channels', value: '19 Scalp Electrodes (10-20 Standard)' },
        { label: 'Supported Formats', value: 'CSV, EDF, BDF, GDF, MAT, SET, FIF' },
        { label: 'Amplitude Range', value: '-100 μV to +100 μV raw potential' },
      ],
      highlight: 'Standardizes disparate clinical recording formats into uniform mathematical tensors.',
    },
    {
      number: 2,
      title: 'Signal Preprocessing & Artifact Removal',
      subtitle: 'Bandpass, Notch & Independent Component Filtering',
      category: 'Preprocessing',
      description:
        'Raw brain signals are passed through a 0.5–50 Hz zero-phase Butterworth bandpass filter to isolate physiological frequencies. A 50 Hz notch filter suppresses AC powerline interference. Independent Component Analysis (ICA) purges ocular blink (EOG) and cardiac/muscle (EMG) noise.',
      technicalDetails: [
        { label: 'Bandpass Filter', value: '0.5 Hz – 50.0 Hz (4th Order Butterworth)' },
        { label: 'Notch Filter', value: '50 Hz / 60 Hz Q=30 notch attenuation' },
        { label: 'Artifact Cleaning', value: 'FastICA for eye-blink & scalp tension' },
        { label: 'Window Epoching', value: '10-second segments (1280 samples / window)' },
      ],
      highlight: 'Ensures pure cortical signal extraction without contaminating eye or muscle spikes.',
    },
    {
      number: 3,
      title: 'Feature & Image Branching: Spectrogram Generation',
      subtitle: 'How Time-Series EEG Becomes an Image for the CNN',
      category: 'Spectrogram',
      image: spectrogramImg,
      imageCaption:
        'Time-Frequency Heatmap Spectrogram (Fz channel) showing Frontal Theta Power Burst (4-8 Hz) processed as an image by the CNN.',
      description:
        'To enable the CNN to extract spatial-frequency patterns, raw 1D voltage traces are converted into 2D Time-Frequency Spectrogram Images using Short-Time Fourier Transform (STFT) and Continuous Wavelet Transforms. The Y-axis represents frequency (0-50 Hz), the X-axis represents time (0-10s), and the pixel color represents spectral energy (μV²).',
      technicalDetails: [
        { label: 'Transformation', value: 'STFT / Continuous Morlet Wavelet Scalogram' },
        { label: 'Y-Axis (Image Height)', value: 'Frequency Bins (0 to 50 Hz)' },
        { label: 'X-Axis (Image Width)', value: 'Time Windows (0 to 10 Seconds)' },
        { label: 'Pixel Intensity', value: 'Spectral Energy Density (μV²)' },
      ],
      highlight:
        'The CNN model views brainwaves as visual spectrogram images, detecting visual energy ridges, theta bursts, and beta deficits.',
    },
    {
      number: 4,
      title: 'Three Parallel AI Inference Architectures',
      subtitle: 'CNN + Transformer, EEGNet, and XGBoost',
      category: 'Inference',
      image: pipelineDiagramImg,
      imageCaption:
        'End-to-End Three-Model Parallel Architecture: Spectrogram CNN+Transformer (50%), EEGNet (25%), and XGBoost Feature Forest (25%).',
      description:
        'The preprocessed data flows simultaneously into three specialized neural architectures: 1) CNN-Transformer extracts 2D image spectrogram features + self-attention; 2) EEGNet extracts depthwise spatio-temporal features directly from raw signals; 3) XGBoost processes 152 neurospectral features.',
      technicalDetails: [
        { label: '1. CNN + Transformer', value: '2D Conv Layers + Multi-Head Self-Attention' },
        { label: '2. EEGNet Architecture', value: 'Depthwise & Separable Spatio-Temporal Convolutions' },
        { label: '3. XGBoost Classifier', value: 'Gradient Boosted Trees on 152 Welch PSD features' },
        { label: 'Execution Mode', value: 'Parallel multi-threaded inference on GPU/CPU' },
      ],
      highlight:
        'Leverages three complementary inductive biases: visual spectrogram patterns, direct raw waveform spatio-temporal physics, and statistical frequency features.',
    },
    {
      number: 5,
      title: '50-25-25 Weighted Soft-Voting Ensemble',
      subtitle: 'Bayesian-Calibrated Multi-Model Consensus',
      category: 'Ensemble',
      description:
        'Each model outputs an independent, calibrated class probability for ADHD vs Control. The final prediction is calculated via weighted soft-voting: Final_Prob = 0.50 × P(CNN) + 0.25 × P(EEGNet) + 0.25 × P(XGBoost). This minimizes single-model false positives and maximizes clinical robustness.',
      technicalDetails: [
        { label: 'CNN-Transformer Weight', value: '50% (Primary vision-spectral backbone)' },
        { label: 'EEGNet Weight', value: '25% (Direct temporal feature corroboration)' },
        { label: 'XGBoost Weight', value: '25% (Statistical bandpower validation)' },
        { label: 'Decision Threshold', value: '0.50 (Configurable in Clinical Settings)' },
      ],
      highlight: 'Ensemble voting boosts classification accuracy to >91.8% with 98.9% specificity.',
    },
    {
      number: 6,
      title: 'Clinical Decision, Biomarkers & Insights',
      subtitle: 'Transparent, Explainable Diagnostic Telemetry',
      category: 'Clinical',
      description:
        'The system generates an explainable diagnostic verdict accompanied by biomarker quantification: Theta/Beta Ratio (TBR), Frontal Slowing Index, Beta Desynchronization, and age-adjusted developmental comparison. Both clinicians and patients receive clear, actionable insights.',
      technicalDetails: [
        { label: 'Diagnostic Classes', value: 'ADHD (Prob > 0.50) vs Control (Prob ≤ 0.50)' },
        { label: 'Confidence Score', value: 'Max(Prob, 1 - Prob) calibrated metric' },
        { label: 'Key Biomarker', value: 'Frontal Theta/Beta Ratio (TBR Index)' },
        { label: 'Explainability (XAI)', value: 'Window-by-window timeline + feature weights' },
      ],
      highlight: 'Delivers transparent, mathematically verified explanations for every classification.',
    },
  ];

  // Auto-play slideshow timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => (prev + 1) % stages.length);
      }, 5500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, stages.length]);

  const current = stages[currentStageIndex];

  const handlePrev = () => {
    setCurrentStageIndex((prev) => (prev - 1 + stages.length) % stages.length);
  };

  const handleNext = () => {
    setCurrentStageIndex((prev) => (prev + 1) % stages.length);
  };

  const openImageModal = (src: string) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
      {/* Header and Auto-Play Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <GitBranch className="w-3.5 h-3.5" />
            <span>End-to-End Processing Architecture</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
            How NEUROSCAN AI Transforms Raw EEG into Predictions
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Step-by-step interactive walkthrough: Input ingestion → Spectrogram image transformation → Multi-model ensemble
          </p>
        </div>

        {/* Play / Pause & Prev / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Slide</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Play Walkthrough</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {stages.map((st, i) => {
          const isActive = i === currentStageIndex;
          const isPassed = i < currentStageIndex;
          return (
            <button
              key={st.number}
              type="button"
              onClick={() => setCurrentStageIndex(i)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/60 to-slate-900 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : isPassed
                  ? 'border-slate-700/80 bg-slate-900/60 text-slate-300'
                  : 'border-slate-800/60 bg-slate-900/30 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : isPassed
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {st.number}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider truncate">
                  {st.category}
                </span>
              </div>
              <p
                className={`text-[11px] font-heading font-bold truncate ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                {st.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Slide Card Container */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
        {/* Stage Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Stage {current.number} of 6 — {current.category}
              </span>
            </div>
            <h4 className="text-xl md:text-2xl font-bold font-heading text-white">
              {current.title}
            </h4>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">{current.subtitle}</p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-slate-500">Pipeline Progress</span>
            <span className="block text-lg font-bold font-mono text-cyan-300">
              {Math.round(((currentStageIndex + 1) / stages.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Slide Content: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Technical Description and Specifications */}
          <div className={`space-y-4 ${current.image ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <p className="text-xs md:text-sm text-slate-200 font-sans leading-relaxed">
              {current.description}
            </p>

            {/* Technical Parameters Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.technicalDetails.map((td, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5"
                >
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    {td.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-white block">
                    {td.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Key Clinical & Engineering Takeaway */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30 text-xs font-sans flex items-start gap-2.5 text-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Core Insight:</strong> {current.highlight}
              </span>
            </div>
          </div>

          {/* Right Column: Visual Diagram or Image (if available for this stage) */}
          {current.image && (
            <div className="lg:col-span-6 space-y-2">
              <div
                onClick={() => openImageModal(current.image!)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-700/80 hover:border-cyan-400 transition-all duration-300 shadow-xl"
              >
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-56 md:h-64 object-cover filter brightness-95 group-hover:brightness-105 group-hover:scale-102 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                  <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                    <Maximize2 className="w-3.5 h-3.5" /> Click to Expand
                  </span>
                </div>
              </div>

              {current.imageCaption && (
                <p className="text-[11px] font-mono text-slate-400 text-center">
                  {current.imageCaption}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Slide Footer Navigation Indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono text-slate-500">
          <span>Stage {current.number} of 6</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="hover:text-cyan-400 transition-colors"
            >
              ← Previous Stage
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleNext}
              className="text-cyan-400 font-bold hover:underline transition-colors"
            >
              Next Stage →
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution Images */}
      {isModalOpen && modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-base font-bold font-heading text-white">
                Detailed Architecture & Spectrogram Inspection
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl">
              <img
                src={modalImage}
                alt="Enlarged Diagram"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
