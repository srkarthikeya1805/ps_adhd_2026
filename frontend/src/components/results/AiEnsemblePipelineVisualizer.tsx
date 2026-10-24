import React, { useState, useEffect } from 'react';
import { Cpu, Zap, GitBranch, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { FilePredictionResult } from '../../types';
import { formatProbability } from '../../utils/formatters';

export interface AiEnsemblePipelineVisualizerProps {
  result: FilePredictionResult;
  className?: string;
}

export const AiEnsemblePipelineVisualizer: React.FC<AiEnsemblePipelineVisualizerProps> = ({
  result,
  className = '',
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const modelProbs = result.model_probabilities || {
    cnn: 0.78,
    xgboost: 0.72,
    eegnet: 0.69,
  };

  const weights = result.ensemble_weights || {
    cnn: 0.60,
    xgboost: 0.30,
    eegnet: 0.10,
  };

  const threshold = result.threshold ?? 0.49;
  const adhdProb = result.adhd_probability ?? 0.742;
  const isADHD = result.prediction === 'ADHD';

  // The 3 actual backend models
  const branches = [
    {
      id: 'cnn_transformer',
      name: 'CNN-Transformer',
      weight: weights.cnn ?? 0.60,
      prob: modelProbs.cnn ?? 0.78,
      architecture: '1D Temporal Convolutions + Multi-Head Self-Attention',
      input: '1280 raw temporal samples (10s @ 128 Hz)',
      color: '#00F0FF',
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    },
    {
      id: 'psd_xgboost',
      name: 'Welch PSD + XGBoost',
      weight: weights.xgboost ?? 0.30,
      prob: modelProbs.xgboost ?? 0.72,
      architecture: '5-Band Spectral Density + Gradient Boosted Trees',
      input: 'Delta, Theta, Alpha, Beta, Gamma power features',
      color: '#F02BD5',
      badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-500/10',
    },
    {
      id: 'eegnet',
      name: 'EEGNet',
      weight: weights.eegnet ?? 0.10,
      prob: modelProbs.eegnet ?? 0.69,
      architecture: 'Depthwise & Separable Spatial Convolutions',
      input: '19-channel scalp spatial-temporal field array',
      color: '#8B5CF6',
      badgeColor: 'border-violet-500/40 text-violet-300 bg-violet-500/10',
    },
  ];

  return (
    <div className={`p-6 rounded-3xl glass-panel border border-cyan-500/30 space-y-8 shadow-2xl ${className}`}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Model Architecture Pipeline</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-white mt-1">
            Calibrated Heterogeneous Multi-Model Ensemble Workflow
          </h3>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Active Ingestion: <strong>{result.filename}</strong></span>
        </span>
      </div>

      {/* Pipeline Diagram Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Step 1: Ingestion & Preprocessing Node */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
              INPUT NODE
            </span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h4 className="text-sm font-heading font-bold text-white">Preprocessed EEG Tensor</h4>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <div>Channels: <span className="text-slate-200">19 Standard (10-20)</span></div>
            <div>Resampling: <span className="text-slate-200">128 Hz Uniform</span></div>
            <div>Bandpass: <span className="text-slate-200">1.0 – 45.0 Hz</span></div>
            <div>Windowing: <span className="text-slate-200">10s (50% Overlap)</span></div>
          </div>
        </div>

        {/* Step 2: The 3 Parallel Model Branches */}
        <div className="lg:col-span-6 space-y-3">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 relative overflow-hidden space-y-2 group hover:border-cyan-400/60 transition-all"
            >
              {/* Traveling Signal Pulse Wire */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transition-transform"
                style={{
                  transform: `translateY(${(pulsePhase * 2) % 100 - 50}%)`,
                  backgroundColor: b.color,
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${b.badgeColor}`}>
                    WEIGHT: {(b.weight * 100).toFixed(0)}%
                  </span>
                  <h5 className="text-sm font-heading font-bold text-white">{b.name}</h5>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: b.color }}>
                  P(ADHD) = {formatProbability(b.prob)}
                </span>
              </div>

              <p className="text-[11px] font-mono text-slate-400 leading-snug">{b.architecture}</p>

              {/* Individual Probability Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${b.prob * 100}%`, backgroundColor: b.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Step 3: Ensemble Soft-Voting Fusion Node */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              FUSION OUTPUT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              Ensemble Probability:
            </span>
            <span className="text-3xl font-black font-heading text-white">
              {formatProbability(adhdProb)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Threshold:</span>
              <span className="text-white font-bold">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Classification:</span>
              <span className={isADHD ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {result.prediction}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Boundary Formula Equation Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1.5 font-mono text-xs">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
          Active Weighted Soft-Voting Formulation:
        </span>
        <div className="text-xs sm:text-sm text-slate-200 font-bold">
          <span className="text-cyan-400">0.60 · P(CNN-Transformer)</span> +{' '}
          <span className="text-pink-400">0.30 · P(Welch PSD)</span> +{' '}
          <span className="text-violet-400">0.10 · P(EEGNet)</span> ={' '}
          <span className="text-emerald-400">{formatProbability(adhdProb)}</span> ≥{' '}
          <span className="text-white">{(threshold * 100).toFixed(0)}% → {result.prediction}</span>
        </div>
      </div>
    </div>
  );
};
