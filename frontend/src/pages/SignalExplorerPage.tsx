import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  Info,
  Sliders,
  BarChart2,
  Cpu,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getLatestBatch, getSelectedFileResult } from '../services/storage';
import { FilePredictionResult } from '../types';
import { FREQUENCY_BANDS, STANDARD_19_CHANNELS } from '../utils/sampleData';
import { formatProbability, formatDuration } from '../utils/formatters';
import { WaveformVisualizer } from '../components/charts/WaveformVisualizer';
import { ModelProbabilityBarChart } from '../components/charts/ModelProbabilityBarChart';

export const SignalExplorerPage: React.FC = () => {
  const [result, setResult] = useState<FilePredictionResult | null>(null);

  useEffect(() => {
    const selected = getSelectedFileResult();
    if (selected) {
      setResult(selected);
      return;
    }
    const batch = getLatestBatch();
    if (batch && batch.results && batch.results.length > 0) {
      setResult(batch.results[0]);
    }
  }, []);

  const details = result?.details;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Layers className="w-3.5 h-3.5" />
          <span>Neurophysiological Analytics</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mt-1">
          Signal Explorer & Spectral Analysis
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-mono">
          Investigate multi-channel 10-20 standard waveforms, Welch power spectral densities, and frequency band modulations.
        </p>
      </div>

      {/* Real Summary Metrics Strip (if active result available) */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">RECORDING</span>
            <span className="text-white font-bold truncate block">{result.filename}</span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">MEAN ADHD PROB</span>
            <span className="text-cyan-400 font-bold">
              {formatProbability(result.mean_adhd_probability ?? result.adhd_probability)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">MEDIAN PROB</span>
            <span className="text-white font-bold">
              {formatProbability(result.median_adhd_probability ?? result.adhd_probability)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">ADHD WINDOW %</span>
            <span className="text-amber-400 font-bold">
              {result.adhd_window_percentage ? `${result.adhd_window_percentage.toFixed(1)}%` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">TOTAL WINDOWS</span>
            <span className="text-white font-bold">
              {result.total_windows ?? details?.windows ?? '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">CHANNELS USED</span>
            <span className="text-emerald-400 font-bold">
              {details?.channels_used || 19} / 19
            </span>
          </div>
        </div>
      )}

      {/* Part A: 19-Channel Waveform Explorer */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-white">
            19-Channel Standard 10-20 Continuous Waveform Montage
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Interactive microvolt signals simulated across 19 standard electrode placements at 128 Hz
          </p>
        </div>

        <WaveformVisualizer hasRawSignalData={false} />
      </div>

      {/* Part B: Frequency Band Power Reference & PSD Telemetry */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-white">
            Cortical Frequency Bands & Welch PSD Extraction
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Relative spectral power features computed by the backend's signal.welch pipeline
          </p>
        </div>

        {/* Bands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {FREQUENCY_BANDS.map((band: any) => (
            <div
              key={band.name}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: band.color }}>
                  {band.name}
                </span>
                <span className="text-[10px] text-slate-500">{band.range}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {band.description}
              </p>
            </div>
          ))}
        </div>

        {/* Truthful Backend PSD Feature Extraction Notice */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-slate-200">Feature Engineering Pipeline:</strong>
            <p className="text-[11px]">
              The backend computes Welch Power Spectral Density using <code>scipy.signal.welch(window, fs=128, nperseg=256)</code>, calculating relative band powers across Delta (1–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), and Gamma (30–45 Hz). These 24 statistical features are standardized via <code>psd_scaler.joblib</code> and evaluated by the gradient-boosted tree ensemble (<code>xgboost.json</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Part C: Model Probability Comparison */}
      {result && (
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">
              Ensemble Model Probability Distribution
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Comparing individual model output probabilities against configured ensemble weights
            </p>
          </div>

          <ModelProbabilityBarChart
            modelProbabilities={result.model_probabilities || details?.model_probabilities}
            ensembleWeights={result.ensemble_weights || details?.ensemble_weights}
          />
        </div>
      )}
    </div>
  );
};
