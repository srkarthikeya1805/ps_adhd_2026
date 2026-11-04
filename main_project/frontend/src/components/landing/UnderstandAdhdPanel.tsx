import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Dna,
  Zap,
  Leaf,
  Moon,
  Activity,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const UnderstandAdhdPanel: React.FC = () => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const factors = [
    {
      id: 'genetics',
      name: 'Genetic Predisposition',
      desc: '70–80% estimated heritability across twin cohorts; polygenic risk score architecture involves synaptic cell-adhesion and dopamine receptor genes.',
    },
    {
      id: 'neurotransmitter',
      name: 'Neurotransmitter Imbalance',
      desc: 'Dysregulation in dopaminergic and noradrenergic frontostriatal transmission impairs prefrontal signal-to-noise tuning and impulse suppression.',
    },
    {
      id: 'environment',
      name: 'Environmental Factors',
      desc: 'Perinatal complications, low gestational weight, and early environmental stressors interact epigenetically with genetic vulnerabilities.',
    },
    {
      id: 'development',
      name: 'Brain Development Differences',
      desc: 'Delayed peak cortical maturation (2–3 years) observed in prefrontal cortex and anterior cingulate networks modulating executive function.',
    },
    {
      id: 'sleep',
      name: 'Sleep & Lifestyle',
      desc: 'Circadian phase delays and altered sleep spindle densities correlate with daytime fronto-central slow-wave EEG theta/beta ratio shifts.',
    },
  ];

  return (
    <div
      id="understand-adhd"
      className="w-full rounded-2xl glass-panel border border-cyan-500/30 p-4 shadow-[0_0_35px_rgba(0,229,255,0.12)] space-y-4 backdrop-blur-xl text-left"
    >
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold font-heading text-white tracking-wider">
              UNDERSTAND ADHD
            </h3>
            <span className="text-[9px] font-mono text-cyan-400 block -mt-0.5">
              Multifactorial Neuroscience Insights
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          Research Spec
        </span>
      </div>

      {/* ========================================================= */}
      {/* SUB-CARD 1: POSSIBLE CAUSES / FACTORS */}
      {/* ========================================================= */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">
          Possible Causes / Factors
        </span>

        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Left: Glowing Brain Thumbnail Illustration */}
          <div className="col-span-4 flex items-center justify-center relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 via-violet-500/20 to-pink-500/20 p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.25)] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-14 h-14 filter drop-shadow-[0_0_8px_#00e5ff]">
                {/* Stylized Glowing Brain Silhouette with colored lobes */}
                <path
                  d="M50 15 C35 15, 20 25, 20 40 C18 48, 22 55, 26 62 C30 70, 42 78, 48 85 C50 87, 50 87, 52 85 C58 78, 70 70, 74 62 C78 55, 82 48, 80 40 C80 25, 65 15, 50 15 Z"
                  fill="url(#brainGrad)"
                  stroke="#00E5FF"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* Lobe division highlights */}
                <path d="M50 18 Q50 50 50 82" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="2,2" />
                <path d="M25 42 Q50 52 75 42" stroke="#F02BD5" strokeWidth="1.2" strokeDasharray="2,2" />
                {/* Glowing Nodes */}
                <circle cx="36" cy="32" r="3" fill="#00E5FF" />
                <circle cx="64" cy="32" r="3" fill="#35F5C8" />
                <circle cx="32" cy="52" r="2.5" fill="#8B5CF6" />
                <circle cx="68" cy="52" r="2.5" fill="#F02BD5" />
                <circle cx="50" cy="68" r="3" fill="#287BFF" />
                <defs>
                  <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#287BFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.2" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right: Bullet List of Factors */}
          <div className="col-span-8 space-y-1">
            {factors.map((factor) => {
              const isSelected = selectedFactor === factor.id;
              return (
                <button
                  key={factor.id}
                  onClick={() => setSelectedFactor(isSelected ? null : factor.id)}
                  className={`w-full flex items-center gap-1.5 text-left text-[11px] font-sans py-0.5 px-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#00e5ff]" />
                  <span className="truncate">{factor.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Factor Detail Drawer */}
        <AnimatePresence>
          {selectedFactor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[10px] text-slate-300 font-mono leading-relaxed overflow-hidden"
            >
              <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                <span>{factors.find((f) => f.id === selectedFactor)?.name}</span>
                <span className="text-[9px] text-slate-500">PubMed / DSM-5</span>
              </div>
              <p>{factors.find((f) => f.id === selectedFactor)?.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* SUB-CARD 2: HOW WE PREDICT? */}
      {/* ========================================================= */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">
          How We Predict?
        </span>

        <div className="grid grid-cols-4 gap-1 items-center relative py-1">
          {/* Step 1: EEG Signals */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-400/50 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(40,123,255,0.3)] mb-1 group-hover:scale-105 transition-transform">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-medium text-slate-300 leading-tight">
              EEG Signals
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute left-[22%] top-3.5 text-slate-600 font-mono text-xs pointer-events-none">
            →
          </div>

          {/* Step 2: Preprocessing */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)] mb-1 group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-medium text-slate-300 leading-tight">
              Preprocessing
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute left-[47%] top-3.5 text-slate-600 font-mono text-xs pointer-events-none">
            →
          </div>

          {/* Step 3: 3 AI Models */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-400/50 flex items-center justify-center text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)] mb-1 group-hover:scale-105 transition-transform">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-medium text-slate-300 leading-tight">
              3 AI Models
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute left-[72%] top-3.5 text-slate-600 font-mono text-xs pointer-events-none">
            →
          </div>

          {/* Step 4: ADHD / Control */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-400/50 flex items-center justify-center text-pink-400 shadow-[0_0_10px_rgba(240,43,213,0.3)] mb-1 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono font-medium text-slate-300 leading-tight">
              ADHD / Control
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-CARD 3: EEG CHANNELS */}
      {/* ========================================================= */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">
          EEG Channels
        </span>

        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Left: Scalp Electrode Montage */}
          <div className="col-span-5 flex items-center justify-center">
            <div className="relative w-20 h-20 rounded-full border border-slate-700/80 bg-slate-900/60 p-1 flex items-center justify-center">
              {/* Nose triangle */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-cyan-400" />
              {/* Ears */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-l-sm bg-slate-700" />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-sm bg-slate-700" />

              {/* 10-20 Scalp Electrodes SVG */}
              <svg viewBox="0 0 100 100" className="w-16 h-16">
                {/* Connecting mesh lines */}
                <path d="M 35 25 L 65 25 L 50 38 Z" stroke="#334155" strokeWidth="0.8" fill="none" />
                <path d="M 20 40 L 50 38 L 80 40 Z" stroke="#334155" strokeWidth="0.8" fill="none" />
                <path d="M 20 40 L 35 55 L 50 55 L 65 55 L 80 40 Z" stroke="#334155" strokeWidth="0.8" fill="none" />
                <path d="M 35 55 L 35 75 L 50 75 L 65 75 L 65 55 Z" stroke="#334155" strokeWidth="0.8" fill="none" />
                <path d="M 35 75 L 42 88 L 58 88 L 65 75 Z" stroke="#334155" strokeWidth="0.8" fill="none" />

                {/* Frontal (Blue/Cyan) */}
                <circle cx="35" cy="22" r="3.2" fill="#00E5FF" />
                <circle cx="65" cy="22" r="3.2" fill="#00E5FF" />
                <circle cx="20" cy="38" r="3" fill="#287BFF" />
                <circle cx="80" cy="38" r="3" fill="#287BFF" />
                <circle cx="50" cy="36" r="3.2" fill="#00E5FF" />

                {/* Central (Violet) */}
                <circle cx="32" cy="55" r="3" fill="#8B5CF6" />
                <circle cx="50" cy="55" r="3.4" fill="#8B5CF6" />
                <circle cx="68" cy="55" r="3" fill="#8B5CF6" />

                {/* Temporal (Magenta) */}
                <circle cx="16" cy="55" r="3" fill="#F02BD5" />
                <circle cx="84" cy="55" r="3" fill="#F02BD5" />

                {/* Parietal (Pink/Red) */}
                <circle cx="35" cy="74" r="3" fill="#FF65D4" />
                <circle cx="50" cy="74" r="3.2" fill="#FF65D4" />
                <circle cx="65" cy="74" r="3" fill="#FF65D4" />

                {/* Occipital (Teal/Green) */}
                <circle cx="42" cy="88" r="3.2" fill="#35F5C8" />
                <circle cx="58" cy="88" r="3.2" fill="#35F5C8" />
              </svg>
            </div>
          </div>

          {/* Right: Channel Legend */}
          <div className="col-span-7 space-y-1 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
              <span>Frontal (Fp1, Fp2, F7, F8)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
              <span>Central (C3, Cz, C4)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#F02BD5] shrink-0" />
              <span>Temporal (T3, T4, T5, T6)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#FF65D4] shrink-0" />
              <span>Parietal (P3, Pz, P4)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#35F5C8] shrink-0" />
              <span>Occipital (O1, O2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-CARD 4: PREDICTION RESULT */}
      {/* ========================================================= */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">
          Prediction Result
        </span>

        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Circular Progress Gauge */}
          <div className="col-span-5 flex items-center justify-center">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="w-18 h-18 -rotate-90">
                {/* Background Track */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="6"
                />
                {/* Control Arc */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#287BFF"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.28)}`}
                  strokeLinecap="round"
                  className="opacity-70"
                />
                {/* ADHD Arc */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#F02BD5"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.72)}`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 6px #f02bd5)' }}
                />
              </svg>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">ADHD</span>
                <span className="text-base font-bold font-heading text-white">72%</span>
              </div>
            </div>
          </div>

          {/* Probabilities Legend */}
          <div className="col-span-7 space-y-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F02BD5] shadow-[0_0_8px_#f02bd5]" />
                <span className="text-slate-300">ADHD Probability</span>
              </div>
              <span className="font-bold text-pink-400">72%</span>
            </div>

            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#287BFF] shadow-[0_0_8px_#287bff]" />
                <span className="text-slate-300">Control Probability</span>
              </div>
              <span className="font-bold text-blue-400">28%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer */}
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-300/90 flex items-start gap-1.5 leading-tight">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-amber-200">Notice:</strong> Research prototype representation. Scalp EEG classification is not a diagnostic assessment.
        </p>
      </div>
    </div>
  );
};
