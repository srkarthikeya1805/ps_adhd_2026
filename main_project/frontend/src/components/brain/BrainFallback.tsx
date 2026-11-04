import React, { useState } from 'react';
import { BrainRegionKey } from '../../types';

interface BrainFallbackProps {
  activeRegion?: BrainRegionKey | null;
  onRegionClick?: (region: BrainRegionKey) => void;
}

interface ElectrodeNode {
  name: string;
  x: number;
  y: number;
  region: BrainRegionKey;
  description: string;
  band: string;
}

const ELECTRODES_10_20: ElectrodeNode[] = [
  // Frontal (Cyan)
  { name: 'Fp1', x: 255, y: 110, region: 'frontal', description: 'Left Frontopolar: Prefrontal attentional gate', band: 'Theta / Delta' },
  { name: 'Fp2', x: 345, y: 110, region: 'frontal', description: 'Right Frontopolar: Impulse inhibition regulation', band: 'Theta / Delta' },
  { name: 'F7', x: 170, y: 165, region: 'frontal', description: 'Left Inferior Frontal: Executive working memory', band: 'Beta / Theta' },
  { name: 'F3', x: 235, y: 175, region: 'frontal', description: 'Left Mid-Frontal: Goal orientation & focus', band: 'Theta / Beta' },
  { name: 'Fz', x: 300, y: 170, region: 'frontal', description: 'Midline Frontal: TBR landmark & attention baseline', band: 'Theta / Beta (TBR)' },
  { name: 'F4', x: 365, y: 175, region: 'frontal', description: 'Right Mid-Frontal: Sustained vigilance', band: 'Theta / Beta' },
  { name: 'F8', x: 430, y: 165, region: 'frontal', description: 'Right Inferior Frontal: Behavioral inhibition', band: 'Beta / Theta' },

  // Central / Mid-Temporal (Neon Blue)
  { name: 'T3', x: 135, y: 250, region: 'temporal', description: 'Left Anterior Temporal: Auditory processing & language', band: 'Theta / Alpha' },
  { name: 'C3', x: 220, y: 250, region: 'frontal', description: 'Left Central: Sensorimotor rhythm (SMR)', band: 'Mu / Beta (12-15 Hz)' },
  { name: 'Cz', x: 300, y: 250, region: 'frontal', description: 'Vertex Electrode: Sensorimotor baseline reference', band: 'SMR / Beta' },
  { name: 'C4', x: 380, y: 250, region: 'frontal', description: 'Right Central: Sensorimotor motor coordination', band: 'Mu / Beta (12-15 Hz)' },
  { name: 'T4', x: 465, y: 250, region: 'temporal', description: 'Right Anterior Temporal: Auditory pattern gating', band: 'Theta / Alpha' },

  // Parietal & Posterior Temporal (Violet)
  { name: 'T5', x: 165, y: 335, region: 'temporal', description: 'Left Posterior Temporal: Cross-modal cognitive mapping', band: 'Alpha / Beta' },
  { name: 'P3', x: 230, y: 325, region: 'parietal', description: 'Left Parietal: Visuospatial navigation & calculation', band: 'Alpha (8-13 Hz)' },
  { name: 'Pz', x: 300, y: 325, region: 'parietal', description: 'Midline Parietal: Centroparietal P300 evoked potential', band: 'Alpha (8-13 Hz)' },
  { name: 'P4', x: 370, y: 325, region: 'parietal', description: 'Right Parietal: Spatial orienting & attention shifts', band: 'Alpha (8-13 Hz)' },
  { name: 'T6', x: 435, y: 335, region: 'temporal', description: 'Right Posterior Temporal: Emotional & spatial integration', band: 'Alpha / Beta' },

  // Occipital (Magenta)
  { name: 'O1', x: 255, y: 400, region: 'occipital', description: 'Left Occipital: Visual cortex & posterior alpha rhythm', band: 'Alpha (8-13 Hz)' },
  { name: 'O2', x: 345, y: 400, region: 'occipital', description: 'Right Occipital: Visual feature integration', band: 'Alpha (8-13 Hz)' },
];

export const BrainFallback: React.FC<BrainFallbackProps> = ({
  activeRegion,
  onRegionClick,
}) => {
  const [hoveredNode, setHoveredNode] = useState<ElectrodeNode | null>(null);
  const [showElectrodes, setShowElectrodes] = useState(true);

  const regionColors: Record<BrainRegionKey, { stroke: string; fill: string; text: string }> = {
    frontal: { stroke: '#00E5FF', fill: 'rgba(0, 229, 255, 0.25)', text: '#00E5FF' },
    parietal: { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.25)', text: '#C084FC' },
    temporal: { stroke: '#478BFF', fill: 'rgba(71, 139, 255, 0.25)', text: '#60A5FA' },
    occipital: { stroke: '#F472D0', fill: 'rgba(244, 114, 208, 0.25)', text: '#F472D0' },
  };

  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-center p-4 select-none">
      {/* Background Neural Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
        <div className="w-96 h-96 rounded-full bg-violet-600/5 blur-3xl animate-pulse delay-700" />
      </div>

      {/* Mode Controls Toggle */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowElectrodes(!showElectrodes)}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 backdrop-blur-md transition-colors"
        >
          {showElectrodes ? '10-20 Montage: Visible' : 'Montage: Hidden'}
        </button>
      </div>

      <svg
        viewBox="0 0 600 500"
        className="w-full max-w-lg h-auto drop-shadow-[0_0_35px_rgba(0,229,255,0.2)]"
      >
        <defs>
          <linearGradient id="cyanVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F472D0" stopOpacity="0.8" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Head Contour / Calvarium Outline */}
        <ellipse
          cx="300"
          cy="255"
          rx="185"
          ry="195"
          fill="none"
          stroke="#1E293B"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Nasion (Anterior Nose Landmark) */}
        <path d="M 290 60 L 300 45 L 310 60" fill="none" stroke="#334155" strokeWidth="2" />
        {/* Left & Right Preauricular Ear Landmarks */}
        <path d="M 112 245 C 105 250, 105 260, 112 265" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M 488 245 C 495 250, 495 260, 488 265" fill="none" stroke="#334155" strokeWidth="2" />

        {/* Central Cerebral Longitudinal Fissure Divider */}
        <path
          d="M 300 70 Q 295 250 300 435"
          stroke="#478BFF"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.4"
        />

        {/* Frontal Lobe Region (Anterior) */}
        <g
          className="cursor-pointer transition-all duration-300 hover:opacity-100"
          onClick={() => onRegionClick?.('frontal')}
          opacity={activeRegion === 'frontal' ? '1' : activeRegion ? '0.35' : '0.85'}
        >
          <path
            d="M 220 90 C 260 70, 340 70, 380 90 C 430 120, 440 180, 420 220 C 370 230, 230 230, 180 220 C 160 180, 170 120, 220 90 Z"
            fill={activeRegion === 'frontal' ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.10)'}
            stroke={activeRegion === 'frontal' ? '#00E5FF' : '#00E5FF66'}
            strokeWidth={activeRegion === 'frontal' ? '3' : '1.5'}
            filter={activeRegion === 'frontal' ? 'url(#glowFilter)' : undefined}
          />
          <text x="300" y="140" textAnchor="middle" fill="#00E5FF" fontSize="13" fontFamily="Space Grotesk" fontWeight="600">
            FRONTAL LOBE
          </text>
        </g>

        {/* Parietal Lobe Region (Upper Posterior) */}
        <g
          className="cursor-pointer transition-all duration-300 hover:opacity-100"
          onClick={() => onRegionClick?.('parietal')}
          opacity={activeRegion === 'parietal' ? '1' : activeRegion ? '0.35' : '0.85'}
        >
          <path
            d="M 180 220 C 230 230, 370 230, 420 220 C 440 280, 420 330, 380 350 C 340 340, 260 340, 220 350 C 180 330, 160 280, 180 220 Z"
            fill={activeRegion === 'parietal' ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.10)'}
            stroke={activeRegion === 'parietal' ? '#8B5CF6' : '#8B5CF666'}
            strokeWidth={activeRegion === 'parietal' ? '3' : '1.5'}
            filter={activeRegion === 'parietal' ? 'url(#glowFilter)' : undefined}
          />
          <text x="300" y="290" textAnchor="middle" fill="#C084FC" fontSize="13" fontFamily="Space Grotesk" fontWeight="600">
            PARIETAL LOBE
          </text>
        </g>

        {/* Temporal Region (Left & Right Flanks) */}
        <g
          className="cursor-pointer transition-all duration-300 hover:opacity-100"
          onClick={() => onRegionClick?.('temporal')}
          opacity={activeRegion === 'temporal' ? '1' : activeRegion ? '0.35' : '0.85'}
        >
          <path
            d="M 175 190 C 145 220, 135 280, 160 330 C 185 320, 195 240, 175 190 Z"
            fill={activeRegion === 'temporal' ? 'rgba(71, 139, 255, 0.35)' : 'rgba(71, 139, 255, 0.10)'}
            stroke="#478BFF"
            strokeWidth="1.5"
          />
          <path
            d="M 425 190 C 455 220, 465 280, 440 330 C 415 320, 405 240, 425 190 Z"
            fill={activeRegion === 'temporal' ? 'rgba(71, 139, 255, 0.35)' : 'rgba(71, 139, 255, 0.10)'}
            stroke="#478BFF"
            strokeWidth="1.5"
          />
          <text x="110" y="260" textAnchor="middle" fill="#60A5FA" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">
            TEMPORAL
          </text>
          <text x="490" y="260" textAnchor="middle" fill="#60A5FA" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">
            TEMPORAL
          </text>
        </g>

        {/* Occipital Region (Posterior Base) */}
        <g
          className="cursor-pointer transition-all duration-300 hover:opacity-100"
          onClick={() => onRegionClick?.('occipital')}
          opacity={activeRegion === 'occipital' ? '1' : activeRegion ? '0.35' : '0.85'}
        >
          <path
            d="M 220 350 C 260 340, 340 340, 380 350 C 370 410, 340 430, 300 435 C 260 430, 230 410, 220 350 Z"
            fill={activeRegion === 'occipital' ? 'rgba(244, 114, 208, 0.35)' : 'rgba(244, 114, 208, 0.10)'}
            stroke={activeRegion === 'occipital' ? '#F472D0' : '#F472D066'}
            strokeWidth={activeRegion === 'occipital' ? '3' : '1.5'}
            filter={activeRegion === 'occipital' ? 'url(#glowFilter)' : undefined}
          />
          <text x="300" y="380" textAnchor="middle" fill="#F472D0" fontSize="13" fontFamily="Space Grotesk" fontWeight="600">
            OCCIPITAL LOBE
          </text>
        </g>

        {/* Synaptic Pathway Filaments Connecting Electrodes */}
        {showElectrodes && (
          <g opacity="0.35" stroke="#478BFF" strokeWidth="1" strokeDasharray="3 3">
            {/* Frontal ring */}
            <line x1="255" y1="110" x2="345" y2="110" />
            <line x1="170" y1="165" x2="235" y2="175" />
            <line x1="235" y1="175" x2="300" y2="170" />
            <line x1="300" y1="170" x2="365" y2="175" />
            <line x1="365" y1="175" x2="430" y2="165" />
            {/* Central coronal line */}
            <line x1="135" y1="250" x2="220" y2="250" />
            <line x1="220" y1="250" x2="300" y2="250" />
            <line x1="300" y1="250" x2="380" y2="250" />
            <line x1="380" y1="250" x2="465" y2="250" />
            {/* Parietal ring */}
            <line x1="165" y1="335" x2="230" y2="325" />
            <line x1="230" y1="325" x2="300" y2="325" />
            <line x1="300" y1="325" x2="370" y2="325" />
            <line x1="370" y1="325" x2="435" y2="335" />
            {/* Occipital line */}
            <line x1="255" y1="400" x2="345" y2="400" />
            {/* Sagittal midline */}
            <line x1="300" y1="170" x2="300" y2="250" />
            <line x1="300" y1="250" x2="300" y2="325" />
          </g>
        )}

        {/* 19 Standard 10-20 Electrodes */}
        {showElectrodes &&
          ELECTRODES_10_20.map((el) => {
            const isRegional = activeRegion === el.region;
            const isHovered = hoveredNode?.name === el.name;
            const color = regionColors[el.region].stroke;

            return (
              <g
                key={el.name}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode(el)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onRegionClick?.(el.region)}
              >
                {/* Glow ring on active or hover */}
                {(isRegional || isHovered) && (
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={isHovered ? 13 : 10}
                    fill={color}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                {/* Electrode circular pad */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={isHovered ? 8 : 6}
                  fill={isRegional || isHovered ? color : '#0F172A'}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {/* Channel Label */}
                <text
                  x={el.x}
                  y={el.y + 3.5}
                  textAnchor="middle"
                  fill={isRegional || isHovered ? '#050816' : '#E2E8F0'}
                  fontSize={isHovered ? '9' : '8'}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {el.name}
                </text>
              </g>
            );
          })}

        {/* Synaptic Pathway Pulsing Nodes */}
        <circle cx="300" cy="110" r="4" fill="#00E5FF" className="animate-ping" />
        <circle cx="300" cy="370" r="3.5" fill="#F472D0" className="animate-ping" />
      </svg>

      {/* Hovered Electrode Telemetry Card */}
      {hoveredNode && (
        <div className="absolute bottom-2 left-4 right-4 z-30 p-2.5 rounded-xl glass-panel border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between text-xs font-mono text-slate-200">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: regionColors[hoveredNode.region].stroke }}
            />
            <strong className="text-white text-sm">{hoveredNode.name}</strong>
            <span className="text-slate-400 text-[11px]">— {hoveredNode.description}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {hoveredNode.band}
          </span>
        </div>
      )}
    </div>
  );
};

