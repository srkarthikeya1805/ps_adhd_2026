import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Activity, Sparkles, Sliders } from 'lucide-react';
import { FrequencyBandKey, BANDS } from './AnimatedFrequencyExplorer';

export interface BrainActivityHeatmap3DProps {
  className?: string;
  isADHD?: boolean;
}

export const BrainActivityHeatmap3D: React.FC<BrainActivityHeatmap3DProps> = ({
  className = '',
  isADHD = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBand, setSelectedBand] = useState<FrequencyBandKey>('Theta');

  // Regional power intensity for the active band
  // In ADHD: Theta is heavily fronto-central elevated; Beta is frontally reduced; Alpha is posterior dominant.
  const getLobePowerValues = (band: FrequencyBandKey) => {
    switch (band) {
      case 'Theta':
        return {
          frontal: isADHD ? 44.5 : 21.0,
          central: isADHD ? 38.2 : 18.5,
          parietal: isADHD ? 26.0 : 19.0,
          temporal: isADHD ? 24.5 : 17.5,
          occipital: isADHD ? 18.0 : 15.0,
        };
      case 'Beta':
        return {
          frontal: isADHD ? 12.5 : 24.0,
          central: isADHD ? 15.0 : 22.0,
          parietal: isADHD ? 18.0 : 20.5,
          temporal: isADHD ? 16.5 : 19.0,
          occipital: isADHD ? 14.0 : 16.5,
        };
      case 'Alpha':
        return {
          frontal: 14.0,
          central: 18.5,
          parietal: isADHD ? 22.0 : 32.0,
          temporal: 16.0,
          occipital: isADHD ? 28.0 : 42.0,
        };
      case 'Delta':
        return {
          frontal: isADHD ? 22.0 : 16.0,
          central: 18.0,
          parietal: 15.0,
          temporal: 16.5,
          occipital: 14.0,
        };
      case 'Gamma':
        return {
          frontal: isADHD ? 6.5 : 7.2,
          central: 7.0,
          parietal: 6.8,
          temporal: 6.0,
          occipital: 5.5,
        };
    }
  };

  const powers = getLobePowerValues(selectedBand);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.2);
    scene.add(ambientLight);

    const pointLightA = new THREE.PointLight(0x00f0ff, 4.0, 14);
    pointLightA.position.set(-3, 3, 3);
    scene.add(pointLightA);

    const pointLightB = new THREE.PointLight(0xf02bd5, 3.5, 14);
    pointLightB.position.set(3, -2, 3);
    scene.add(pointLightB);

    // 3D Head Scalp Heatmap Shell
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Multi-segment brain cortical lobes with dynamic vertex coloring
    const geo = new THREE.SphereGeometry(1.4, 48, 36);
    geo.scale(0.88, 1.15, 1.25);

    // Vertex color heat gradient calculation based on selected band lobe powers
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const pos = geo.attributes.position;

    // Normalizing colors
    const maxP = Math.max(...Object.values(powers));
    const minP = Math.min(...Object.values(powers));

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Determine regional weight
      let pVal = powers.central;
      if (z > 0.4 && y > 0) {
        pVal = powers.frontal; // Frontal / Prefrontal
      } else if (z < -0.4 && y > 0) {
        pVal = powers.occipital; // Occipital
      } else if (Math.abs(x) > 0.7 && y < 0.2) {
        pVal = powers.temporal; // Temporal
      } else if (y > 0.6 && z <= 0.4 && z >= -0.4) {
        pVal = powers.parietal; // Parietal
      }

      // Heat gradient interpolation: 0.0 -> Cool Blue/Cyan, 0.5 -> Purple/Pink, 1.0 -> Amber/Hot White
      const norm = Math.max(0, Math.min(1, (pVal - minP) / (maxP - minP || 1)));

      let r = 0, g = 0, b = 0;
      if (norm < 0.35) {
        // Deep blue to cyan
        const t = norm / 0.35;
        r = 0.05 * (1 - t) + 0.0 * t;
        g = 0.3 * (1 - t) + 0.9 * t;
        b = 0.8 * (1 - t) + 1.0 * t;
      } else if (norm < 0.7) {
        // Cyan to magenta/purple
        const t = (norm - 0.35) / 0.35;
        r = 0.0 * (1 - t) + 0.95 * t;
        g = 0.9 * (1 - t) + 0.15 * t;
        b = 1.0 * (1 - t) + 0.85 * t;
      } else {
        // Magenta to hot golden yellow/white
        const t = (norm - 0.7) / 0.3;
        r = 0.95 * (1 - t) + 1.0 * t;
        g = 0.15 * (1 - t) + 0.85 * t;
        b = 0.85 * (1 - t) + 0.2 * t;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const heatmapMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.1,
      transmission: 0.3,
      thickness: 1.0,
      transparent: true,
      opacity: 0.88,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    masterGroup.add(new THREE.Mesh(geo, heatmapMat));
    masterGroup.add(new THREE.Mesh(geo, wireMat));

    // Continuous 360 rotation
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      masterGroup.rotation.y = elapsed * 0.35;
      masterGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.08;
      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 500;
      height = container.clientHeight || 340;
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
  }, [selectedBand, isADHD]);

  return (
    <div className={`p-6 rounded-3xl glass-panel border border-cyan-500/30 space-y-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>3D Cortical Power Topography</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-white mt-1">
            Brain Activity Heatmap (Rotating 3D Power Map)
          </h3>
        </div>

        {/* Band Selector */}
        <div className="flex flex-wrap items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs font-mono">
          {(['Theta', 'Beta', 'Alpha', 'Delta', 'Gamma'] as FrequencyBandKey[]).map((band) => (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedBand === band
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {band}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas & Regional Power Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: 3D Rotating Heatmap Brain */}
        <div className="lg:col-span-7 relative h-[320px] rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
          <div ref={containerRef} className="w-full h-full block cursor-grab" />

          {/* Color Scale Heat Gradient Legend */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl text-[10px] font-mono text-slate-400">
            <span>Low Power (Cool Blue)</span>
            <div className="w-32 sm:w-48 h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-amber-400" />
            <span className="text-amber-300 font-bold">High Density (Hot Amber)</span>
          </div>
        </div>

        {/* Right: Regional Lobe Spectral Metrics */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {selectedBand} Band Regional Power (μV²/Hz)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">
              360° Rotating
            </span>
          </div>

          {[
            { lobe: 'Frontal Cortex (Fp1, Fp2, Fz, F3, F4)', val: powers.frontal, color: '#00f0ff' },
            { lobe: 'Central Midline (C3, Cz, C4)', val: powers.central, color: '#38bdf8' },
            { lobe: 'Parietal Attention Gate (P3, Pz, P4)', val: powers.parietal, color: '#8b5cf6' },
            { lobe: 'Temporal Auditory/Memory (T3-T6)', val: powers.temporal, color: '#f02bd5' },
            { lobe: 'Occipital Visual Alpha (O1, O2)', val: powers.occipital, color: '#facc15' },
          ].map((item) => (
            <div key={item.lobe} className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 truncate max-w-[200px]">{item.lobe}</span>
                <span className="text-white font-bold">{item.val} μV²/Hz</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, item.val * 2)}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800">
            <span>Clinical Biomarker Significance: </span>
            <span className="text-cyan-300">
              {selectedBand === 'Theta'
                ? 'Elevated frontal theta signifies cortical hypoarousal common in ADHD.'
                : selectedBand === 'Beta'
                ? 'Reduced beta activity denotes decreased executive mental focus.'
                : 'Balanced regional power mapping across the 10-20 montage.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
