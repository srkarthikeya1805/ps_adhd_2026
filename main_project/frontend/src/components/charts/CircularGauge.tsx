import React from 'react';
import { motion } from 'framer-motion';
import { formatProbabilityDecimals } from '../../utils/formatters';

interface CircularGaugeProps {
  probability: number; // 0.0 to 1.0 (or 0 to 100)
  threshold?: number;
  prediction?: string;
  size?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  probability,
  threshold = 0.5,
  prediction,
  size = 220,
}) => {
  // Normalize probability to 0..1
  const normProb = probability > 1.0 ? probability / 100 : probability;
  const clamped = Math.max(0, Math.min(1, normProb));
  const percent = clamped * 100;

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - clamped * circumference;

  const isADHD = prediction
    ? prediction.toLowerCase().includes('adhd')
    : clamped >= threshold;

  const gaugeColor = isADHD ? '#F59E0B' : '#10B981'; // Amber vs Emerald
  const glowShadow = isADHD
    ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.4))'
    : 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Threshold indicator tick mark */}
        {threshold && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#64748B"
            strokeWidth={strokeWidth + 2}
            fill="none"
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={circumference - threshold * circumference}
            opacity={0.6}
          />
        )}

        {/* Animated Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{ filter: glowShadow }}
        />
      </svg>

      {/* Central Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">
          {formatProbabilityDecimals(clamped, 1)}
        </span>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
          ADHD Probability
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 ${
            isADHD
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isADHD ? 'ADHD Class' : 'Control Class'}
        </span>
      </div>
    </div>
  );
};
