import React, { useState, useRef } from 'react';
import { Cpu, Zap, Layers, Sparkles, HelpCircle, Activity, ZoomIn, CheckCircle2, ShieldCheck } from 'lucide-react';

import cnnImg from '../../assets/spectrogram_cnn_input.jpg';
import eegnetImg from '../../assets/eegnet_visual.jpg';
import xgboostImg from '../../assets/xgboost_visual.jpg';

interface EnsembleCardProps {
  weights?: Record<string, number> | null;
  threshold?: number;
}

interface ModelItem {
  id: string;
  name: string;
  subtitle: string;
  weight: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  glow: string;
  icon: any;
  image: string;
  imageCaption: string;
  description: string;
  inputs: string;
  architectureDetails: string;
  keyMetrics: { label: string; value: string }[];
}

export const EnsembleCard: React.FC<EnsembleCardProps> = ({
  weights,
  threshold = 0.5,
}) => {
  const [modalImage, setModalImage] = useState<{ src: string; title: string } | null>(null);

  const w1 = weights?.cnn_transformer ?? 0.5;
  const w2 = weights?.eegnet ?? 0.25;
  const w3 = weights?.xgboost ?? 0.25;

  const models: ModelItem[] = [
    {
      id: 'cnn_transformer',
      name: '1. CNN + Transformer',
      subtitle: '2D Time-Frequency Spectrogram Vision Architecture',
      weight: `${(w1 * 100).toFixed(0)}%`,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
      borderColor: 'border-cyan-500/40',
      glow: 'shadow-[0_0_30px_rgba(0,229,255,0.25)]',
      icon: Cpu,
      image: cnnImg,
      imageCaption: 'Model Input: 2D Spectrogram Heatmap Image (0-50 Hz) showing Frontal Theta Power Burst',
      description:
        'Takes continuous 19-channel EEG signals transformed into 2D Time-Frequency Spectrogram Images. 2D Convolutional kernels scan the spectrogram like a medical visual image, detecting frequency energy ridges, followed by multi-head self-attention across 10-second temporal windows.',
      inputs: 'Tensor: [Windows, 1280, 19] → Spectrogram [Freq, Time]',
      architectureDetails: 'STFT Spectrogram → 2D Conv (64 filters) → Positional Embedding → Multi-Head Self-Attention (4 heads) → Dense Logits',
      keyMetrics: [
        { label: 'Input Modality', value: '2D Spectrogram Image' },
        { label: 'Attention Heads', value: '4 Self-Attention' },
        { label: 'Voting Weight', value: '50% (Primary)' },
      ],
    },
    {
      id: 'eegnet',
      name: '2. EEGNet Spatio-Temporal',
      subtitle: 'Compact Depthwise & Separable Convolutional Net',
      weight: `${(w2 * 100).toFixed(0)}%`,
      color: 'text-violet-400',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-400/50',
      borderColor: 'border-violet-500/40',
      glow: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
      icon: Layers,
      image: eegnetImg,
      imageCaption: 'EEGNet Architecture: Depthwise Temporal Convolutions + 10-20 Spatial Scalp Filters',
      description:
        'Specialized neuro-engineering architecture designed for raw electroencephalography signals. Utilizes depthwise temporal convolution filters to learn frequency band features (Theta, Alpha, Beta) and separable spatial filters to model electrode cross-talk across the 10-20 cap.',
      inputs: 'Tensor: [Windows, 1280, 19 Channels]',
      architectureDetails: 'Temporal Conv (1×64) → Depthwise Spatial Conv (19×1) → Separable Conv (1×16) → Average Pooling → Dense Sigmoid',
      keyMetrics: [
        { label: 'Input Modality', value: 'Raw Multi-Channel EEG' },
        { label: 'Spatial Filter', value: '19 Electrodes' },
        { label: 'Voting Weight', value: '25% (Spatio-Temporal)' },
      ],
    },
    {
      id: 'xgboost',
      name: '3. PSD + XGBoost Forest',
      subtitle: 'Welch Spectral Density & Gradient Boosted Trees',
      weight: `${(w3 * 100).toFixed(0)}%`,
      color: 'text-fuchsia-400',
      badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50',
      borderColor: 'border-fuchsia-500/40',
      glow: 'shadow-[0_0_30px_rgba(240,43,213,0.25)]',
      icon: Zap,
      image: xgboostImg,
      imageCaption: 'XGBoost Feature Forest: Delta, Theta, Alpha, Beta, Gamma Bands & TBR Split Trees',
      description:
        'Extracts 152 rigorous neurospectral features via Welch periodogram: Relative Power in Delta, Theta, Alpha, Beta, Gamma bands, Theta/Beta Ratio (TBR Index), Root-Mean-Square variance, and spectral entropy, classified through an ensemble of 150 gradient-boosted decision trees.',
      inputs: 'Vector: 152 Neurospectral Features',
      architectureDetails: 'Welch Periodogram → Relative Band Powers (Delta, Theta, Alpha, Beta, Gamma, TBR) → StandardScaler → XGBoost (150 Trees)',
      keyMetrics: [
        { label: 'Input Modality', value: '152 Spectral Features' },
        { label: 'Decision Trees', value: '150 Estimators' },
        { label: 'Voting Weight', value: '25% (Spectral PSD)' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Three Model Cards with High-Resolution Explanatory Images */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <div
              key={model.id}
              className={`relative p-6 rounded-3xl glass-panel border ${model.borderColor} ${model.glow} flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:border-cyan-400/60`}
            >
              <div className="space-y-4 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
                    <Icon className={`w-6 h-6 ${model.color}`} />
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      Voting Weight
                    </span>
                    <span className={`text-2xl font-bold font-heading ${model.color}`}>
                      {model.weight}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white font-heading">
                    {model.name}
                  </h3>
                  <span className="text-xs text-cyan-300 font-mono font-semibold block mt-0.5">
                    {model.subtitle}
                  </span>
                </div>

                {/* Engaging High-Tech Model Architecture Image */}
                <div
                  onClick={() => setModalImage({ src: model.image, title: model.name })}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-700/80 hover:border-cyan-400 transition-all duration-300 shadow-xl"
                >
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-44 object-cover filter brightness-95 group-hover:brightness-105 group-hover:scale-102 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end justify-between p-2.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                      <ZoomIn className="w-3 h-3" /> Click to Inspect
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border bg-slate-900/90 text-emerald-400 border-emerald-500/40">
                      Active
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-400 leading-tight text-center">
                  {model.imageCaption}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                  {model.description}
                </p>

                {/* 3 Bold Key Metric Chips */}
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  {model.keyMetrics.map((km, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">{km.label}</span>
                      <span className="text-[11px] text-white font-bold block truncate">{km.value}</span>
                    </div>
                  ))}
                </div>

                {/* Internal Pipeline Detail */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                    Internal Pipeline Flow:
                  </div>
                  <div className="text-slate-300 leading-tight font-semibold">
                    {model.architectureDetails}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold relative z-10 mt-3">
                <span className="text-slate-400">{model.inputs}</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Weights</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ensemble Mathematical Consensus Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-heading text-sm font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Configured Ensemble Decision Formulation (Bayesian Soft Voting)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold text-white text-sm md:text-base overflow-x-auto shadow-inner">
          <code>
            P_ensemble = ({w1.toFixed(2)} × P_CNN) + ({w2.toFixed(2)} × P_EEGNet) + ({w3.toFixed(2)} × P_XGBoost)
          </code>
        </div>

        <div className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed font-sans pt-1">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white font-bold">Consensus Rule:</strong> If P_ensemble ≥ {threshold.toFixed(2)}, the recording is assigned an ADHD-Class prediction. The 50% CNN weighting captures time-frequency spectrogram visual dynamics, while EEGNet and XGBoost ensure spatio-temporal and statistical frequency corroboration, maximizing clinical specificity.
          </p>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-base font-bold font-heading text-white">
                {modalImage.title} — High-Resolution Inspection
              </h4>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl">
              <img
                src={modalImage.src}
                alt={modalImage.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
