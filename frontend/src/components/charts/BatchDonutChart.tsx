import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface BatchDonutChartProps {
  adhdCount: number;
  controlCount: number;
  failedCount?: number;
}

export const BatchDonutChart: React.FC<BatchDonutChartProps> = ({
  adhdCount,
  controlCount,
  failedCount = 0,
}) => {
  const total = adhdCount + controlCount + failedCount;

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 font-mono text-xs">
        No recordings in batch
      </div>
    );
  }

  const data = [
    { name: 'ADHD Class', value: adhdCount, color: '#F59E0B' },
    { name: 'Control Class', value: controlCount, color: '#10B981' },
    ...(failedCount > 0 ? [{ name: 'Failed / Unparsable', value: failedCount, color: '#EF4444' }] : []),
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const pct = ((d.value / total) * 100).toFixed(1);
      return (
        <div className="p-2.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md text-xs font-mono">
          <span className="font-bold text-white block">{d.name}</span>
          <span className="text-slate-300">
            {d.value} files ({pct}%)
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#050816" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-slate-300">
              {d.name}: <strong className="text-white">{d.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
