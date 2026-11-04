import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { WindowPrediction } from '../../types';

interface NeuralTimelineProps {
  windows: WindowPrediction[];
  selectedWindow?: number | null;
  onSelectWindow?: (windowNum: number) => void;
  adhdWindowPercentage?: number | null;
  threshold?: number;
}

export const NeuralTimeline: React.FC<NeuralTimelineProps> = ({
  windows,
  selectedWindow,
  onSelectWindow,
  adhdWindowPercentage,
  threshold = 0.5,
}) => {
  const [hoveredWindow, setHoveredWindow] = useState<WindowPrediction | null>(null);

  if (!windows || windows.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center text-slate-500 font-mono text-xs">
        No window segmentation available.
      </div>
    );
  }

  // Derive counts from returned window-level records
  const total = windows.length;
  const adhdCount = windows.filter((w) => w.prediction === 'ADHD').length;
  const controlCount = total - adhdCount;
  const derivedAdhdPercent = (adhdCount / total) * 100;
  const displayAdhdPercent = adhdWindowPercentage ?? derivedAdhdPercent;

  // Currently active preview window (hovered or selected or first)
  const activeDetail =
    hoveredWindow ||
    (selectedWindow ? windows.find((w) => w.window === selectedWindow) : null) ||
    windows[0];

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
      {/* Header and Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
            <h3 className="text-lg font-bold text-white font-heading">
              Neural Activity Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            10-second segmented windows across recording duration (50% temporal stride)
          </p>
        </div>

        {/* Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Total:</span>
            <strong className="text-white">{total}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ADHD Windows:</span>
            <strong className="font-bold">{adhdCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Control Windows:</span>
            <strong className="font-bold">{controlCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            <span>Window Ratio:</span>
            <strong className="font-bold">{displayAdhdPercent.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Timeline Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>0.00s</span>
          <span className="text-cyan-400/80">Click or hover any window segment</span>
          <span>{windows[windows.length - 1].end_seconds}s</span>
        </div>

        {/* Timeline Segments Bar */}
        <div className="relative w-full h-11 bg-slate-950/80 rounded-xl p-1 border border-slate-800 flex gap-1 overflow-x-auto select-none">
          {windows.map((w) => {
            const isSelected = selectedWindow === w.window;
            const isHovered = hoveredWindow?.window === w.window;
            const isADHD = w.prediction === 'ADHD';

            // Compute background shade based on probability
            const bgClass = isADHD
              ? isSelected || isHovered
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                : 'bg-amber-500/70 hover:bg-amber-400'
              : isSelected || isHovered
              ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
              : 'bg-emerald-500/60 hover:bg-emerald-400';

            return (
              <motion.button
                key={w.window}
                onClick={() => onSelectWindow?.(w.window)}
                onMouseEnter={() => setHoveredWindow(w)}
                onMouseLeave={() => setHoveredWindow(null)}
                whileHover={{ scaleY: 1.15 }}
                className={`flex-1 min-w-[20px] h-full rounded-lg transition-all flex items-center justify-center font-mono text-[10px] font-bold cursor-pointer ${bgClass}`}
                title={`Window #${w.window}: ${w.start_seconds}s – ${w.end_seconds}s | ${w.prediction} (${(w.adhd_probability * 100).toFixed(1)}%)`}
              >
                {total <= 24 ? w.window : ''}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Window Detail Preview Card */}
      {activeDetail && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
              #{activeDetail.window}
            </span>
            <div>
              <span className="text-slate-400 block text-[10px]">TIME WINDOW</span>
              <span className="text-white font-semibold text-sm">
                {activeDetail.start_seconds}s – {activeDetail.end_seconds}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400 block text-[10px]">WINDOW PROBABILITY</span>
              <span className="text-cyan-400 font-bold text-sm">
                {(activeDetail.adhd_probability * 100).toFixed(2)}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">PREDICTED CLASS</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  activeDetail.prediction === 'ADHD'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {activeDetail.prediction}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scientific Note */}
      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
        *Window-level classifications represent local temporal segments. The overall recording prediction aggregates window probabilities through the configured three-model weighted ensemble. A higher proportion of ADHD-classified windows reflects signal temporal consistency and does not directly gauge clinical symptom severity.
      </div>
    </div>
  );
};
