import React, { useState } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  BarChart2,
  Radio,
  Info,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ChannelImpactData {
  channel: string;
  name: string;
  lobe: 'Frontal' | 'Central' | 'Temporal' | 'Parietal' | 'Occipital';
  impactPercent: number; // e.g. 44.8
  adhdAvgTbr: number;
  controlAvgTbr: number;
  primaryAnomaly: string;
  cnnWeight: string;
  eegnetFilter: string;
  xgboostSplit: string;
}

const CHANNELS_DATA: ChannelImpactData[] = [
  {
    channel: 'Fz',
    name: 'Frontal Midline',
    lobe: 'Frontal',
    impactPercent: 44.8,
    adhdAvgTbr: 4.77,
    controlAvgTbr: 0.97,
    primaryAnomaly: 'Sustained Theta excess (4-7 Hz) during cognitive inhibition tasks',
    cnnWeight: 'High attention weight in Multi-Head Transformer layer 3',
    eegnetFilter: 'Kernel #4 spatial weight 0.89 (strongest prefrontal filter)',
    xgboostSplit: 'Top root node split: Fz_Theta_PSD > 38.4 μV²',
  },
  {
    channel: 'Fp1',
    name: 'Left Prefrontal',
    lobe: 'Frontal',
    impactPercent: 41.2,
    adhdAvgTbr: 5.18,
    controlAvgTbr: 1.10,
    primaryAnomaly: 'Left anterior hypofrontality & dopamine transporter deficiency signal',
    cnnWeight: 'Spectrogram 4-8 Hz band power ridge detection',
    eegnetFilter: 'Spatial depthwise convolution weight 0.84',
    xgboostSplit: 'Split level 2: Fp1_TBR > 3.85',
  },
  {
    channel: 'Fp2',
    name: 'Right Prefrontal',
    lobe: 'Frontal',
    impactPercent: 39.5,
    adhdAvgTbr: 5.17,
    controlAvgTbr: 1.10,
    primaryAnomaly: 'Right prefrontal theta burst; correlation with executive inattention',
    cnnWeight: 'Temporal convolutional filter #12',
    eegnetFilter: 'Spatial depthwise convolution weight 0.81',
    xgboostSplit: 'Split level 2: Fp2_TBR > 3.90',
  },
  {
    channel: 'Cz',
    name: 'Central Midline',
    lobe: 'Central',
    impactPercent: 34.2,
    adhdAvgTbr: 2.88,
    controlAvgTbr: 0.77,
    primaryAnomaly: 'Sensorimotor Rhythm (SMR 12-15 Hz) power suppression',
    cnnWeight: 'Cross-channel attention coupling with Fz',
    eegnetFilter: 'Depthwise filter #8 (sensorimotor band-pass)',
    xgboostSplit: 'Root child: Cz_Beta_PSD < 14.2 μV²',
  },
  {
    channel: 'F3',
    name: 'Left Mid-Frontal',
    lobe: 'Frontal',
    impactPercent: 31.8,
    adhdAvgTbr: 4.36,
    controlAvgTbr: 0.96,
    primaryAnomaly: 'Frontal alpha asymmetry shift reflecting emotional dysregulation',
    cnnWeight: 'Spectrogram theta-alpha energy gradient',
    eegnetFilter: 'Spatial filter weight 0.76',
    xgboostSplit: 'Split level 3: F3_Theta_RelPower > 0.42',
  },
  {
    channel: 'F4',
    name: 'Right Mid-Frontal',
    lobe: 'Frontal',
    impactPercent: 30.5,
    adhdAvgTbr: 4.38,
    controlAvgTbr: 0.95,
    primaryAnomaly: 'Right frontal slow-wave elevation correlating with sustained vigilance deficit',
    cnnWeight: 'Spectrogram STFT feature map #6',
    eegnetFilter: 'Spatial filter weight 0.74',
    xgboostSplit: 'Split level 3: F4_Theta_RelPower > 0.41',
  },
  {
    channel: 'C3',
    name: 'Left Central Motor',
    lobe: 'Central',
    impactPercent: 26.4,
    adhdAvgTbr: 2.70,
    controlAvgTbr: 0.76,
    primaryAnomaly: 'Motor cortex desynchronization; physical restlessness marker',
    cnnWeight: '1D Temporal kernel #14',
    eegnetFilter: 'Central motor spatial projection',
    xgboostSplit: 'Split level 4: C3_Beta_PSD < 13.5 μV²',
  },
  {
    channel: 'C4',
    name: 'Right Central Motor',
    lobe: 'Central',
    impactPercent: 25.1,
    adhdAvgTbr: 2.69,
    controlAvgTbr: 0.77,
    primaryAnomaly: 'Contralateral sensorimotor rhythm dampening',
    cnnWeight: '1D Temporal kernel #15',
    eegnetFilter: 'Central motor spatial projection',
    xgboostSplit: 'Split level 4: C4_Beta_PSD < 13.8 μV²',
  },
  {
    channel: 'F7',
    name: 'Left Inferior Frontal',
    lobe: 'Frontal',
    impactPercent: 23.9,
    adhdAvgTbr: 3.57,
    controlAvgTbr: 0.88,
    primaryAnomaly: 'Broca area slow-wave bleed; verbal working memory latency',
    cnnWeight: 'Cross-attention link with temporal T3',
    eegnetFilter: 'Lateral frontal electrode coefficient 0.68',
    xgboostSplit: 'Split level 5: F7_Theta > 31.0 μV²',
  },
  {
    channel: 'F8',
    name: 'Right Inferior Frontal',
    lobe: 'Frontal',
    impactPercent: 22.8,
    adhdAvgTbr: 3.64,
    controlAvgTbr: 0.90,
    primaryAnomaly: 'Inhibition network (rIFG) slow wave during response withholding',
    cnnWeight: 'Spectrogram transient burst detector',
    eegnetFilter: 'Lateral frontal electrode coefficient 0.67',
    xgboostSplit: 'Split level 5: F8_Theta > 30.5 μV²',
  },
  {
    channel: 'T3',
    name: 'Left Mid-Temporal',
    lobe: 'Temporal',
    impactPercent: 19.4,
    adhdAvgTbr: 2.66,
    controlAvgTbr: 0.82,
    primaryAnomaly: 'Auditory sensory gating delay (delayed P300/N200 wave peak)',
    cnnWeight: 'Temporal multi-head projection layer 2',
    eegnetFilter: 'Temporal lateral kernel #6',
    xgboostSplit: 'Split level 6: T3_Theta > 26.2 μV²',
  },
  {
    channel: 'Pz',
    name: 'Parietal Midline',
    lobe: 'Parietal',
    impactPercent: 18.2,
    adhdAvgTbr: 2.40,
    controlAvgTbr: 0.77,
    primaryAnomaly: 'Posterior attention hub alpha desynchronization',
    cnnWeight: 'Spatial self-attention pooling weight',
    eegnetFilter: 'Posterior-anterior balance filter',
    xgboostSplit: 'Split level 6: Pz_Alpha_Beta_Ratio > 1.85',
  },
  {
    channel: 'T4',
    name: 'Right Mid-Temporal',
    lobe: 'Temporal',
    impactPercent: 17.6,
    adhdAvgTbr: 2.69,
    controlAvgTbr: 0.86,
    primaryAnomaly: 'Non-verbal acoustic processing and auditory distractibility marker',
    cnnWeight: 'Temporal convolutional channel filter #9',
    eegnetFilter: 'Temporal lateral kernel #7',
    xgboostSplit: 'Split level 7: T4_Theta > 25.8 μV²',
  },
  {
    channel: 'P3',
    name: 'Left Parietal',
    lobe: 'Parietal',
    impactPercent: 16.5,
    adhdAvgTbr: 2.33,
    controlAvgTbr: 0.75,
    primaryAnomaly: 'Visuospatial working memory load alpha gating variance',
    cnnWeight: 'Parietal spatial embedding layer',
    eegnetFilter: 'Posterior spatial weight 0.58',
    xgboostSplit: 'Split level 7: P3_Beta < 14.5 μV²',
  },
  {
    channel: 'P4',
    name: 'Right Parietal',
    lobe: 'Parietal',
    impactPercent: 15.9,
    adhdAvgTbr: 2.33,
    controlAvgTbr: 0.78,
    primaryAnomaly: 'Right parietal spatial orientation slow wave intrusion',
    cnnWeight: 'Parietal spatial embedding layer',
    eegnetFilter: 'Posterior spatial weight 0.56',
    xgboostSplit: 'Split level 8: P4_Beta < 14.2 μV²',
  },
  {
    channel: 'O1',
    name: 'Left Occipital',
    lobe: 'Occipital',
    impactPercent: 13.8,
    adhdAvgTbr: 1.91,
    controlAvgTbr: 0.67,
    primaryAnomaly: 'Occipital visual alpha peak frequency shift (9.2 Hz vs 10.4 Hz normal)',
    cnnWeight: 'Visual sensory baseline normalization',
    eegnetFilter: 'Occipital boundary constraint filter',
    xgboostSplit: 'Split level 8: O1_Alpha_Peak < 9.8 Hz',
  },
  {
    channel: 'O2',
    name: 'Right Occipital',
    lobe: 'Occipital',
    impactPercent: 13.2,
    adhdAvgTbr: 1.90,
    controlAvgTbr: 0.68,
    primaryAnomaly: 'Right occipital alpha suppression during visual task engagement',
    cnnWeight: 'Visual sensory baseline normalization',
    eegnetFilter: 'Occipital boundary constraint filter',
    xgboostSplit: 'Split level 9: O2_Alpha_Peak < 9.9 Hz',
  },
];

const LOBE_SUMMARIES = [
  {
    lobe: 'Frontal Cortex',
    channels: 'Fp1, Fp2, Fz, F3, F4, F7, F8',
    influence: '41.2%',
    color: 'from-amber-500 to-rose-500',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    mechanism: 'Executive Dysfunction & Theta Slowing',
    detail:
      'Excessive slow-wave theta bursts (4-7 Hz) reflect hypofrontality and insufficient dopamine transport in prefrontal circuits, directly driving CNN spectrogram attention.',
  },
  {
    lobe: 'Central Strip (SMR)',
    channels: 'C3, Cz, C4',
    influence: '26.8%',
    color: 'from-fuchsia-500 to-pink-500',
    borderColor: 'border-fuchsia-500/40',
    textColor: 'text-fuchsia-400',
    mechanism: 'Sensorimotor Agitation & Beta Deficit',
    detail:
      'Sensorimotor rhythm (12-15 Hz) deficit and decreased beta power correlate with physical restlessness and impulse control lapses, captured by EEGNet spatial filters.',
  },
  {
    lobe: 'Temporal Gating',
    channels: 'T3, T4, T5, T6',
    influence: '17.5%',
    color: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    mechanism: 'Auditory Distractibility & Latency',
    detail:
      'Temporal theta elevations link to delayed auditory P300 evoked responses, reflecting difficulties in auditory stream filtering and conversational attention.',
  },
  {
    lobe: 'Parieto-Occipital',
    channels: 'P3, Pz, P4, O1, O2',
    influence: '14.5%',
    color: 'from-violet-500 to-indigo-500',
    borderColor: 'border-violet-500/40',
    textColor: 'text-violet-400',
    mechanism: 'Visual Alpha Desynchronization',
    detail:
      'Posterior alpha peak frequency downshifts (9.2 Hz vs 10.4 Hz neurotypical) indicate reduced visual baseline gating during sustained cognitive focus.',
  },
];

export const CohortChannelImpactMatrix: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelImpactData>(CHANNELS_DATA[0]);
  const [filterLobe, setFilterLobe] = useState<'All' | 'Frontal' | 'Central' | 'Temporal' | 'Parietal' | 'Occipital'>('All');

  const filtered = CHANNELS_DATA.filter(
    (c) => filterLobe === 'All' || c.lobe === filterLobe
  );

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-[0_0_50px_rgba(0,229,255,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Cohort Diagnostic Attribution</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-1">
            Electrode Channel Impact on Model Predictions
          </h3>
          <p className="text-xs md:text-sm text-slate-300 font-bold mt-1">
            How individual 10-20 EEG leads shift the ensemble (CNN Spectrogram, EEGNet Spatial, XGBoost PSD) towards ADHD vs Control
          </p>
        </div>

        {/* Lobe Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono">
          {(['All', 'Frontal', 'Central', 'Temporal', 'Parietal', 'Occipital'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setFilterLobe(l)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterLobe === l
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Lobe High-Impact Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LOBE_SUMMARIES.map((item) => (
          <div
            key={item.lobe}
            className={`p-4 rounded-2xl glass-panel border ${item.borderColor} space-y-2 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold font-heading uppercase ${item.textColor}`}>
                {item.lobe}
              </span>
              <span className="text-base font-bold font-mono text-white px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80">
                {item.influence}
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-400 block">
              Channels: <strong className="text-slate-200">{item.channels}</strong>
            </span>

            <div className="pt-1">
              <strong className="text-xs font-bold text-white block">
                {item.mechanism}
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1 font-sans">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Channel Impact Visualizer: Table/Rankings + Deep-Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Ranked Channel Bar Chart & List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono font-bold text-slate-400">
            <span>ELECTRODE (10-20 SYSTEM)</span>
            <span>DIAGNOSTIC INFLUENCE WEIGHT</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((ch) => {
              const isSelected = selectedChannel.channel === ch.channel;
              return (
                <div
                  key={ch.channel}
                  onClick={() => setSelectedChannel(ch)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                        {ch.channel}
                      </span>
                      <div>
                        <span className="text-white font-bold block">{ch.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {ch.lobe} Lobe • TBR: {ch.adhdAvgTbr} (ADHD) vs {ch.controlAvgTbr} (Ctrl)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        +{ch.impactPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Impact Progress Bar */}
                  <div className="mt-2.5 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ch.lobe === 'Frontal'
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : ch.lobe === 'Central'
                          ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                          : ch.lobe === 'Temporal'
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                          : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                      }`}
                      style={{ width: `${(ch.impactPercent / 45) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Channel Deep-Dive Inspection Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold font-mono flex items-center justify-center text-lg shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                {selectedChannel.channel}
              </span>
              <div>
                <h4 className="text-base font-bold font-heading text-white">
                  {selectedChannel.name}
                </h4>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {selectedChannel.lobe} Cortical Lobe
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">INFLUENCE</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                +{selectedChannel.impactPercent}%
              </span>
            </div>
          </div>

          {/* Primary Biomarker Anomaly */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Primary Biological Anomaly Detected
            </span>
            <p className="text-xs text-slate-200 font-bold leading-relaxed">
              {selectedChannel.primaryAnomaly}
            </p>
          </div>

          {/* TBR Metric Comparative Badge */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] text-amber-300 block font-bold">ADHD COHORT TBR</span>
              <span className="text-xl font-bold text-amber-400">{selectedChannel.adhdAvgTbr}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Excess Slow-Wave</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 block font-bold">CONTROL COHORT TBR</span>
              <span className="text-xl font-bold text-emerald-400">{selectedChannel.controlAvgTbr}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Balanced Baseline</span>
            </div>
          </div>

          {/* Model Influence Breakdown (How 3 Models use this channel) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Three-Model Processing Pathway
            </span>

            {/* CNN */}
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-cyan-500/20 text-xs font-mono space-y-0.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. CNN + Transformer (50% Weight)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold pl-5">
                {selectedChannel.cnnWeight}
              </p>
            </div>

            {/* EEGNet */}
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-violet-500/20 text-xs font-mono space-y-0.5">
              <div className="flex items-center gap-1.5 text-violet-400 font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5" />
                <span>2. EEGNet Spatio-Temporal (25% Weight)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold pl-5">
                {selectedChannel.eegnetFilter}
              </p>
            </div>

            {/* XGBoost */}
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-amber-500/20 text-xs font-mono space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>3. XGBoost PSD Trees (25% Weight)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold pl-5">
                {selectedChannel.xgboostSplit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
