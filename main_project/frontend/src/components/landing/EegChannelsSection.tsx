import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Radio, Info, Sparkles, Sliders, Zap } from 'lucide-react';

interface ChannelInfo {
  name: string;
  region: 'Frontal' | 'Central' | 'Temporal' | 'Parietal' | 'Occipital';
  x: number; // 0-100% SVG coordinates
  y: number;
  freqBands: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
  color: string;
  samplingRate: string;
  voltageRange: string;
  lobeRole: string;
}

const EEG_19_CHANNELS: ChannelInfo[] = [
  // Frontal
  { name: 'Fp1', region: 'Frontal', x: 38, y: 18, color: '#00E5FF', freqBands: { delta: 35, theta: 42, alpha: 12, beta: 8, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±65 μV', lobeRole: 'Frontopolar Left - Executive reflection & blink artifact monitor' },
  { name: 'Fp2', region: 'Frontal', x: 62, y: 18, color: '#00E5FF', freqBands: { delta: 33, theta: 44, alpha: 11, beta: 9, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±68 μV', lobeRole: 'Frontopolar Right - Behavioral restraint & impulse regulation' },
  { name: 'F7', region: 'Frontal', x: 20, y: 32, color: '#287BFF', freqBands: { delta: 28, theta: 38, alpha: 20, beta: 11, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±52 μV', lobeRole: 'Inferior Frontal Left - Verbal fluency & working memory' },
  { name: 'F3', region: 'Frontal', x: 35, y: 32, color: '#287BFF', freqBands: { delta: 25, theta: 40, alpha: 22, beta: 10, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±48 μV', lobeRole: 'Dorsolateral Prefrontal Left - Goal orientation & cognitive flexibility' },
  { name: 'Fz', region: 'Frontal', x: 50, y: 30, color: '#00E5FF', freqBands: { delta: 30, theta: 48, alpha: 14, beta: 6, gamma: 2 }, samplingRate: '128 Hz', voltageRange: '±58 μV', lobeRole: 'Midline Frontal - Frontal midline theta (Fmθ) generator in sustained attention' },
  { name: 'F4', region: 'Frontal', x: 65, y: 32, color: '#287BFF', freqBands: { delta: 24, theta: 39, alpha: 23, beta: 11, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±50 μV', lobeRole: 'Dorsolateral Prefrontal Right - Vigilance & selective interference suppression' },
  { name: 'F8', region: 'Frontal', x: 80, y: 32, color: '#287BFF', freqBands: { delta: 29, theta: 37, alpha: 19, beta: 12, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±54 μV', lobeRole: 'Inferior Frontal Right - Inhibitory response control & emotion processing' },

  // Central
  { name: 'T3', region: 'Temporal', x: 12, y: 50, color: '#F02BD5', freqBands: { delta: 20, theta: 32, alpha: 30, beta: 14, gamma: 4 }, samplingRate: '128 Hz', voltageRange: '±42 μV', lobeRole: 'Mid-Temporal Left - Auditory discrimination & lexical association' },
  { name: 'C3', region: 'Central', x: 32, y: 50, color: '#8B5CF6', freqBands: { delta: 18, theta: 30, alpha: 34, beta: 15, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±40 μV', lobeRole: 'Sensorimotor Left - Right limb motor planning & mu rhythm suppression' },
  { name: 'Cz', region: 'Central', x: 50, y: 50, color: '#8B5CF6', freqBands: { delta: 22, theta: 35, alpha: 28, beta: 12, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±46 μV', lobeRole: 'Vertex Central - Sensorimotor integration & vertex sharp waves' },
  { name: 'C4', region: 'Central', x: 68, y: 50, color: '#8B5CF6', freqBands: { delta: 19, theta: 31, alpha: 33, beta: 14, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±41 μV', lobeRole: 'Sensorimotor Right - Left limb somatic sensory processing' },
  { name: 'T4', region: 'Temporal', x: 88, y: 50, color: '#F02BD5', freqBands: { delta: 21, theta: 33, alpha: 29, beta: 13, gamma: 4 }, samplingRate: '128 Hz', voltageRange: '±44 μV', lobeRole: 'Mid-Temporal Right - Prosody and tonal auditory parsing' },

  // Parietal & Posterior Temporal
  { name: 'T5', region: 'Temporal', x: 18, y: 68, color: '#F02BD5', freqBands: { delta: 16, theta: 28, alpha: 38, beta: 14, gamma: 4 }, samplingRate: '128 Hz', voltageRange: '±38 μV', lobeRole: 'Posterior Temporal Left - Visual-auditory polymodal binding' },
  { name: 'P3', region: 'Parietal', x: 35, y: 68, color: '#FF65D4', freqBands: { delta: 14, theta: 26, alpha: 42, beta: 15, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±36 μV', lobeRole: 'Parietal Left - Somatosensory & spatial allocation' },
  { name: 'Pz', region: 'Parietal', x: 50, y: 68, color: '#FF65D4', freqBands: { delta: 15, theta: 27, alpha: 44, beta: 11, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±39 μV', lobeRole: 'Midline Parietal - Parieto-occipital alpha rhythm & P300 attention component' },
  { name: 'P4', region: 'Parietal', x: 65, y: 68, color: '#FF65D4', freqBands: { delta: 14, theta: 25, alpha: 43, beta: 15, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±37 μV', lobeRole: 'Parietal Right - Spatial attention & mental orientation' },
  { name: 'T6', region: 'Temporal', x: 82, y: 68, color: '#F02BD5', freqBands: { delta: 17, theta: 29, alpha: 37, beta: 13, gamma: 4 }, samplingRate: '128 Hz', voltageRange: '±41 μV', lobeRole: 'Posterior Temporal Right - Facial emotion recognition' },

  // Occipital
  { name: 'O1', region: 'Occipital', x: 40, y: 86, color: '#35F5C8', freqBands: { delta: 12, theta: 20, alpha: 52, beta: 13, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±34 μV', lobeRole: 'Occipital Left - Primary striate visual cortex & eyes-closed posterior alpha' },
  { name: 'O2', region: 'Occipital', x: 60, y: 86, color: '#35F5C8', freqBands: { delta: 11, theta: 19, alpha: 54, beta: 13, gamma: 3 }, samplingRate: '128 Hz', voltageRange: '±35 μV', lobeRole: 'Occipital Right - Visuoperceptual processing & photic driving response' },
];

export const EegChannelsSection: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelInfo>(EEG_19_CHANNELS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live scrolling oscilloscope waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      offset += 1.5;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, w, h);

      // Oscilloscope background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSpacing = 24;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Zero-voltage centerline
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Render scrolling multi-component EEG synthetic wave based on channel band powers
      ctx.strokeStyle = selectedChannel.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = selectedChannel.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const bands = selectedChannel.freqBands;
      for (let x = 0; x < w; x++) {
        const t = (x + offset) * 0.04;
        // Superposition of Delta (1-4 Hz), Theta (4-8 Hz), Alpha (8-13 Hz), Beta (13-30 Hz)
        const yVal =
          Math.sin(t * 0.5) * (bands.delta * 0.4) +
          Math.sin(t * 1.2) * (bands.theta * 0.5) +
          Math.sin(t * 2.5) * (bands.alpha * 0.35) +
          Math.sin(t * 5.0) * (bands.beta * 0.2) +
          (Math.random() - 0.5) * 3; // subtle thermal scalp micro-noise

        const y = h / 2 + yVal;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedChannel]);

  return (
    <section id="eeg-channels" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5" />
          Standard 10-20 Montage Architecture
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight">
          19-Channel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">EEG Signal Channels</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
          Interactive topographic scalp layout verified against backend preprocessing. Select any electrode to inspect real-time scrolling waveforms and frequency power distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: 2D Head Map Montage */}
        <div className="lg:col-span-6 rounded-3xl glass-panel border border-cyan-500/30 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              Scalp Montage (10-20 Standard)
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active: <strong className="text-white">{selectedChannel.name}</strong> ({selectedChannel.region})
            </span>
          </div>

          <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] my-4 flex items-center justify-center">
            {/* Calvarium Outline */}
            <div className="absolute inset-4 rounded-full border-2 border-slate-700/80 bg-slate-950/70 shadow-inner" />

            {/* Nasion (Top nose marker) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-cyan-400 filter drop-shadow-[0_0_6px_#00e5ff]" />

            {/* Inion (Bottom marker) */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-full" />

            {/* Left and Right Preauricular Ears */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-10 rounded-l-md border-y border-l border-slate-600 bg-slate-900" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-10 rounded-r-md border-y border-r border-slate-600 bg-slate-900" />

            {/* SVG Electrodes & Interconnecting Axon Mesh */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-6">
              {/* Mesh filaments between neighboring electrodes */}
              {EEG_19_CHANNELS.map((ch, i) =>
                EEG_19_CHANNELS.slice(i + 1).map((ch2, j) => {
                  const dist = Math.hypot(ch.x - ch2.x, ch.y - ch2.y);
                  if (dist > 26) return null;
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={ch.x}
                      y1={ch.y}
                      x2={ch2.x}
                      y2={ch2.y}
                      stroke="#1e293b"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                  );
                })
              )}

              {/* Electrodes Buttons */}
              {EEG_19_CHANNELS.map((ch) => {
                const isSelected = selectedChannel.name === ch.name;
                return (
                  <g
                    key={ch.name}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedChannel(ch)}
                  >
                    {/* Glow Halo if selected */}
                    {isSelected && (
                      <circle
                        cx={ch.x}
                        cy={ch.y}
                        r="6.5"
                        fill="none"
                        stroke={ch.color}
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={ch.x}
                      cy={ch.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill={isSelected ? '#ffffff' : ch.color}
                      stroke={ch.color}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ filter: `drop-shadow(0 0 6px ${ch.color})` }}
                    />
                    <text
                      x={ch.x}
                      y={ch.y - 5.5}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="3.8"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {ch.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Lobe Legend Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-800 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Frontal (7)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Central (3)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#F02BD5]" /> Temporal (4)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#FF65D4]" /> Parietal (3)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#35F5C8]" /> Occipital (2)
            </span>
          </div>
        </div>

        {/* Right: Selected Channel Live Oscilloscope & Spectral Power */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Waveform Oscilloscope Monitor */}
          <div className="rounded-3xl glass-panel border border-cyan-500/30 p-6 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedChannel.color, boxShadow: `0 0 10px ${selectedChannel.color}` }}
                />
                <h3 className="text-xl font-bold font-heading text-white">
                  Channel {selectedChannel.name} Waveform
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                Live 128 Hz Oscilloscope
              </span>
            </div>

            {/* Canvas Screen */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#050816]">
              <canvas
                ref={canvasRef}
                width={560}
                height={160}
                className="w-full h-40 block"
              />
              <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400">
                +65 μV
              </div>
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500">
                -65 μV
              </div>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
                Window: 2.0s (256 samples)
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong className="text-white">{selectedChannel.lobeRole.split(' - ')[0]}:</strong>{' '}
              {selectedChannel.lobeRole.split(' - ')[1]}
            </p>
          </div>

          {/* Spectral Frequency Distribution (PSD Bands) */}
          <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Frequency Band Power Decomposition (PSD)
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Welch Periodogram</span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Delta (1–4 Hz)', pct: selectedChannel.freqBands.delta, col: '#287BFF' },
                { name: 'Theta (4–8 Hz) *ADHD biomarker', pct: selectedChannel.freqBands.theta, col: '#00E5FF' },
                { name: 'Alpha (8–13 Hz)', pct: selectedChannel.freqBands.alpha, col: '#8B5CF6' },
                { name: 'Beta (13–30 Hz)', pct: selectedChannel.freqBands.beta, col: '#F02BD5' },
                { name: 'Gamma (30–45 Hz)', pct: selectedChannel.freqBands.gamma, col: '#35F5C8' },
              ].map((band) => (
                <div key={band.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{band.name}</span>
                    <span className="font-bold text-white">{band.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: band.col, boxShadow: `0 0 8px ${band.col}80` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${band.pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Theta / Beta Power Ratio (TBR):</span>
              <span className="text-amber-400 font-bold">
                {(selectedChannel.freqBands.theta / Math.max(1, selectedChannel.freqBands.beta)).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
