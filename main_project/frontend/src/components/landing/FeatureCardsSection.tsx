import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  Cpu,
  Layers,
  BarChart3,
  UploadCloud,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const FeatureCardsSection: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* 6 Bottom Feature Cards in a Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* ========================================================= */}
        {/* CARD 1: THE BRAIN IN ACTION */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-cyan-500/30 p-4 flex flex-col justify-between hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs">⚛</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                The Brain in Action
              </h4>
            </div>

            {/* Graphic: Glowing Rainbow-lit Brain */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-500/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 opacity-70" />
              <svg viewBox="0 0 100 100" className="w-20 h-20 filter drop-shadow-[0_0_8px_#00e5ff]">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#287BFF" strokeWidth="1.2" strokeDasharray="3,3" />
                <path
                  d="M50 20 C32 20, 22 32, 22 48 C20 56, 24 64, 32 72 C40 80, 50 82, 50 82 C50 82, 60 80, 68 72 C76 64, 80 56, 78 48 C78 32, 68 20, 50 20 Z"
                  fill="url(#card1Brain)"
                  stroke="#00E5FF"
                  strokeWidth="1.2"
                />
                <circle cx="40" cy="38" r="3" fill="#00E5FF" className="animate-pulse" />
                <circle cx="60" cy="38" r="3" fill="#F02BD5" className="animate-pulse" />
                <circle cx="50" cy="56" r="3" fill="#35F5C8" className="animate-pulse" />
                <defs>
                  <linearGradient id="card1Brain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#F02BD5" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Explore different lobes and see how they work together.
            </p>
          </div>

          <a
            href="#brain-explorer"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-cyan-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/60 transition-all"
          >
            <span>Explore Brain</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: EEG SIGNAL CHANNELS */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-cyan-500/30 p-4 flex flex-col justify-between hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs">📊</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                EEG Signal Channels
              </h4>
            </div>

            {/* Graphic: 8 Colored Scrolling Waveforms */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 flex flex-col justify-between overflow-hidden group-hover:border-cyan-500/50 transition-colors">
              {[
                { ch: 'Fp1', color: '#00E5FF' },
                { ch: 'Fp2', color: '#F02BD5' },
                { ch: 'F7', color: '#35F5C8' },
                { ch: 'F8', color: '#287BFF' },
                { ch: 'T3', color: '#8B5CF6' },
                { ch: 'O1', color: '#00E5FF' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 h-2.5">
                  <span className="text-[8px] font-mono text-slate-500 w-4 shrink-0">{item.ch}</span>
                  <svg viewBox="0 0 100 10" className="w-full h-2" preserveAspectRatio="none">
                    <path
                      d="M0,5 Q10,0 20,5 T40,5 T60,5 T80,5 T100,5"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Multi-channel EEG signals captured from the scalp.
            </p>
          </div>

          <a
            href="#eeg-channels"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-cyan-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/60 transition-all"
          >
            <span>View Signals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: THE 3 AI MODELS */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-violet-500/30 p-4 flex flex-col justify-between hover:border-violet-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-xs">🤖</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                The 3 AI Models
              </h4>
            </div>

            {/* Graphic: 3 Mini Model Badges */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 p-1.5 grid grid-cols-3 gap-1 items-center overflow-hidden group-hover:border-violet-500/50 transition-colors">
              <div className="h-full rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex flex-col items-center justify-center p-1 text-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mb-1" />
                <span className="text-[7px] font-mono text-cyan-300 font-bold leading-tight">CNN + Trans</span>
                <span className="text-[7px] font-mono text-slate-400">50% W</span>
              </div>

              <div className="h-full rounded-lg bg-violet-500/10 border border-violet-400/30 flex flex-col items-center justify-center p-1 text-center">
                <span className="w-2 h-2 rounded-full bg-violet-400 mb-1" />
                <span className="text-[7px] font-mono text-violet-300 font-bold leading-tight">EEGNet</span>
                <span className="text-[7px] font-mono text-slate-400">25% W</span>
              </div>

              <div className="h-full rounded-lg bg-pink-500/10 border border-pink-400/30 flex flex-col items-center justify-center p-1 text-center">
                <span className="w-2 h-2 rounded-full bg-pink-400 mb-1" />
                <span className="text-[7px] font-mono text-pink-300 font-bold leading-tight">PSD + XGB</span>
                <span className="text-[7px] font-mono text-slate-400">25% W</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Three powerful models working together for better accuracy.
            </p>
          </div>

          <a
            href="#models-section"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-violet-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-400/60 transition-all"
          >
            <span>View Models</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 4: FROM EEG TO PREDICTION */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-cyan-500/30 p-4 flex flex-col justify-between hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs">👥</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                From EEG to Prediction
              </h4>
            </div>

            {/* Graphic: 4 Step Nodes Connected */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 flex items-center justify-between overflow-hidden group-hover:border-cyan-500/50 transition-colors">
              {[
                { label: 'EEG', col: '#00E5FF' },
                { label: 'Preproc', col: '#287BFF' },
                { label: 'Models', col: '#8B5CF6' },
                { label: 'Result', col: '#F02BD5' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-0.5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold"
                      style={{
                        backgroundColor: `${step.col}20`,
                        border: `1px solid ${step.col}`,
                        color: step.col,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5">{step.label}</span>
                  </div>
                  {idx < 3 && <span className="text-slate-600 text-[9px] -mt-2">→</span>}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Advanced signal processing and ensemble learning.
            </p>
          </div>

          <a
            href="#prediction-workflow"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-cyan-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/60 transition-all"
          >
            <span>See Process</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 5: REAL RESULTS & INSIGHTS */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-pink-500/30 p-4 flex flex-col justify-between hover:border-pink-400 hover:shadow-[0_0_25px_rgba(240,43,213,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 text-xs">📈</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                Real Results & Insights
              </h4>
            </div>

            {/* Graphic: Glowing Area Chart */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 p-1.5 flex items-end justify-center overflow-hidden group-hover:border-pink-500/50 transition-colors">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <defs>
                  <linearGradient id="resultChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F02BD5" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#287BFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Grid */}
                <line x1="0" y1="12" x2="100" y2="12" stroke="#1e293b" strokeWidth="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" />
                <line x1="0" y1="38" x2="100" y2="38" stroke="#1e293b" strokeWidth="0.5" />
                {/* Area fill */}
                <path
                  d="M0,45 Q15,10 30,30 T60,18 T85,38 L100,20 L100,50 L0,50 Z"
                  fill="url(#resultChartGrad)"
                />
                {/* Curve line */}
                <path
                  d="M0,45 Q15,10 30,30 T60,18 T85,38 L100,20"
                  fill="none"
                  stroke="#F02BD5"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 4px #f02bd5)' }}
                />
              </svg>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Interactive graphs, probability charts and detailed analysis.
            </p>
          </div>

          <Link
            to="/dashboard/results"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-pink-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-pink-400/60 transition-all"
          >
            <span>View Results</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ========================================================= */}
        {/* CARD 6: UPLOAD YOUR EEG */}
        {/* ========================================================= */}
        <div className="rounded-2xl glass-panel border border-cyan-500/30 p-4 flex flex-col justify-between hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all group">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs">⬆</span>
              <h4 className="text-xs font-bold font-heading text-white tracking-wide">
                Upload Your EEG
              </h4>
            </div>

            {/* Graphic: Cloud Upload with Dotted Border */}
            <div className="h-24 rounded-xl bg-slate-950/80 border border-dashed border-cyan-500/40 p-2 flex flex-col items-center justify-center text-center overflow-hidden group-hover:border-cyan-400 transition-colors">
              <UploadCloud className="w-6 h-6 text-cyan-400 animate-bounce mb-1" />
              <span className="text-[9px] font-mono text-slate-300 font-semibold leading-tight">
                Drag & drop EEG file
              </span>
              <span className="text-[7px] font-mono text-slate-500 mt-0.5">
                MAT, CSV, EDF, BDF, ZIP
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Analyze raw EEG files or ZIP batches with live ML models.
            </p>
          </div>

          <Link
            to="/dashboard/upload"
            className="mt-3 inline-flex items-center justify-between text-xs font-mono font-medium text-cyan-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/60 transition-all"
          >
            <span>Upload File</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bottom Center Sci-Fi Strip */}
      <div className="pt-4 pb-2 border-t border-slate-800/80 flex items-center justify-center">
        <span className="text-xs md:text-sm font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 uppercase font-semibold">
          SAME BRAIN &nbsp;/&nbsp; DIFFERENT SIGNALS &nbsp;/&nbsp; BETTER INSIGHTS
        </span>
      </div>
    </section>
  );
};
