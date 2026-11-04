import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Sliders, Activity, Sparkles, Box, Grid } from 'lucide-react';

export interface AnimatedFrequencyExplorerProps {
  className?: string;
  isADHD?: boolean;
}

export type FrequencyBandKey = 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma';

export interface BandConfig {
  key: FrequencyBandKey;
  name: string;
  hzRange: string;
  color: string;      // Visual colors exactly specified by user:
                      // Delta: Purple, Theta: Electric Blue, Alpha: Cyan, Beta: Neon Pink, Gamma: Golden Yellow
  hexColor: number;
  baseFreq: number;
  baseAmp: number;
  description: string;
  clinicalSignificance: string;
}

export const BANDS: BandConfig[] = [
  {
    key: 'Delta',
    name: 'Delta Band',
    hzRange: '1.0 – 4.0 Hz',
    color: '#8B5CF6', // Purple
    hexColor: 0x8b5cf6,
    baseFreq: 2.5,
    baseAmp: 34,
    description: 'Slow high-amplitude polymorphic oscillations typically dominant in deep slow-wave sleep and subcortical synchronization.',
    clinicalSignificance: 'Frontal delta elevations during waking states can reflect generalized cortical slowing and hypoarousal.',
  },
  {
    key: 'Theta',
    name: 'Theta Band',
    hzRange: '4.0 – 8.0 Hz',
    color: '#00E5FF', // Electric Blue
    hexColor: 0x00e5ff,
    baseFreq: 5.5,
    baseAmp: 42,
    description: 'Rhythmic oscillations originating from medial prefrontal, anterior cingulate, and hippocampal circuits.',
    clinicalSignificance: 'Excess frontal theta during cognitive performance is one of the most consistently documented electrophysiological hallmarks of ADHD.',
  },
  {
    key: 'Alpha',
    name: 'Alpha Band',
    hzRange: '8.0 – 13.0 Hz',
    color: '#38BDF8', // Cyan
    hexColor: 0x38bdf8,
    baseFreq: 10.0,
    baseAmp: 28,
    description: 'Dominant occipital-parietal idling rhythm reflecting active inhibitory sensory gating.',
    clinicalSignificance: 'Suppression failure during visual continuous performance tasks signals attentional orienting and vigilance lapses.',
  },
  {
    key: 'Beta',
    name: 'Beta Band',
    hzRange: '13.0 – 30.0 Hz',
    color: '#F43F5E', // Neon Pink
    hexColor: 0xf43f5e,
    baseFreq: 20.0,
    baseAmp: 18,
    description: 'Fast low-amplitude cortical desynchronization associated with active mental focus and executive engagement.',
    clinicalSignificance: 'Reduced frontal beta power during attention tasks contributes to elevated Theta/Beta ratios (TBR) in ADHD.',
  },
  {
    key: 'Gamma',
    name: 'Gamma Band',
    hzRange: '30.0 – 45.0 Hz',
    color: '#FACC15', // Golden Yellow
    hexColor: 0xfacc15,
    baseFreq: 38.0,
    baseAmp: 10,
    description: 'High-frequency cortical network synchrony involved in sensory binding and rapid cognitive processing.',
    clinicalSignificance: 'Modulations reflect localized neural circuit binding and inter-areal communication precision.',
  },
];

export const AnimatedFrequencyExplorer: React.FC<AnimatedFrequencyExplorerProps> = ({
  className = '',
  isADHD = true,
}) => {
  const [selectedBandKey, setSelectedBandKey] = useState<FrequencyBandKey>('Theta');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const container3DRef = useRef<HTMLDivElement>(null);

  const selectedBand = BANDS.find((b) => b.key === selectedBandKey) || BANDS[1];

  // ---------------------------------------------------------------------------
  // 2D CANVAS WAVEFORM ANIMATOR
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render2D = () => {
      if (isPlaying) {
        t += 0.03 * playbackSpeed;
      }
      const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const h = (canvas.height = 240);

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Zero line
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Multi-layer waveform glow
      const freqMultiplier = selectedBand.baseFreq * 0.015;
      const amp = selectedBand.baseAmp * (isADHD && selectedBand.key === 'Theta' ? 1.4 : 1.0);

      // Glow pass
      ctx.strokeStyle = selectedBand.color;
      ctx.shadowColor = selectedBand.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * freqMultiplier + t * 5.0) * amp +
          Math.sin(x * freqMultiplier * 2.1 + t * 10.0) * (amp * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bright core trace
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * freqMultiplier + t * 5.0) * amp +
          Math.sin(x * freqMultiplier * 2.1 + t * 10.0) * (amp * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render2D);
    };

    render2D();
    return () => cancelAnimationFrame(animId);
  }, [viewMode, selectedBandKey, isPlaying, playbackSpeed, isADHD]);

  // ---------------------------------------------------------------------------
  // 3D THREE.JS RIBBON WAVEFORM ANIMATOR
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = container3DRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // Multi-ribbon wave grid
    const ribbonCount = 5;
    const pointsPerRibbon = 80;
    const ribbons: Array<{ line: THREE.Line; baseZ: number; phase: number }> = [];

    for (let r = 0; r < ribbonCount; r++) {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(pointsPerRibbon * 3);
      const baseZ = (r - (ribbonCount - 1) / 2) * 0.45;

      for (let p = 0; p < pointsPerRibbon; p++) {
        positions[p * 3] = -2.5 + (p / (pointsPerRibbon - 1)) * 5.0;
        positions[p * 3 + 1] = 0;
        positions[p * 3 + 2] = baseZ;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const opacity = r === 2 ? 0.95 : 0.45 - Math.abs(r - 2) * 0.15;
      const mat = new THREE.LineBasicMaterial({
        color: selectedBand.hexColor,
        transparent: true,
        opacity: opacity,
        linewidth: 2,
      });

      const line = new THREE.Line(geo, mat);
      scene.add(line);
      ribbons.push({ line, baseZ, phase: r * 0.35 });
    }

    // Grid Floor
    const grid = new THREE.GridHelper(5, 20, selectedBand.hexColor, 0x1e293b);
    grid.position.y = -0.8;
    scene.add(grid);

    let animId: number;
    let clock = new THREE.Clock();

    const animate3D = () => {
      animId = requestAnimationFrame(animate3D);
      const elapsed = clock.getElapsedTime() * playbackSpeed;

      const freqMultiplier = selectedBand.baseFreq * 0.15;
      const amp = (selectedBand.baseAmp * 0.015) * (isADHD && selectedBand.key === 'Theta' ? 1.4 : 1.0);

      ribbons.forEach((rib, rIdx) => {
        const posAttr = rib.line.geometry.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        for (let p = 0; p < pointsPerRibbon; p++) {
          const x = posArr[p * 3];
          const y = Math.sin(x * freqMultiplier + elapsed * 3.5 + rib.phase) * amp +
                    Math.cos(x * freqMultiplier * 1.8 - elapsed * 2.0) * (amp * 0.25);
          posArr[p * 3 + 1] = y;
        }
        posAttr.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate3D();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 240;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      try {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      } catch (e) {
        console.warn('Three.js dispose note:', e);
      }
    };
  }, [viewMode, selectedBandKey, isPlaying, playbackSpeed, isADHD]);

  return (
    <div className={`p-6 rounded-3xl glass-panel border border-cyan-500/30 space-y-6 shadow-2xl ${className}`}>
      {/* Top Header & 2D/3D Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Interactive Frequency Explorer</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-white mt-1">
            Electrophysiological Frequency Bands (2D & 3D Waveforms)
          </h3>
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs font-mono">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === '2d'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>2D Waveform</span>
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === '3d'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Ribbon Surface</span>
          </button>
        </div>
      </div>

      {/* 5 Clinical Frequency Band Tabs (Strict Colors) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {BANDS.map((b) => (
          <button
            key={b.key}
            onClick={() => setSelectedBandKey(b.key)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedBandKey === b.key
                ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-[1.02]'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-white">{b.name}</span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
            </div>
            <span className="text-[11px] font-mono block mt-1" style={{ color: b.color }}>
              {b.hzRange}
            </span>
          </button>
        ))}
      </div>

      {/* Waveform Visualization Canvas Area */}
      <div className="relative w-full h-[240px] rounded-2xl bg-slate-950/85 border border-slate-800 p-2 overflow-hidden shadow-inner flex items-center justify-center">
        {viewMode === '2d' ? (
          <canvas ref={canvas2DRef} className="w-full h-full block" />
        ) : (
          <div ref={container3DRef} className="w-full h-full block cursor-grab" />
        )}

        {/* Top-Right Active Band HUD Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono text-white flex items-center gap-2 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedBand.color }} />
          <span className="font-bold">{selectedBand.name}</span>
          <span className="text-slate-400">({selectedBand.hzRange})</span>
        </div>
      </div>

      {/* Playback Controls & Speed Multipliers */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <span className="text-xs font-mono text-slate-300">
            {isPlaying ? 'Oscillation Running' : 'Oscillation Paused'}
          </span>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Speed:</span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-3 py-1 rounded-lg border transition-all ${
                playbackSpeed === spd
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Neuroscience Context */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedBand.color }} />
          <h4 className="font-bold text-white">
            {selectedBand.name} ({selectedBand.hzRange}) Diagnostic Relevance
          </h4>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">{selectedBand.description}</p>
        <p className="text-[11px] text-cyan-300 pt-1 border-t border-slate-800/80">
          <strong className="text-white">Clinical Note:</strong> {selectedBand.clinicalSignificance}
        </p>
      </div>
    </div>
  );
};
