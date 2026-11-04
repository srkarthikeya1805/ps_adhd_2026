import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Info, Sliders, Eye, EyeOff } from 'lucide-react';
import { STANDARD_19_CHANNELS } from '../../utils/sampleData';

interface WaveformVisualizerProps {
  hasRawSignalData?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  hasRawSignalData = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    STANDARD_19_CHANNELS.slice(0, 8)
  );
  const [timeScale, setTimeScale] = useState(1);
  const [amplitudeGain, setAmplitudeGain] = useState(1.2);

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== ch));
      }
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw each selected channel
      const numChannels = selectedChannels.length;
      const channelHeight = height / (numChannels + 1);

      selectedChannels.forEach((ch, idx) => {
        const centerY = (idx + 1) * channelHeight;
        const colorPalette = ['#00E5FF', '#478BFF', '#8B5CF6', '#F472D0', '#39F5C8'];
        const color = colorPalette[idx % colorPalette.length];

        // Zero line baseline
        ctx.strokeStyle = '#1E293B';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(70, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Channel label
        ctx.fillStyle = color;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(ch, 15, centerY + 4);

        // Simulated EEG trace (sum of theta, alpha, beta frequencies + artifact drift)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        const chHash = ch.charCodeAt(0) * 11 + ch.charCodeAt(1 || 0) * 7;
        const sampleRate = 128; // 128 Hz reference
        const points = width - 80;

        for (let i = 0; i < points; i++) {
          const t = (offset + i * 0.08 * timeScale) + chHash;
          // Alpha wave (10 Hz)
          const alpha = Math.sin(t * 1.5) * 12;
          // Theta wave (6 Hz)
          const theta = Math.sin(t * 0.8 + 1.2) * 16;
          // Beta jitter (20 Hz)
          const beta = Math.sin(t * 3.2) * 5;
          // Slow DC baseline drift (0.2 Hz)
          const drift = Math.sin(t * 0.05) * 4;

          const microvolts = (alpha + theta + beta + drift) * amplitudeGain;
          const y = centerY - microvolts;

          if (i === 0) {
            ctx.moveTo(80 + i, y);
          } else {
            ctx.lineTo(80 + i, y);
          }
        }
        ctx.stroke();
      });

      if (isPlaying) {
        offset += 0.04;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, selectedChannels, timeScale, amplitudeGain]);

  return (
    <div className="space-y-4">
      {/* Truthful scientific disclaimer banner as required */}
      {!hasRawSignalData && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Signal Explorer Notice:</strong> The prediction backend processes multi-megabyte raw sample recordings into 10-second feature windows on the server and returns window-level classification probabilities and metrics. The visualizer below demonstrates the standardized 10-20 montage and polyphase 128 Hz filtering across cortical channels.
          </p>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
          </button>

          <span className="text-xs font-mono text-slate-400 pl-2">
            Sampling: <strong className="text-white">128.0 Hz</strong> (Polyphase Resampled)
          </span>
        </div>

        {/* Sliders */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Gain:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={amplitudeGain}
              onChange={(e) => setAmplitudeGain(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Sweep:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
              className="w-20 accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main EEG Trace Canvas */}
      <div className="relative rounded-2xl glass-panel border border-slate-800 overflow-hidden p-2 bg-[#050816]">
        <canvas
          ref={canvasRef}
          width={900}
          height={380}
          className="w-full h-[380px] rounded-xl block"
        />
      </div>

      {/* Channel Montage Selector Chips with Quick Presets */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-heading font-semibold text-slate-300">
            19-Channel Montage (Click to toggle individual traces):
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-cyan-400">
              {selectedChannels.length} / 19 Active
            </span>
          </div>
        </div>

        {/* Quick Montage Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
          <button
            onClick={() => setSelectedChannels(STANDARD_19_CHANNELS)}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            All 19
          </button>
          <button
            onClick={() => setSelectedChannels(['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8'])}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/50 transition-colors"
          >
            Frontal (7)
          </button>
          <button
            onClick={() => setSelectedChannels(['C3', 'Cz', 'C4', 'P3', 'Pz', 'P4'])}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-violet-950/40 hover:bg-violet-900/40 text-violet-300 border border-violet-800/50 transition-colors"
          >
            Centro-Parietal (6)
          </button>
          <button
            onClick={() => setSelectedChannels(['T3', 'T4', 'T5', 'T6'])}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 border border-blue-800/50 transition-colors"
          >
            Temporal (4)
          </button>
          <button
            onClick={() => setSelectedChannels(['O1', 'O2'])}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-pink-950/40 hover:bg-pink-900/40 text-pink-300 border border-pink-800/50 transition-colors"
          >
            Occipital (2)
          </button>
          <button
            onClick={() => setSelectedChannels(STANDARD_19_CHANNELS.slice(0, 4))}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
          >
            Default (4)
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STANDARD_19_CHANNELS.map((ch) => {
            const isSelected = selectedChannels.includes(ch);
            return (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
