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
  Zap,
  Eye,
  Radio,
  Brain,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { getLatestBatch, getSelectedFileResult } from '../services/storage';
import { FilePredictionResult } from '../types';
import { FREQUENCY_BANDS, STANDARD_19_CHANNELS } from '../utils/sampleData';
import { formatProbability, formatDuration } from '../utils/formatters';
import { WaveformVisualizer } from '../components/charts/WaveformVisualizer';
import { ModelProbabilityBarChart } from '../components/charts/ModelProbabilityBarChart';
import { AuraTiltCard } from '../components/common/AuraTiltCard';

// Comprehensive 10-20 channel electrode metadata
interface ChannelMeta {
  channel: string;
  lobe: string;
  band: string;
  rangeUv: string;
  adhdImpact: string;
  significance: string;
}

const ELECTRODE_DETAILS: Record<string, ChannelMeta> = {
  Fp1: {
    channel: 'Fp1',
    lobe: 'Prefrontal (Left)',
    band: 'Theta / Slow Wave',
    rangeUv: '-25 to +35 μV',
    adhdImpact: 'Elevated Theta Wave Power',
    significance: 'Critical marker for executive dysregulation and impulse inhibition delay.',
  },
  Fp2: {
    channel: 'Fp2',
    lobe: 'Prefrontal (Right)',
    band: 'Theta / Alpha',
    rangeUv: '-22 to +38 μV',
    adhdImpact: 'Frontal Asymmetry Imbalance',
    significance: 'Emotional regulation & novelty-seeking response tracking.',
  },
  Fz: {
    channel: 'Fz',
    lobe: 'Midline Frontal',
    band: 'Theta / Beta Ratio',
    rangeUv: '-30 to +45 μV',
    adhdImpact: 'Highest ADHD Diagnostic Sensitivity (TBR > 3.0)',
    significance: 'Primary clinical electrode for Theta-to-Beta continuous vigilance assessment.',
  },
  F3: {
    channel: 'F3',
    lobe: 'Dorsolateral Prefrontal (L)',
    band: 'Low Beta (13-18 Hz)',
    rangeUv: '-18 to +28 μV',
    adhdImpact: 'Hypofrontality & Attentional Lapses',
    significance: 'Working memory maintenance and goal-directed sustained focus.',
  },
  F4: {
    channel: 'F4',
    lobe: 'Dorsolateral Prefrontal (R)',
    band: 'Beta / Gamma',
    rangeUv: '-19 to +30 μV',
    adhdImpact: 'Vigilance Drift & Behavioral Inhibition',
    significance: 'Response inhibition control during continuous performance tasks.',
  },
  F7: {
    channel: 'F7',
    lobe: 'Inferior Frontal (L)',
    band: 'Theta / Alpha',
    rangeUv: '-15 to +25 μV',
    adhdImpact: 'Verbal Working Memory Load',
    significance: 'Broca area speech planning and cognitive verbal organization.',
  },
  F8: {
    channel: 'F8',
    lobe: 'Inferior Frontal (R)',
    band: 'Theta / Alpha',
    rangeUv: '-16 to +26 μV',
    adhdImpact: 'Impulsivity & Motor Urge Gating',
    significance: 'Right inferior frontal gyrus (rIFG) response inhibition circuit.',
  },
  Cz: {
    channel: 'Cz',
    lobe: 'Central Vertex',
    band: 'Sensorimotor Rhythm (SMR)',
    rangeUv: '-20 to +32 μV',
    adhdImpact: 'SMR 12-15 Hz Depletion',
    significance: 'Key target for ADHD neurofeedback. SMR suppression triggers physical restlessness.',
  },
  C3: {
    channel: 'C3',
    lobe: 'Sensorimotor Cortex (L)',
    band: 'Mu Rhythm (8-12 Hz)',
    rangeUv: '-18 to +28 μV',
    adhdImpact: 'Motor Hyperactivity Tremors',
    significance: 'Contralateral fine-motor execution and tactile sensory integration.',
  },
  C4: {
    channel: 'C4',
    lobe: 'Sensorimotor Cortex (R)',
    band: 'Mu Rhythm (8-12 Hz)',
    rangeUv: '-18 to +29 μV',
    adhdImpact: 'Physical Restlessness & Fidgeting',
    significance: 'Involuntary motor suppression and sensory feedback processing.',
  },
  T3: {
    channel: 'T3',
    lobe: 'Mid-Temporal (L)',
    band: 'Alpha / Theta',
    rangeUv: '-14 to +22 μV',
    adhdImpact: 'Auditory Distraction Susceptibility',
    significance: 'Auditory continuous processing and language interpretation speed.',
  },
  T4: {
    channel: 'T4',
    lobe: 'Mid-Temporal (R)',
    band: 'Alpha / Theta',
    rangeUv: '-14 to +24 μV',
    adhdImpact: 'Tone Perception & Emotional Noise',
    significance: 'Environmental acoustic background filter; high distractibility in loud settings.',
  },
  T5: {
    channel: 'T5',
    lobe: 'Posterior Temporal (L)',
    band: 'Alpha (8-13 Hz)',
    rangeUv: '-12 to +20 μV',
    adhdImpact: 'Visual-Language Associative Delay',
    significance: 'Wernicke junction; semantic processing during written academic tasks.',
  },
  T6: {
    channel: 'T6',
    lobe: 'Posterior Temporal (R)',
    band: 'Alpha (8-13 Hz)',
    rangeUv: '-13 to +21 μV',
    adhdImpact: 'Visual Pattern Recognition Lapses',
    significance: 'Facial and emotional social cue interpretation.',
  },
  Pz: {
    channel: 'Pz',
    lobe: 'Midline Parietal',
    band: 'P300 Event-Related Potential',
    rangeUv: '-24 to +38 μV',
    adhdImpact: 'Attenuated P300 Amplitude',
    significance: 'Clinically proven reduced P300 peak amplitude in ADHD during oddball cognitive tests.',
  },
  P3: {
    channel: 'P3',
    lobe: 'Parietal Association (L)',
    band: 'Alpha Desynchronization',
    rangeUv: '-16 to +26 μV',
    adhdImpact: 'Mathematical & Spatial Working Memory',
    significance: 'Multi-modal sensory integration and sequential spatial calculations.',
  },
  P4: {
    channel: 'P4',
    lobe: 'Parietal Association (R)',
    band: 'Alpha Desynchronization',
    rangeUv: '-17 to +27 μV',
    adhdImpact: 'Spatial Neglect & Selective Attention',
    significance: 'Top-down attentional orienting and mental rotation tasks.',
  },
  O1: {
    channel: 'O1',
    lobe: 'Primary Visual Cortex (L)',
    band: 'Posterior Alpha (8-12 Hz)',
    rangeUv: '-20 to +35 μV',
    adhdImpact: 'Alpha Suppression Failure',
    significance: 'Eyes-closed alpha rhythm generation and visual gaze stabilization.',
  },
  O2: {
    channel: 'O2',
    lobe: 'Primary Visual Cortex (R)',
    band: 'Posterior Alpha (8-12 Hz)',
    rangeUv: '-22 to +36 μV',
    adhdImpact: 'Visual Vigilance Exhaustion',
    significance: 'Sustained visual attention during screen reading or visual tracking tasks.',
  },
};

export const SignalExplorerPage: React.FC = () => {
  const [result, setResult] = useState<FilePredictionResult | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('Fz');

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
  const activeMeta = ELECTRODE_DETAILS[selectedChannel] || ELECTRODE_DETAILS['Fz'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#20BFE8] uppercase tracking-widest">
          <Layers className="w-3.5 h-3.5 text-[#20BFE8]" />
          <span>Neurophysiological Analytics</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mt-1">
          Signal Explorer & Spectral Analysis
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-mono">
          Investigate 3D EEG scalp electrode montage, 10-20 standard waveforms, Welch power spectral densities, and frequency band modulations.
        </p>
      </div>

      {/* Real Summary Metrics Strip (if active result available) */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">RECORDING</span>
            <span className="text-white font-bold truncate block">{result.filename}</span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">MEAN ADHD PROB</span>
            <span className="text-[#20BFE8] font-bold">
              {formatProbability(result.mean_adhd_probability ?? result.adhd_probability)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">MEDIAN PROB</span>
            <span className="text-white font-bold">
              {formatProbability(result.median_adhd_probability ?? result.adhd_probability)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">ADHD WINDOW %</span>
            <span className="text-amber-400 font-bold">
              {result.adhd_window_percentage ? `${result.adhd_window_percentage.toFixed(1)}%` : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">TOTAL WINDOWS</span>
            <span className="text-white font-bold">
              {result.total_windows ?? details?.windows ?? '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-[#20BFE8]/25 space-y-1">
            <span className="text-slate-500 block text-[10px]">CHANNELS USED</span>
            <span className="text-emerald-400 font-bold">
              {details?.channels_used || 19} / 19
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURED: 3D EEG SCALP ELECTRODES SHOWCASE (User's Exact Ref Image)       */}
      {/* ========================================================================= */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(32,191,232,0.15)] bg-gradient-to-b from-[#030919]/90 to-[#020512]/95">
        
        {/* Header HUD with Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20BFE8]/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20BFE8]/15 border border-[#20BFE8]/40 text-[#79DFFF] text-[11px] font-mono font-bold tracking-wider uppercase mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SCENE 03 / 11 • 3D ROTATING HEAD WITH CLICKABLE ELECTRODES</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-heading text-white flex items-center gap-2.5">
              <span>EEG Scalp Electrodes & Multi-Lead Stream</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Standardized 10-20 international cap placement with biological frequency wave emissions
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              19 Leads Synchronized
            </span>
          </div>
        </div>

        {/* 3D Showcase Grid: Exact Image on Left + Interactive Electrode Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: The 3D Rotating Head with Clickable Electrodes with Aura 3D Tilt */}
          <div className="lg:col-span-7">
            <AuraTiltCard
              maxTilt={12}
              scale={1.03}
              glare={true}
              floatClass="animate-aura-float-slow"
              className="relative rounded-2xl overflow-hidden border border-[#20BFE8]/50 shadow-[0_0_35px_rgba(32,191,232,0.25)] bg-[#010410] group"
            >
              <img
                src="/images/eeg_scalp_electrodes_3d.png"
                alt="EEG Scalp Electrodes - 3D Rotating Head with Clickable Electrodes"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Glowing Corner Accents */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#00081c]/80 border border-[#20BFE8]/40 backdrop-blur-md text-[10px] font-mono text-[#79DFFF] flex items-center gap-1.5">
                <Brain className="w-3 h-3 text-[#20BFE8]" />
                <span>10-20 SCALP TOPOGRAPHY</span>
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#00081c]/80 border border-emerald-500/40 backdrop-blur-md text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE POTENTIALS: ±50 μV</span>
              </div>
            </AuraTiltCard>

            {/* Bottom 3 Waveform Monitors (Reflecting the Wave Displays in Image) */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#140804]/70 border border-orange-500/40 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-orange-400 font-bold">SLOW POTENTIAL</span>
                  <span className="text-slate-400">1–4 Hz</span>
                </div>
                <div className="h-6 flex items-center">
                  <svg className="w-full h-full text-orange-400" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path
                      d="M 0 12 Q 15 2, 30 12 T 60 12 T 90 12 L 100 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <span className="text-[9px] text-slate-400 block font-mono">Delta / Slow Cortical Shift</span>
              </div>

              <div className="p-3 rounded-xl bg-[#040e1f]/70 border border-[#20BFE8]/40 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#20BFE8] font-bold">THETA / ALPHA</span>
                  <span className="text-slate-400">4–12 Hz</span>
                </div>
                <div className="h-6 flex items-center">
                  <svg className="w-full h-full text-[#20BFE8]" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path
                      d="M 0 12 Q 8 2, 16 12 T 32 12 T 48 12 T 64 12 T 80 12 T 96 12 L 100 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <span className="text-[9px] text-slate-400 block font-mono">Sensory Rhythms & TBR</span>
              </div>

              <div className="p-3 rounded-xl bg-[#041a12]/70 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">FAST BETA</span>
                  <span className="text-slate-400">13–30 Hz</span>
                </div>
                <div className="h-6 flex items-center">
                  <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path
                      d="M 0 12 Q 4 4, 8 12 T 16 12 T 24 12 T 32 12 T 40 12 T 48 12 T 56 12 T 64 12 T 72 12 T 80 12 T 88 12 T 96 12 L 100 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <span className="text-[9px] text-slate-400 block font-mono">Active Focus Oscillations</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive 10-20 Channel Selector & Real-Time Lobe Diagnostics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#061126]/80 border border-[#20BFE8]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  CLICK ELECTRODE TO INSPECT:
                </span>
                <span className="text-[10px] font-mono text-[#20BFE8]">19 Leads</span>
              </div>

              {/* 19 Clickable Channel Pills Grid */}
              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                {STANDARD_19_CHANNELS.map((ch) => {
                  const isSelected = selectedChannel === ch;
                  const isFrontal = ['Fp1', 'Fp2', 'F3', 'F4', 'Fz', 'F7', 'F8'].includes(ch);
                  const isCentral = ['C3', 'C4', 'Cz'].includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                        isSelected
                          ? 'bg-[#20BFE8] text-black shadow-[0_0_15px_#20BFE8] scale-105'
                          : isFrontal
                          ? 'bg-[#0087FF]/20 text-[#79DFFF] hover:bg-[#0087FF]/35 border border-[#0087FF]/40'
                          : isCentral
                          ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/35'
                          : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Channel Detailed Telemetry Card */}
            <div className="p-5 rounded-2xl bg-[#08152e]/90 border border-[#20BFE8]/35 space-y-3 shadow-[0_0_20px_rgba(32,191,232,0.15)]">
              <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#20BFE8]/20 border border-[#20BFE8] flex items-center justify-center font-mono font-extrabold text-[#79DFFF]">
                    {activeMeta.channel}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-heading">{activeMeta.lobe}</h4>
                    <span className="text-[11px] font-mono text-cyan-300">{activeMeta.band}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">VOLTAGE</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{activeMeta.rangeUv}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">ADHD BIOMARKER IMPACT</span>
                  <span className="text-amber-400 font-bold">{activeMeta.adhdImpact}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">NEUROLOGICAL SIGNIFICANCE</span>
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                    {activeMeta.significance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part A: 19-Channel Continuous Waveform Explorer */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/25 space-y-6">
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
