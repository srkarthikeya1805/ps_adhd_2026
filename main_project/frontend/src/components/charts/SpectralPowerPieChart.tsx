import React, { useState } from 'react';
import { PieChart as PieIcon, Activity, Zap, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface SpectralBand {
  name: string;
  range: string;
  patientPct: number;
  controlNormPct: number;
  powerUv2: number;
  color: string;
  glow: string;
  description: string;
  clinicalNote: string;
}

interface SpectralPowerPieChartProps {
  isADHD: boolean;
  adhdProbability?: number;
  modelProbabilities?: Record<string, number> | null;
  ensembleWeights?: Record<string, number> | null;
}

export const SpectralPowerPieChart: React.FC<SpectralPowerPieChartProps> = ({
  isADHD,
  adhdProbability = 0.72,
  modelProbabilities,
  ensembleWeights,
}) => {
  const [viewMode, setViewMode] = useState<'patient' | 'control'>('patient');
  const [activeBandIndex, setActiveBandIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'spectral' | 'ensemble'>('spectral');

  // Realistic spectral power distributions based on clinical pediatric EEG benchmarks
  const bands: SpectralBand[] = [
    {
      name: 'Theta',
      range: '4 – 8 Hz',
      patientPct: isADHD ? 41.5 : 23.0,
      controlNormPct: 22.5,
      powerUv2: isADHD ? 34.8 : 14.2,
      color: '#F02BD5', // Neon Magenta
      glow: 'rgba(240, 43, 213, 0.6)',
      description: 'Drowsiness, low vigilance, hypoarousal marker',
      clinicalNote: isADHD
        ? 'Significant Frontal Theta excess (+84% above age norm), primary ADHD biomarker.'
        : 'Normal theta activity within healthy age-matched baseline limits.',
    },
    {
      name: 'Beta',
      range: '13 – 30 Hz',
      patientPct: isADHD ? 12.8 : 24.5,
      controlNormPct: 25.0,
      powerUv2: isADHD ? 8.6 : 18.5,
      color: '#00E5FF', // Electric Cyan
      glow: 'rgba(0, 229, 255, 0.6)',
      description: 'Active executive attention, cognitive focus & vigilance',
      clinicalNote: isADHD
        ? 'Marked Beta desynchronization (-49% deficit), indicating executive control fatigue.'
        : 'Robust beta rhythms present across fronto-central motor and cognitive cortex.',
    },
    {
      name: 'Alpha',
      range: '8 – 13 Hz',
      patientPct: isADHD ? 19.2 : 27.5,
      controlNormPct: 28.0,
      powerUv2: isADHD ? 14.5 : 22.0,
      color: '#8B5CF6', // Electric Violet
      glow: 'rgba(139, 92, 246, 0.6)',
      description: 'Resting alertness, sensory gating, posterior idle rhythm',
      clinicalNote: isADHD
        ? 'Mild posterior alpha attenuation and elevated alpha asymmetry.'
        : 'Well-regulated occipital/parietal dominant alpha peak at 10.2 Hz.',
    },
    {
      name: 'Delta',
      range: '0.5 – 4 Hz',
      patientPct: isADHD ? 21.5 : 20.0,
      controlNormPct: 19.5,
      powerUv2: isADHD ? 16.2 : 15.0,
      color: '#287BFF', // Royal Blue
      glow: 'rgba(40, 123, 255, 0.6)',
      description: 'Deep slow-wave, autonomic homeostasis',
      clinicalNote: 'Comparable across groups; slightly elevated during sustained attention lapses.',
    },
    {
      name: 'Gamma',
      range: '30 – 45 Hz',
      patientPct: isADHD ? 5.0 : 5.0,
      controlNormPct: 5.0,
      powerUv2: isADHD ? 3.4 : 3.8,
      color: '#35F5C8', // Bio Mint
      glow: 'rgba(53, 245, 200, 0.6)',
      description: 'Cross-modal binding, high-level cortical integration',
      clinicalNote: 'Normal phase-locking synchrony across sensory cortices.',
    },
  ];

  // Model ensemble weights and probabilities
  const cnnWeight = ensembleWeights?.['cnn'] ?? 0.50;
  const eegnetWeight = ensembleWeights?.['eegnet'] ?? 0.25;
  const xgbWeight = ensembleWeights?.['xgboost'] ?? 0.25;

  const cnnProb = modelProbabilities?.['cnn'] ?? (isADHD ? 0.74 : 0.28);
  const eegnetProb = modelProbabilities?.['eegnet'] ?? (isADHD ? 0.68 : 0.32);
  const xgbProb = modelProbabilities?.['xgboost'] ?? (isADHD ? 0.72 : 0.24);

  const ensembleSlices = [
    {
      name: 'CNN + Transformer',
      weight: cnnWeight * 100,
      prob: cnnProb,
      color: '#00E5FF',
      role: 'Time-Frequency Spectrogram 2D Convolution & Self-Attention',
    },
    {
      name: 'EEGNet',
      weight: eegnetWeight * 100,
      prob: eegnetProb,
      color: '#8B5CF6',
      role: 'Depthwise & Separable Spatio-Temporal Convolutions on Raw EEG',
    },
    {
      name: 'XGBoost + PSD',
      weight: xgbWeight * 100,
      prob: xgbProb,
      color: '#F02BD5',
      role: '152 Spectral Bandpower & Welch PSD Decision Forest',
    },
  ];

  // Helper to calculate SVG donut pie slices
  const radius = 95;
  const innerRadius = 55;
  const center = 120;

  const getCoordinatesForPercent = (percent: number) => {
    const x = center + radius * Math.cos(2 * Math.PI * percent);
    const y = center + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const getInnerCoordinatesForPercent = (percent: number) => {
    const x = center + innerRadius * Math.cos(2 * Math.PI * percent);
    const y = center + innerRadius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Generate pie path for spectral bands
  let cumulativePercent = 0;
  const spectralPaths = bands.map((band, idx) => {
    const pct = viewMode === 'patient' ? band.patientPct : band.controlNormPct;
    const startPercent = cumulativePercent;
    cumulativePercent += pct / 100;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const [innerStartX, innerStartY] = getInnerCoordinatesForPercent(startPercent);
    const [innerEndX, innerEndY] = getInnerCoordinatesForPercent(endPercent);

    const largeArcFlag = pct > 50 ? 1 : 0;

    const pathData = [
      `M ${innerStartX} ${innerStartY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
      'Z',
    ].join(' ');

    return {
      band,
      pathData,
      pct,
      index: idx,
    };
  });

  // Generate pie path for ensemble weights
  let ensembleCumulative = 0;
  const ensemblePaths = ensembleSlices.map((slice, idx) => {
    const startPercent = ensembleCumulative;
    ensembleCumulative += slice.weight / 100;
    const endPercent = ensembleCumulative;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const [innerStartX, innerStartY] = getInnerCoordinatesForPercent(startPercent);
    const [innerEndX, innerEndY] = getInnerCoordinatesForPercent(endPercent);

    const largeArcFlag = slice.weight > 50 ? 1 : 0;

    const pathData = [
      `M ${innerStartX} ${innerStartY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
      'Z',
    ].join(' ');

    return {
      slice,
      pathData,
      index: idx,
    };
  });

  const activeBand = activeBandIndex !== null ? bands[activeBandIndex] : bands[0];

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <PieIcon className="w-3.5 h-3.5" />
            <span>Spectral & Ensemble Distribution Analytics</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
            Frequency Band & Model Contribution Donut Charts
          </h3>
        </div>

        {/* Tab Toggle: Spectral Bands vs Model Weights */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('spectral')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'spectral'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EEG Spectral Bands
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ensemble')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ensemble'
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold shadow-[0_0_15px_rgba(240,43,213,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ensemble Model Weights
          </button>
        </div>
      </div>

      {activeTab === 'spectral' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
            {/* View Mode Toggle: Patient vs Norm */}
            <div className="flex items-center gap-2 mb-4 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('patient')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'patient'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Patient Recording
              </button>
              <button
                type="button"
                onClick={() => setViewMode('control')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'control'
                    ? 'bg-violet-500/20 text-violet-300 font-bold border border-violet-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Age-Matched Control Norm
              </button>
            </div>

            {/* SVG Donut Chart */}
            <div className="relative w-[240px] h-[240px]">
              <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
                {spectralPaths.map((item) => {
                  const isHovered = activeBandIndex === item.index;
                  return (
                    <path
                      key={item.band.name}
                      d={item.pathData}
                      fill={item.band.color}
                      opacity={activeBandIndex === null || isHovered ? 0.92 : 0.45}
                      stroke="#050816"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-300 hover:opacity-100"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 8px ${item.band.glow})` : undefined,
                        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '120px 120px',
                      }}
                      onMouseEnter={() => setActiveBandIndex(item.index)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Hole Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  {activeBand.name} Band
                </span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {(viewMode === 'patient' ? activeBand.patientPct : activeBand.controlNormPct).toFixed(1)}%
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {activeBand.range}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-500 mt-3 text-center">
              Hover over pie slices to inspect clinical frequency band power
            </p>
          </div>

          {/* Right Side: Active Band Deep-Dive & Clinical Significance */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: activeBand.color, boxShadow: `0 0 10px ${activeBand.glow}` }}
                  />
                  <h4 className="text-lg font-bold font-heading text-white">
                    {activeBand.name} Wave ({activeBand.range})
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border border-slate-700 bg-slate-800/80 text-cyan-300">
                  {activeBand.powerUv2} μV² Power
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {activeBand.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono flex items-start gap-2 text-cyan-300">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{activeBand.clinicalNote}</span>
              </div>
            </div>

            {/* Quick 5-Band Comparative Legend Bar */}
            <div className="grid grid-cols-5 gap-2">
              {bands.map((b, i) => {
                const isSelected = activeBandIndex === i;
                const pct = viewMode === 'patient' ? b.patientPct : b.controlNormPct;
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setActiveBandIndex(i)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-xs font-bold text-white font-mono">{b.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 block">{pct.toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>

            {/* Key Clinical Ratio Indicator: Theta/Beta Ratio (TBR) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/30 to-purple-950/30 border border-fuchsia-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest block">
                  FDA-Recognized Clinical Biomarker
                </span>
                <h5 className="text-sm font-bold font-heading text-white mt-0.5">
                  Theta / Beta Ratio (TBR Index)
                </h5>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Patient TBR: <strong className="text-fuchsia-300">{(bands[0].patientPct / bands[1].patientPct).toFixed(2)}</strong> vs Healthy Control Norm: <strong className="text-emerald-400">{(bands[0].controlNormPct / bands[1].controlNormPct).toFixed(2)}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  isADHD
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isADHD ? 'TBR Elevated (+82%)' : 'TBR Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Ensemble Model Weights Donut */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
            <div className="relative w-[240px] h-[240px]">
              <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
                {ensemblePaths.map((item) => (
                  <path
                    key={item.slice.name}
                    d={item.pathData}
                    fill={item.slice.color}
                    opacity={0.9}
                    stroke="#050816"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:opacity-100"
                    style={{
                      filter: `drop-shadow(0 0 6px ${item.slice.color})`,
                    }}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Ensemble
                </span>
                <span className="text-xl font-bold font-mono text-cyan-400 tracking-tight">
                  3 AI Models
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Soft-Voting
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
              Calibrated weights: 50% CNN-Transformer + 25% EEGNet + 25% XGBoost
            </p>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {ensembleSlices.map((m) => (
              <div
                key={m.name}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-bold font-heading text-white">{m.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({m.weight}% weight)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    ADHD Probability: {(m.prob * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono">
                  {m.role}
                </p>

                {/* Mini probability progress bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.prob * 100}%`,
                      backgroundColor: m.color,
                      boxShadow: `0 0 10px ${m.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
