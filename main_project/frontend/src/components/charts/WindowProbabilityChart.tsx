import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { WindowPrediction } from '../../types';

interface WindowProbabilityChartProps {
  windows: WindowPrediction[];
  threshold?: number;
  selectedWindow?: number | null;
  onSelectWindow?: (windowNum: number) => void;
}

export const WindowProbabilityChart: React.FC<WindowProbabilityChartProps> = ({
  windows,
  threshold = 0.5,
  selectedWindow,
  onSelectWindow,
}) => {
  if (!windows || windows.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
        No window-level prediction records available for this recording.
      </div>
    );
  }

  const chartData = windows.map((w) => ({
    window: w.window,
    start: w.start_seconds,
    end: w.end_seconds,
    timeLabel: `${w.start_seconds}s`,
    probability: Number((w.adhd_probability * 100).toFixed(2)),
    prediction: w.prediction,
    rawProb: w.adhd_probability,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isADHD = data.prediction === 'ADHD';
      return (
        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400 font-semibold">Window #{data.window}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isADHD ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {data.prediction}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Interval:</span>
            <span className="text-slate-200">
              {data.start}s – {data.end}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ADHD Prob:</span>
            <span className="text-cyan-400 font-bold">{data.probability}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            <span>Threshold:</span>
            <span>{(threshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload.length) {
              const winNum = e.activePayload[0].payload.window;
              onSelectWindow?.(winNum);
            }
          }}
        >
          <defs>
            <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />

          <XAxis
            dataKey="timeLabel"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            tick={{ fill: '#64748B' }}
          />

          <YAxis
            domain={[0, 100]}
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            tick={{ fill: '#64748B' }}
            unit="%"
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Decision Threshold Reference Line */}
          <ReferenceLine
            y={threshold * 100}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            label={{
              value: `Threshold (${(threshold * 100).toFixed(0)}%)`,
              fill: '#F59E0B',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />

          <Area
            type="monotone"
            dataKey="probability"
            stroke="#00E5FF"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#probGradient)"
            dot={(props: any) => {
              const isSelected = selectedWindow === props.payload.window;
              const isADHD = props.payload.prediction === 'ADHD';
              return (
                <circle
                  key={props.payload.window}
                  cx={props.cx}
                  cy={props.cy}
                  r={isSelected ? 6 : 3.5}
                  fill={isADHD ? '#F59E0B' : '#00E5FF'}
                  stroke={isSelected ? '#FFFFFF' : '#050816'}
                  strokeWidth={2}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 6px #00E5FF)' : undefined,
                    cursor: 'pointer',
                  }}
                />
              );
            }}
            activeDot={{ r: 7, fill: '#00E5FF', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
