import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatProbabilityDecimals } from '../../utils/formatters';

interface ModelProbabilityBarChartProps {
  modelProbabilities?: Record<string, number> | null;
  ensembleWeights?: Record<string, number> | null;
}

export const ModelProbabilityBarChart: React.FC<ModelProbabilityBarChartProps> = ({
  modelProbabilities,
  ensembleWeights,
}) => {
  // Default configured weights
  const weights = ensembleWeights || {
    cnn_transformer: 0.5,
    eegnet: 0.25,
    xgboost: 0.25,
  };

  const data = [
    {
      key: 'cnn_transformer',
      name: 'CNN + Transformer',
      shortName: 'CNN-Transf.',
      weight: `${((weights.cnn_transformer ?? 0.5) * 100).toFixed(0)}%`,
      prob: modelProbabilities?.cnn_transformer !== undefined
        ? Number((modelProbabilities.cnn_transformer * 100).toFixed(2))
        : null,
      color: '#00E5FF', // Cyan
    },
    {
      key: 'eegnet',
      name: 'EEGNet',
      shortName: 'EEGNet',
      weight: `${((weights.eegnet ?? 0.25) * 100).toFixed(0)}%`,
      prob: modelProbabilities?.eegnet !== undefined
        ? Number((modelProbabilities.eegnet * 100).toFixed(2))
        : null,
      color: '#8B5CF6', // Violet
    },
    {
      key: 'xgboost',
      name: 'PSD + XGBoost',
      shortName: 'PSD-XGB',
      weight: `${((weights.xgboost ?? 0.25) * 100).toFixed(0)}%`,
      prob: modelProbabilities?.xgboost !== undefined
        ? Number((modelProbabilities.xgboost * 100).toFixed(2))
        : null,
      color: '#F472D0', // Magenta
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
          <div className="font-bold text-white border-b border-slate-800 pb-1">{item.name}</div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Ensemble Weight:</span>
            <span className="text-cyan-400 font-semibold">{item.weight}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Model ADHD Prob:</span>
            <span className="text-white font-bold">
              {item.prob !== null ? `${item.prob}%` : 'Pending evaluation'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            *Model probability output, distinct from training accuracy.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-3">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="shortName" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="prob" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
        {data.map((m) => (
          <div key={m.key} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="block text-[10px] text-slate-400 truncate">{m.name}</span>
            <span className="block text-sm font-bold text-white mt-0.5">
              {m.prob !== null ? `${m.prob}%` : '—'}
            </span>
            <span className="block text-[10px] text-cyan-400/80">Wt: {m.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
