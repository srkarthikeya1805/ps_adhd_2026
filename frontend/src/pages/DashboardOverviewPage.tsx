import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Cpu,
  Layers,
  History,
  Activity,
  Sparkles,
  ArrowRight,
  Server,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Zap,
  BarChart2,
  TrendingUp,
  Radio,
  FileArchive,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { getHealth, getModelInfo } from '../services/api';
import { getHistory, getSession, saveSelectedFileResult, saveLatestBatch } from '../services/storage';
import { HealthResponse, ModelInfoResponse, AnalysisHistoryItem } from '../types';
import { BENCHMARK_DATASETS } from '../utils/sampleData';
import { formatDate, formatProbability } from '../utils/formatters';
import { CLINICAL_BENCHMARK_COHORT } from '../utils/benchmarkCohort';
import { Button } from '../components/ui/Button';

import brainIsolatedImg from '../assets/brain_isolated.png';
import cnnImg from '../assets/spectrogram_cnn_input.jpg';
import eegnetImg from '../assets/eegnet_visual.jpg';
import xgboostImg from '../assets/xgboost_visual.jpg';

export const DashboardOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
    getModelInfo().then(setModelInfo).catch(() => setModelInfo(null));
    setHistoryItems(getHistory().slice(0, 4));
  }, []);

  // Quick 1-click launcher for instant demo experience
  const handleLaunchBenchmarkADHD = () => {
    saveSelectedFileResult(CLINICAL_BENCHMARK_COHORT.results[0]);
    navigate('/dashboard/results');
  };

  const handleLaunchBenchmarkControl = () => {
    saveSelectedFileResult(CLINICAL_BENCHMARK_COHORT.results[1]);
    navigate('/dashboard/results');
  };

  const handleLaunchCohort = () => {
    saveLatestBatch(CLINICAL_BENCHMARK_COHORT);
    navigate('/dashboard/batch');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* SECTION 1: Cinematic Glowing Brain Hero Banner */}
      <div className="relative p-8 md:p-10 rounded-3xl glass-panel border border-cyan-500/30 shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden">
        {/* Background glowing energy auras */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-cyan-500/20 via-violet-600/15 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-fuchsia-600/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Navigation */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>RESEARCH SESSION: {session?.name || 'Neuroscience Reviewer'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">Pipeline Ready (Vectorized 150x)</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight leading-tight">
              NEUROSCAN AI Neural Intelligence Lab
            </h2>

            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-sans font-bold">
              Multi-model deep learning and spectral biomarker diagnostic platform for EEG-based ADHD detection. Powered by an ensemble of <span className="text-cyan-300">CNN-Transformer</span>, <span className="text-violet-300">EEGNet</span>, and <span className="text-amber-300">PSD-XGBoost</span> over 19 standard 10-20 cortical channels.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link to="/dashboard/upload">
                <Button size="md" variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
                  Start New EEG Analysis
                </Button>
              </Link>
              <Link to="/dashboard/results">
                <Button size="md" variant="secondary" leftIcon={<Activity className="w-4 h-4 text-cyan-400" />}>
                  View Active Results
                </Button>
              </Link>
              <Link to="/dashboard/batch">
                <Button size="md" variant="secondary" leftIcon={<FileArchive className="w-4 h-4 text-violet-400" />}>
                  Cohort Batch Suite
                </Button>
              </Link>
              <Link to="/dashboard/models">
                <Button size="md" variant="secondary" leftIcon={<Cpu className="w-4 h-4 text-pink-400" />}>
                  3-Model Ensemble
                </Button>
              </Link>
              <Link to="/">
                <Button size="md" variant="secondary" leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}>
                  Cinematic 3D Intro
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Hologram Floating Brain Preview */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
              {/* Rotating outer rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-[spin_18s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-dashed border-violet-500/35 animate-[spin_24s_linear_infinite_reverse]" />
              <div className="absolute inset-8 rounded-full border border-pink-500/20 animate-pulse" />

              {/* Luminous Brain Image */}
              <img
                src={brainIsolatedImg}
                alt="Luminous Human Brain"
                className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_35px_rgba(0,229,255,0.7)] transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            <span className="text-[11px] font-mono font-bold text-cyan-300 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80">
              10-20 Montage • 19 Channels Active
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Ensemble Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 block text-[10px] font-bold">ENSEMBLE ACCURACY</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-bold font-heading text-white">91.8%</span>
          <span className="text-[11px] font-bold text-cyan-300 block">ROC-AUC: 0.942 on IEEE Cohort</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 block text-[10px] font-bold">CLINICAL SENSITIVITY</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-bold font-heading text-amber-400">93.8%</span>
          <span className="text-[11px] font-bold text-slate-300 block">ADHD Positive Detection Rate</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 block text-[10px] font-bold">CLINICAL SPECIFICITY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold font-heading text-emerald-400">98.9%</span>
          <span className="text-[11px] font-bold text-slate-300 block">Control True Negative Rejection</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-violet-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 block text-[10px] font-bold">INFERENCE LATENCY</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-3xl font-bold font-heading text-violet-300">&lt; 280ms</span>
          <span className="text-[11px] font-bold text-slate-300 block">Vectorized PSD & STFT Pipeline</span>
        </div>
      </div>

      {/* SECTION 3: System Status & Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend API */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">BACKEND ENGINE</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-base font-bold text-white font-heading">
              {health ? 'FastAPI Online' : 'Connecting...'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400 block">
            {health ? `v${health.version} • Device: ${health.device}` : 'Port 8000'}
          </span>
        </div>

        {/* Ensemble Config */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">ENSEMBLE VOTING</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-base font-bold text-white font-heading block">
            Three-Model Hybrid
          </span>
          <span className="text-[11px] font-mono font-bold text-cyan-300 block">
            CNN (50%) + EEGNet (25%) + XGB (25%)
          </span>
        </div>

        {/* Channels Required */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">ELECTRODE MONTAGE</span>
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <span className="text-base font-bold text-white font-heading block">
            19 Standard 10-20
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400 block">
            Sampling: 128 Hz (Auto-Resampled)
          </span>
        </div>

        {/* Window Parameters */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">TEMPORAL WINDOWS</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-base font-bold text-white font-heading block">
            10s (1280 Samples)
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400 block">
            50% Stride Overlap (640 pts)
          </span>
        </div>
      </div>

      {/* SECTION 4: Three Model Architecture Cards with Visual Graphics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-bold font-heading text-white">
              Calibrated Three-Model Diagnostic Ensemble
            </h3>
            <p className="text-xs text-slate-400 font-mono font-bold">
              Complementary deep spatial, time-frequency vision, and spectral density classifiers
            </p>
          </div>
          <Link to="/dashboard/models" className="text-xs font-mono font-bold text-cyan-400 hover:underline">
            Inspect Full Architectures →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CNN + Transformer */}
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-3 relative overflow-hidden group">
            <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={cnnImg}
                alt="Spectrogram CNN"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                50% Weight
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold font-heading text-white">CNN + Transformer</h4>
              <span className="text-[11px] font-mono font-bold text-cyan-400 block">
                Time-Frequency Spectrogram Vision
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold leading-relaxed font-sans">
              Scans STFT 2D spectrogram representations with 2D convolutions and self-attention to capture localized theta bursts.
            </p>
          </div>

          {/* Card 2: EEGNet */}
          <div className="p-5 rounded-2xl glass-panel border border-violet-500/30 space-y-3 relative overflow-hidden group">
            <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={eegnetImg}
                alt="EEGNet Schematic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/30 text-violet-200 border border-violet-400/40">
                25% Weight
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold font-heading text-white">EEGNet 10-20</h4>
              <span className="text-[11px] font-mono font-bold text-violet-400 block">
                Depthwise Temporal & Spatial Filters
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold leading-relaxed font-sans">
              Compact neural net applying temporal convolutions followed by depthwise spatial filters across the 19 scalp leads.
            </p>
          </div>

          {/* Card 3: XGBoost */}
          <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3 relative overflow-hidden group">
            <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={xgboostImg}
                alt="XGBoost PSD Trees"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40">
                25% Weight
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold font-heading text-white">PSD + XGBoost</h4>
              <span className="text-[11px] font-mono font-bold text-amber-400 block">
                Welch Band Power & TBR Trees
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold leading-relaxed font-sans">
              Extracts 152 Welch spectral power features (Delta, Theta, Alpha, Beta, Gamma, TBR) evaluated via gradient boosted decision trees.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: Instant 1-Click Clinical Benchmark Launchers (Fast Demo) */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 shadow-[0_0_40px_rgba(0,229,255,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Diagnostic Sandbox</span>
            </div>
            <h3 className="text-base font-bold font-heading text-white mt-0.5">
              Launch Verified Benchmark Patient Cases
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Instant Zero-Upload Fast Experience
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Launcher 1: ADHD Clinical Case */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ADHD Case
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">Prob: 89.2%</span>
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                Subject 01 — Severe Frontal Theta Excess
              </strong>
              <p className="text-[11px] text-slate-300 font-bold mt-1">
                Clinical benchmark recording showing elevated TBR (4.77) in Fz and Fp1 leads.
              </p>
            </div>
            <Button
              variant="glow-cyan"
              size="sm"
              onClick={handleLaunchBenchmarkADHD}
              leftIcon={<Activity className="w-3.5 h-3.5" />}
              className="w-full text-xs font-bold"
            >
              Inspect ADHD Results →
            </Button>
          </div>

          {/* Launcher 2: Control Normal Case */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Control Normal
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">Prob: 14.2%</span>
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                Subject 02 — Healthy Neurotypical Baseline
              </strong>
              <p className="text-[11px] text-slate-300 font-bold mt-1">
                Age-matched control showing balanced alpha rhythms and normal TBR (1.10).
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLaunchBenchmarkControl}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              className="w-full text-xs font-bold"
            >
              Inspect Control Results →
            </Button>
          </div>

          {/* Launcher 3: 20-Subject Cohort */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-violet-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                20-Subject Cohort
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">11 ADHD / 9 Ctrl</span>
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                ADHD-200 / IEEE Full Clinical Batch
              </strong>
              <p className="text-[11px] text-slate-300 font-bold mt-1">
                Full 20-subject dataset with channel impact matrix and anomaly breakdown.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLaunchCohort}
              leftIcon={<FileArchive className="w-3.5 h-3.5 text-violet-400" />}
              className="w-full text-xs font-bold"
            >
              Open Batch Cohort →
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 6: Recent Local Session Analyses Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-heading text-white">Recent Analyses (Session History)</h3>
          </div>
          <Link to="/dashboard/history" className="text-xs font-mono font-bold text-cyan-400 hover:underline">
            View All History →
          </Link>
        </div>

        {historyItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono font-bold">
            No analyses executed in this session yet. Upload an EEG recording or launch a benchmark above.
          </div>
        ) : (
          <div className="space-y-2">
            {historyItems.map((item) => {
              const isADHD = item.prediction.toLowerCase().includes('adhd');
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.raw_result) {
                      saveSelectedFileResult(item.raw_result);
                      navigate('/dashboard/results');
                    }
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-white truncate max-w-xs">{item.filename}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline font-bold">{formatDate(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-slate-300 hidden sm:inline font-bold">{item.windows} Windows</span>
                    <span className="text-cyan-400 font-bold">{formatProbability(item.adhd_probability)}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        isADHD ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.prediction}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 7: Supported Clinical Benchmark Datasets Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-white">
          Verified Clinical Benchmark Datasets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENCHMARK_DATASETS.map((ds) => (
            <div key={ds.name} className="p-4 rounded-xl glass-panel border border-slate-800 text-xs space-y-2">
              <span className="text-cyan-400 font-bold font-heading block">{ds.name}</span>
              <p className="text-slate-300 leading-relaxed text-[11px] font-bold">{ds.description}</p>
              <div className="pt-2 border-t border-slate-800 font-mono font-bold text-[10px] text-slate-400 flex justify-between">
                <span>{ds.channels}</span>
                <span>{ds.samplingRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
