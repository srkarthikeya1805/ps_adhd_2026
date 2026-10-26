import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  HeartPulse,
  Moon,
  Sparkles,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Zap,
  Clock,
  Flame,
  Smile,
  Pill,
  Calendar,
  Stethoscope,
  Coffee,
  BatteryCharging,
  RefreshCw,
  Sliders,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Radio,
  Eye,
  Info,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { AuraTiltCard } from '../components/common/AuraTiltCard';

// Core Hotspot in the Brain
interface BrainHotspot {
  id: string;
  name: string;
  channels: string[];
  xPercent: number; // For interactive visual mapping
  yPercent: number;
  color: string;
  adhdStatus: string;
  controlStatus: string;
  pathology: string;
  restSolution: string;
}

const BRAIN_HOTSPOTS: BrainHotspot[] = [
  {
    id: 'prefrontal',
    name: 'Prefrontal Executive Network (DLPFC)',
    channels: ['Fp1', 'Fp2', 'Fz', 'F3', 'F4'],
    xPercent: 32,
    yPercent: 36,
    color: '#20BFE8',
    adhdStatus: 'High Theta (4-8 Hz) excess, under-aroused dopamine transport, executive fatigue',
    controlStatus: 'Optimal beta modulation (13-20 Hz) on sustained continuous task demand',
    pathology:
      'Reduced tonic dopamine & noradrenaline firing in the prefrontal cortex causes executive dysfunction, working memory degradation, and delayed impulse gating.',
    restSolution:
      'Non-Sleep Deep Rest (NSDR) 15 mins daily, Pomodoro 25/5 pacing to avoid prefrontal glycogen depletion.',
  },
  {
    id: 'frontostriatal',
    name: 'Fronto-Striatal Dopaminergic Circuit',
    channels: ['F3', 'F4', 'C3', 'C4'],
    xPercent: 48,
    yPercent: 44,
    color: '#087CFF',
    adhdStatus: 'Dopamine D4 receptor under-expression, reward deficiency syndrome',
    controlStatus: 'Normal reward-prediction error encoding and stable tonic dopamine baseline',
    pathology:
      'Striatal dopamine clearance is accelerated, requiring higher novelty and intrinsic motivation to sustain attention and prevent micro-sleeps.',
    restSolution:
      'Intrinsically rewarding creative tasks, physical aerobic exercise (BDNF elevation), L-Tyrosine precursor nutrition.',
  },
  {
    id: 'sensorimotor',
    name: 'Sensorimotor Strip & Motor Gating',
    channels: ['C3', 'Cz', 'C4'],
    xPercent: 62,
    yPercent: 38,
    color: '#10B981',
    adhdStatus: 'Depleted Sensorimotor Rhythm (SMR 12-15 Hz), somatic motor restlessness',
    controlStatus: 'High SMR during physical stillness; motor urge suppression active',
    pathology:
      'Failure of central vertex gating to inhibit involuntary micro-movements, leading to tactile fidgeting, leg shaking, and hyperactive restlessness.',
    restSolution:
      'SMR neurofeedback training (rewarding 12-15 Hz at Cz while inhibiting 4-8 Hz), proprioceptive weighted lap pads.',
  },
  {
    id: 'hypothalamus',
    name: 'Hypothalamic Circadian & DMN Hub',
    channels: ['Fz', 'Pz'],
    xPercent: 54,
    yPercent: 62,
    color: '#F59E0B',
    adhdStatus: 'Delayed melatonin phase onset (1.5–2 hours), hyperactive Default Mode Network',
    controlStatus: 'Synchronized circadian melatonin rise by 10:30 PM, prompt DMN deactivation',
    pathology:
      'Circadian clock genes (PER2, CLOCK) show delayed transcriptional rhythm in 70%+ of individuals with ADHD, resulting in sleep-onset insomnia.',
    restSolution:
      'Morning 10,000-lux bright light exposure within 30 min of waking; strict blue-light filter 90 min before bed.',
  },
  {
    id: 'parieto-occipital',
    name: 'Parieto-Occipital Sensory Integration',
    channels: ['P3', 'P4', 'Pz', 'O1', 'O2'],
    xPercent: 78,
    yPercent: 50,
    color: '#8B5CF6',
    adhdStatus: 'Attenuated P300 amplitude, incomplete posterior alpha desynchronization',
    controlStatus: 'High P300 oddball response, clear alpha suppression upon visual task engagement',
    pathology:
      'Reduced sensory filtering threshold causes environmental sensory overload (auditory noise, peripheral visual flicker distracting core focus).',
    restSolution:
      'Noise-cancelling headphones, low-luminance ambient workspace, visual field decluttering.',
  },
];

// Channel-specific clinical details
interface AffectedChannelSpec {
  code: string;
  region: string;
  bandImpact: string;
  voltageDelta: string;
  adhdBehavior: string;
  recoveryGuideline: string;
}

const AFFECTED_CHANNELS_LIST: AffectedChannelSpec[] = [
  {
    code: 'Fz / F3 / F4',
    region: 'Frontal Midline & Dorsal Cortex',
    bandImpact: 'Theta/Beta Ratio > 3.0 (Severe Slow Wave Excess)',
    voltageDelta: '+8.4 μV Theta elevation vs Control',
    adhdBehavior: 'Executive task paralysis, sustained vigilance drift, working memory drop',
    recoveryGuideline: 'Neurofeedback theta-suppression, 20-min daily dual n-back working memory workouts.',
  },
  {
    code: 'Fp1 / Fp2',
    region: 'Frontopolar Prefrontal Pole',
    bandImpact: 'Slow Cortical Potential Asymmetry',
    voltageDelta: '+12.1 μV slow fluctuation',
    adhdBehavior: 'Impulse rashness, emotional over-reactivity, immediate gratification seeking',
    recoveryGuideline: 'Mindfulness breathing, physiological sigh (double inhale, long exhale) to restore autonomic tone.',
  },
  {
    code: 'Cz / C3 / C4',
    region: 'Central Vertex & Motor Cortex',
    bandImpact: 'SMR 12–15 Hz Depletion (< 3.2 μV²)',
    voltageDelta: '-4.6 μV SMR power drop vs Control',
    adhdBehavior: 'Inability to sit still, continuous tactile fidgeting, motor agitation',
    recoveryGuideline: 'Active motor breaks every 30 minutes, aerobic exercise, somatic grounding.',
  },
  {
    code: 'Pz / P3 / P4',
    region: 'Parietal Association Cortex',
    bandImpact: 'P300 Latency Delay (+42 ms) & Low Amplitude',
    voltageDelta: '-6.2 μV P300 peak deficit',
    adhdBehavior: 'Delayed sensory decision-making, spatial distractibility in busy rooms',
    recoveryGuideline: 'Single-task environmental structuring, elimination of open-plan acoustic interference.',
  },
  {
    code: 'O1 / O2',
    region: 'Primary Occipital Visual Cortex',
    bandImpact: 'Posterior Alpha (8–12 Hz) Desynchronization Failure',
    voltageDelta: '+5.3 μV Alpha intrusion during focus',
    adhdBehavior: 'Visual mind-wandering, "zoning out" during continuous reading',
    recoveryGuideline: '20-20-20 visual rest rule: every 20 mins look at 20 feet away for 20 seconds.',
  },
  {
    code: 'T3 / T4 / T5 / T6',
    region: 'Temporal Auditory & Language Cortex',
    bandImpact: 'Auditory Steady-State Deficit (40 Hz)',
    voltageDelta: '-3.8 μV phase locking drop',
    adhdBehavior: 'Auditory processing fatigue, difficulty extracting speech in noisy background',
    recoveryGuideline: 'Auditory silence periods, binaural beats (14 Hz beta) during intensive study.',
  },
];

export const BrainRecoveryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'etiology' | 'comparison' | 'rest' | 'tracker'>('etiology');
  const [selectedHotspot, setSelectedHotspot] = useState<BrainHotspot>(BRAIN_HOTSPOTS[0]);
  const [showRefViewer, setShowRefViewer] = useState<boolean>(false);

  // Sleep Quality Data (Inspired by Ref Image 2)
  const sleepDays = [
    { day: 'Mon', hours: 7.2, target: 8.5, quality: 'Good' },
    { day: 'Tue', hours: 6.8, target: 8.5, quality: 'Fair' },
    { day: 'Wed', hours: 7.5, target: 8.5, quality: 'Good' },
    { day: 'Thu', hours: 6.4, target: 8.5, quality: 'Tired' },
    { day: 'Fri', hours: 8.5, target: 8.5, quality: 'Optimal', active: true },
    { day: 'Sat', hours: 8.2, target: 8.5, quality: 'Restorative' },
    { day: 'Sun', hours: 7.8, target: 8.5, quality: 'Good' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HERO HEADER & TELEMETRY STRIP                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#20BFE8]/25 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20BFE8]/15 border border-[#20BFE8]/40 text-[#79DFFF] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-[#20BFE8] animate-pulse" />
            <span>NEURO-PATHOLOGY, CHANNEL ETIOLOGY & CLINICAL RECOVERY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white">
            Brain Health, ADHD Etiology & Rest Protocols
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 max-w-3xl">
            Explore how ADHD develops across neuro-electrical channels, contrast neural signatures against healthy controls, and apply targeted brain recovery protocols.
          </p>
        </div>

        {/* Action Toggle to inspect User's Reference Layout */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowRefViewer(!showRefViewer)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#087CFF]/15 border border-[#20BFE8]/40 text-[#79DFFF] hover:bg-[#20BFE8]/25 hover:border-[#20BFE8] text-xs font-mono font-medium transition-all cursor-pointer shadow-[0_0_15px_rgba(32,191,232,0.2)]"
          >
            <Eye className="w-4 h-4 text-[#20BFE8]" />
            <span>{showRefViewer ? 'Hide Reference Designs' : 'View Clinical Reference Dashboards'}</span>
          </button>
        </div>
      </div>

      {/* Reference Image Comparison Drawer (When Opened) */}
      <AnimatePresence>
        {showRefViewer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-3xl bg-[#040c1e]/90 border border-[#20BFE8]/40 overflow-hidden shadow-[0_0_30px_rgba(32,191,232,0.2)]"
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#20BFE8]/20 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#20BFE8]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CLINICAL UI ARCHETYPES & REFERENCE INSPIRATION
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Integrated customized aesthetics with live project telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Ref Archetype 1: Brain Health Overview (Sleep, Workouts, Score)
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img
                    src="/images/brain_health_overview_ref.png"
                    alt="Brain Health Overview Reference"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Ref Archetype 2: Clinical Health Care (Hotspots, Doctors, Regimen)
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img
                    src="/images/clinical_care_overview_ref.png"
                    alt="Clinical Care Overview Reference"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. TOP METRICS STRIP (Inspired by Image 2 & 3 Scorecards)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Brain Health Score */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>HEALTH SCORE</span>
            <Activity className="w-3.5 h-3.5 text-[#20BFE8]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-white">8.4</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#087CFF] to-[#20BFE8] h-full rounded-full" style={{ width: '84%' }} />
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">Baseline: +1.6 post-rest</span>
        </AuraTiltCard>

        {/* Metric 2: Cognitive Health */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>COGNITIVE INDEX</span>
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-[#79DFFF]">88</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#20BFE8] h-full rounded-full" style={{ width: '88%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">Control cohort: 92/100</span>
        </AuraTiltCard>

        {/* Metric 3: Focus Level */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>FOCUS ENDURANCE</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-amber-300">82%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '82%' }} />
          </div>
          <span className="text-[10px] text-amber-400 font-mono block">Pacing required after 25m</span>
        </AuraTiltCard>

        {/* Metric 4: SMR Stability */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SMR MOTOR GATING</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-emerald-400">79%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '79%' }} />
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">Cz: 12-15 Hz stable</span>
        </AuraTiltCard>

        {/* Metric 5: Theta/Beta Ratio (TBR) */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>THETA/BETA (TBR)</span>
            <Radio className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-violet-300">2.18</span>
            <span className="text-xs text-slate-400">Ratio</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">Normal: &lt; 2.50 (Calm)</span>
        </AuraTiltCard>

        {/* Metric 6: Stress & Arousal Level */}
        <AuraTiltCard maxTilt={8} scale={1.02} className="p-4 rounded-2xl glass-panel border border-[#20BFE8]/30 space-y-2 bg-[#020714]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>STRESS LOAD</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-rose-300">22%</span>
            <span className="text-xs text-slate-400">Low</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '22%' }} />
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">Parasympathetic tone: High</span>
        </AuraTiltCard>

      </div>

      {/* ========================================================================= */}
      {/* 3. CORE NAVIGATION TABS                                                   */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#040a18]/90 border border-[#20BFE8]/25 backdrop-blur-xl w-fit">
        <button
          onClick={() => setActiveTab('etiology')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'etiology'
              ? 'bg-[#20BFE8] text-black shadow-[0_0_15px_#20BFE8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. ADHD Pathology & Channels
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-[#20BFE8] text-black shadow-[0_0_15px_#20BFE8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. ADHD vs Control Comparison
        </button>
        <button
          onClick={() => setActiveTab('rest')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'rest'
              ? 'bg-[#20BFE8] text-black shadow-[0_0_15px_#20BFE8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Brain Rest & Recovery Protocols
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-[#20BFE8] text-black shadow-[0_0_15px_#20BFE8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Sleep, Workouts & Clinical Care
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADHD ETIOLOGY & CHANNEL BREAKDOWN                                   */}
      {/* ========================================================================= */}
      {activeTab === 'etiology' && (
        <div className="space-y-6">
          
          {/* Section A: Interactive Hotspot Neurological Brain (Inspired by Ref Image 3) */}
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-6 bg-gradient-to-b from-[#030919]/90 to-[#020512]/95 relative overflow-hidden shadow-[0_0_35px_rgba(32,191,232,0.15)]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20BFE8]/20 pb-4">
              <div>
                <span className="text-xs font-mono text-[#20BFE8] font-bold tracking-wider uppercase">
                  NEURO-PATHOLOGICAL CIRCUIT MAPPING
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
                  How ADHD Manifests Across Brain Networks
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Click any glowing neurological hotspot to inspect localized channel abnormalities and targeted clinical recovery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#087CFF]/15 border border-[#20BFE8]/30 text-cyan-300">
                  5 Key Pathological Loci
                </span>
              </div>
            </div>

            {/* Hotspot Layout: 3D Brain Graphic on Left + Active Hotspot Telemetry on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Stylized Brain Diagram with Hotspot Pins */}
              <div className="lg:col-span-7 relative flex items-center justify-center p-6 rounded-2xl bg-[#010410]/90 border border-[#20BFE8]/30 shadow-inner min-h-[380px]">
                
                {/* Center Stylized 3D Brain Visual */}
                <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                  <img
                    src="/images/brain_rotating_clean.mp4.jpg"
                    alt="Neurological Brain Map"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(32,191,232,0.4)] opacity-90 rounded-2xl"
                    onError={(e) => {
                      // Fallback if frame image not found
                      e.currentTarget.src = '/images/neural_synapse_bg.png';
                    }}
                  />

                  {/* Hotspot Pins Overlaid on the Brain (Inspired by Ref Image 3 Hotspot Dots) */}
                  {BRAIN_HOTSPOTS.map((spot) => {
                    const isSelected = selectedHotspot.id === spot.id;
                    return (
                      <button
                        key={spot.id}
                        onClick={() => setSelectedHotspot(spot)}
                        style={{
                          left: `${spot.xPercent}%`,
                          top: `${spot.yPercent}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 transition-all ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                        }`}
                        title={spot.name}
                      >
                        {/* Outer Pulse Wave */}
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: spot.color }}
                        />
                        {/* Solid Pin Core */}
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform"
                          style={{
                            backgroundColor: spot.color,
                            boxShadow: `0 0 16px ${spot.color}`,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>

                        {/* Hover Tooltip Label */}
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded-md bg-[#00081c]/95 border border-[#20BFE8]/40 text-[10px] font-mono font-bold text-white shadow-xl pointer-events-none">
                          {spot.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Hotspot Indicator Pill Bar at bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono px-3 py-1.5 rounded-xl bg-[#00081c]/90 border border-[#20BFE8]/30 backdrop-blur-md">
                  <span className="text-slate-400">ACTIVE REGION:</span>
                  <span className="text-[#20BFE8] font-bold">{selectedHotspot.name}</span>
                </div>
              </div>

              {/* Right Column: Active Hotspot Deep Diagnostic Telemetry Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/40 space-y-4 shadow-[0_0_25px_rgba(32,191,232,0.15)]">
                  
                  <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#79DFFF] uppercase tracking-wider block">
                        FOCAL REGION
                      </span>
                      <h4 className="text-base font-bold font-heading text-white">{selectedHotspot.name}</h4>
                    </div>
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px]"
                      style={{ backgroundColor: selectedHotspot.color, boxShadow: `0 0 10px ${selectedHotspot.color}` }}
                    />
                  </div>

                  {/* Impacted EEG Channels Badge */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">IMPACTED 10-20 CHANNELS:</span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                      {selectedHotspot.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 rounded-md bg-[#20BFE8]/15 border border-[#20BFE8]/40 text-[#79DFFF] font-bold"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ADHD State vs Control State */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ADHD Electro-Pathology:
                      </span>
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {selectedHotspot.adhdStatus}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Healthy Control State:
                      </span>
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {selectedHotspot.controlStatus}
                      </p>
                    </div>
                  </div>

                  {/* Neuro-Recovery Intervention */}
                  <div className="p-3 rounded-xl bg-[#087CFF]/15 border border-[#20BFE8]/40 space-y-1 text-xs">
                    <span className="text-[#79DFFF] font-mono font-bold text-[11px] flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#20BFE8]" />
                      Prescribed Neural Recovery:
                    </span>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">
                      {selectedHotspot.restSolution}
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Section B: All 19 Channels Clinical Dysregulation Directory */}
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/25 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#20BFE8] font-bold uppercase tracking-wider">
                ELECTRODE ANATOMICAL BREAKDOWN
              </span>
              <h3 className="text-xl font-bold font-heading text-white mt-0.5">
                19-Channel ADHD Pathological Spectrum
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Exact voltage shifts and frequency band perturbations registered during standard 10-20 EEG acquisition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AFFECTED_CHANNELS_LIST.map((spec) => (
                <div
                  key={spec.code}
                  className="p-5 rounded-2xl bg-[#040e22]/80 border border-[#20BFE8]/25 space-y-3 hover:border-[#20BFE8]/60 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-sm text-[#79DFFF] group-hover:text-[#20BFE8] transition-colors">
                      {spec.code}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {spec.region}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">BAND IMPACT:</span>
                      <span className="text-amber-400 font-bold">{spec.bandImpact}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">MICROVOLT SHIFT:</span>
                      <span className="text-cyan-300 font-bold">{spec.voltageDelta}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">BEHAVIORAL SYMPTOM:</span>
                      <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                        {spec.adhdBehavior}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-emerald-400 block font-bold">RECOVERY GUIDELINE:</span>
                      <p className="text-slate-400 text-[11px] font-sans">
                        {spec.recoveryGuideline}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADHD VS. HEALTHY CONTROL COMPARATIVE MATRIX                        */}
      {/* ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-6 bg-gradient-to-b from-[#030919]/90 to-[#020512]/95">
            <div>
              <span className="text-xs font-mono text-[#20BFE8] font-bold uppercase tracking-wider">
                SUBJECT-LEVEL PHYSIOLOGICAL CONTRAST
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
                ADHD Brain Profile vs. Healthy Control Neurotypical Profile
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Objective bio-electrical and neurological comparisons calibrated against clinical IEEE & Mendeley benchmark cohorts
              </p>
            </div>

            {/* Side-by-Side Architectural Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: ADHD Brain Profile */}
              <div className="p-6 rounded-3xl bg-[#140804]/80 border border-orange-500/40 space-y-5 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center font-bold text-orange-400">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-heading text-white">ADHD Neurological State</h4>
                      <span className="text-xs font-mono text-orange-400">Cortical Under-Arousal & Theta Dominance</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Atypical Profile
                  </span>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>THETA POWER (4–8 HZ)</span>
                      <span className="text-orange-400 font-bold">58.4% (Severe Excess)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>BETA OSCILLATIONS (13–30 HZ)</span>
                      <span className="text-rose-400 font-bold">14.2% (Suppressed)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>THETA / BETA RATIO (TBR)</span>
                      <span className="text-amber-400 font-bold">3.82 (High Arousal Deficit)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>DEFAULT MODE NETWORK (DMN) DEACTIVATION</span>
                      <span className="text-orange-400 font-bold">Delayed by 4.2 seconds</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans mt-1">
                      Mind-wandering circuits intrude into task focus, causing attentional drift.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Healthy Control Brain Profile */}
              <div className="p-6 rounded-3xl bg-[#041a12]/80 border border-emerald-500/40 space-y-5 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-heading text-white">Healthy Control State</h4>
                      <span className="text-xs font-mono text-emerald-400">Synchronized Cortical Regulation</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Normative Cohort
                  </span>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>THETA POWER (4–8 HZ)</span>
                      <span className="text-emerald-400 font-bold">22.1% (Normative Rest)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>BETA OSCILLATIONS (13–30 HZ)</span>
                      <span className="text-cyan-400 font-bold">36.5% (Engaged Vigilance)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>THETA / BETA RATIO (TBR)</span>
                      <span className="text-emerald-400 font-bold">1.48 (Equilibrated Focus)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>DEFAULT MODE NETWORK (DMN) DEACTIVATION</span>
                      <span className="text-emerald-400 font-bold">Immediate (&lt; 0.6 seconds)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans mt-1">
                      Prompt suppression of internal dialogue allows seamless immersion in task demands.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Cross-Cohort Multi-Dimensional Comparison Table */}
            <div className="p-6 rounded-2xl bg-[#040e24]/80 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold font-heading text-white uppercase tracking-wider">
                Clinical Feature Metric Matrix: ADHD vs. Control
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-medium">PHYSIOLOGICAL PARAMETER</th>
                      <th className="pb-3 font-medium text-orange-400">ADHD COHORT TYPICAL</th>
                      <th className="pb-3 font-medium text-emerald-400">HEALTHY CONTROL TYPICAL</th>
                      <th className="pb-3 font-medium text-cyan-400">CLINICAL SIGNIFICANCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 font-bold text-white">Theta/Beta Ratio (Fz)</td>
                      <td className="py-3 text-orange-300">3.2 – 5.8</td>
                      <td className="py-3 text-emerald-300">1.2 – 2.1</td>
                      <td className="py-3 text-slate-400">FDA-approved de-novo biomarker criterion</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">P300 Event-Related Amplitude</td>
                      <td className="py-3 text-orange-300">6.4 ± 1.8 μV</td>
                      <td className="py-3 text-emerald-300">14.8 ± 2.4 μV</td>
                      <td className="py-3 text-slate-400">Reduced neural allocation to rare target stimuli</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Sensorimotor Rhythm (Cz)</td>
                      <td className="py-3 text-orange-300">Suppressed (&lt; 3.0 μV²)</td>
                      <td className="py-3 text-emerald-300">Elevated (7.5–12.0 μV²)</td>
                      <td className="py-3 text-slate-400">Inability to suppress motor fidgeting reflex</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Melatonin Phase Onset (DLMO)</td>
                      <td className="py-3 text-orange-300">11:45 PM – 01:15 AM</td>
                      <td className="py-3 text-emerald-300">09:30 PM – 10:15 PM</td>
                      <td className="py-3 text-slate-400">Delayed circadian phase in 73% of ADHD adults</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Continuous Vigilance Decay</td>
                      <td className="py-3 text-orange-300">High error rate after 18 min</td>
                      <td className="py-3 text-emerald-300">Stable accuracy for 45+ min</td>
                      <td className="py-3 text-slate-400">Requires strategic ultradian rest cycles</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BRAIN REST & RECOVERY PROTOCOLS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'rest' && (
        <div className="space-y-6">
          
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-6 bg-gradient-to-b from-[#030919]/90 to-[#020512]/95">
            <div>
              <span className="text-xs font-mono text-[#20BFE8] font-bold uppercase tracking-wider">
                EVIDENCE-BASED NEUROLOGICAL REST
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
                How an ADHD Brain Should Rest & Recharge
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-3xl">
                Individuals with ADHD consume ~35% more cerebral glucose during cognitive tasks to compensate for prefrontal hypofrontality. Rest is not passive laziness—it is structured neurochemical recovery.
              </p>
            </div>

            {/* 4 Pillars of Brain Rest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pillar 1: Circadian Slow-Wave Sleep */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Moon className="w-5 h-5 text-[#20BFE8]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-white">1. Circadian Realignment & Deep Sleep</h4>
                    <span className="text-xs font-mono text-cyan-400">8.0 to 8.5 Hours Restorative Window</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Deep Slow-Wave Sleep (Stage 3 NREM) is when the brain’s glymphatic system flushes metabolic waste and replenishes prefrontal dopamine receptors.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Anchor wakeup time with 10k lux morning sunlight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>No screens 90 minutes before bed (blocks melatonin delay)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bedroom temperature below 19°C (66°F) to trigger core cooling</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Non-Sleep Deep Rest (NSDR) */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <BatteryCharging className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-white">2. Non-Sleep Deep Rest (NSDR) / Yoga Nidra</h4>
                    <span className="text-xs font-mono text-emerald-400">15–20 Minutes Midday Protocol</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  NSDR puts the brain into alpha-theta border state (7-8 Hz), restoring striatal dopamine reserves without causing groggy sleep inertia.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lie down flat with eyes closed; slow diaphragmatic breathing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Perform mental body scan from feet to forehead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Elevates striatal dopamine by up to 65%</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Ultradian Pacing */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-white">3. Ultradian Pacing (25/5 Pomodoro)</h4>
                    <span className="text-xs font-mono text-amber-400">Prefrontal Glycogen Preservation</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Never push through the "ADHD hyper-focus wall" to severe burnout. Rest before cortical exhaustion forces an involuntary shutdown.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>25 minutes focused single-task engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5 minutes physical movement (no social media or email screens)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>30 minutes full disconnect after 4 continuous cycles</span>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Attention Restoration (Nature & Soft Fascination) */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-400">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-white">4. Nature Immersion ("Green Time")</h4>
                    <span className="text-xs font-mono text-violet-400">Soft Fascination Alpha Recovery</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Walking in natural environments engages involuntary attention mechanisms, completely resting the exhausted top-down dorsal attentional network.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>20 minutes outdoor walk in green park or tree-lined street</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Significantly reduces ADHD symptom severity in children & adults</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lowers salivary cortisol and resets autonomic hyper-arousal</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SLEEP QUALITY, BRAIN WORKOUT & CLINICAL CARE (Ref Image 2 & 3)     */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Sleep Quality Weekly Chart & Brain Workout Routine (From Image 2) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Sleep Quality Weekly Bar Chart (Inspired by Ref Image 2) */}
              <div className="p-6 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-5 bg-[#030919]/90">
                <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#087CFF]/20 border border-[#20BFE8]/40 flex items-center justify-center text-[#20BFE8]">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-heading text-white">Sleep Quality Tracker</h3>
                      <span className="text-xs font-mono text-slate-400">Target Restorative Window: 8.0–8.5 Hours</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Avg: 7.5h / day
                  </span>
                </div>

                {/* The 7-Day Bar Chart */}
                <div className="space-y-2 pt-2">
                  <div className="relative h-44 flex items-end justify-between gap-3 px-4 border-b border-slate-800 pb-2">
                    
                    {/* Goal Dashed Line at 8.0h */}
                    <div className="absolute top-[28%] left-0 right-0 border-b border-dashed border-[#20BFE8]/40 flex items-center justify-end pr-2">
                      <span className="text-[10px] font-mono text-[#79DFFF] bg-[#00081c] px-2 rounded">
                        Goal: 8.5h
                      </span>
                    </div>

                    {sleepDays.map((d) => {
                      const heightPercent = (d.hours / 10) * 100;
                      return (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          {/* Hour badge on hover */}
                          <span className="text-[10px] font-mono text-cyan-300 opacity-80 group-hover:opacity-100 font-bold">
                            {d.hours}h
                          </span>
                          {/* The Bar */}
                          <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-xl h-full flex items-end overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.8 }}
                              className={`w-full rounded-t-xl transition-all ${
                                d.active
                                  ? 'bg-gradient-to-t from-[#087CFF] to-[#20BFE8] shadow-[0_0_15px_#20BFE8]'
                                  : 'bg-gradient-to-t from-slate-700 to-cyan-500/60 hover:to-cyan-400'
                              }`}
                            />
                          </div>
                          {/* Day label */}
                          <span className="text-[11px] font-mono text-slate-400 font-bold">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <span>Deep Slow-Wave Stage: 22% (Normal)</span>
                  <span className="text-emerald-400 font-bold">Circadian Sleep Onset: 11:15 PM</span>
                </div>
              </div>

              {/* Brain Workout Routine (Inspired by Ref Image 2) */}
              <div className="p-6 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-4 bg-[#030919]/90">
                <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-5 h-5 text-[#20BFE8]" />
                    <h3 className="text-lg font-bold font-heading text-white">Daily Brain Workout Routine</h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">3 Target Modalities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  
                  {/* Workout 1: Meditate */}
                  <AuraTiltCard maxTilt={8} className="p-4 rounded-2xl bg-[#041126]/80 border border-[#20BFE8]/30 space-y-2 text-center group cursor-pointer hover:border-[#20BFE8]">
                    <div className="w-10 h-10 rounded-xl bg-[#087CFF]/20 border border-[#20BFE8]/40 mx-auto flex items-center justify-center text-[#20BFE8] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(32,191,232,0.3)]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-sm font-heading text-white">Meditate</h5>
                    <p className="text-[11px] text-slate-400 font-mono">15m DMN Reset</p>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block">Alpha +3.2 μV</span>
                  </AuraTiltCard>

                  {/* Workout 2: Brain Puzzles */}
                  <AuraTiltCard maxTilt={8} className="p-4 rounded-2xl bg-[#041126]/80 border border-[#20BFE8]/30 space-y-2 text-center group cursor-pointer hover:border-[#20BFE8]">
                    <div className="w-10 h-10 rounded-xl bg-[#087CFF]/20 border border-[#20BFE8]/40 mx-auto flex items-center justify-center text-[#20BFE8] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(32,191,232,0.3)]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-sm font-heading text-white">Brain Puzzles</h5>
                    <p className="text-[11px] text-slate-400 font-mono">20m Dual N-Back</p>
                    <span className="text-[10px] text-cyan-300 font-mono font-bold block">P300 Latency -18ms</span>
                  </AuraTiltCard>

                  {/* Workout 3: Creativity */}
                  <AuraTiltCard maxTilt={8} className="p-4 rounded-2xl bg-[#041126]/80 border border-[#20BFE8]/30 space-y-2 text-center group cursor-pointer hover:border-[#20BFE8]">
                    <div className="w-10 h-10 rounded-xl bg-[#087CFF]/20 border border-[#20BFE8]/40 mx-auto flex items-center justify-center text-[#20BFE8] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(32,191,232,0.3)]">
                      <Flame className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-sm font-heading text-white">Creativity Flow</h5>
                    <p className="text-[11px] text-slate-400 font-mono">30m Flow State</p>
                    <span className="text-[10px] text-violet-400 font-mono font-bold block">Dopamine Release</span>
                  </AuraTiltCard>

                </div>
              </div>

            </div>

            {/* Right 5 Cols: Clinical Care, Specialist & Prescriptions (From Image 3) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Doctor / Specialist Card (Inspired by Ref Image 3 Dr. Weber) */}
              <div className="p-6 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-4 bg-[#030919]/90">
                <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#20BFE8]" />
                    <h4 className="text-base font-bold font-heading text-white">Attending Clinical Team</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Active Care
                  </span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#020712]/90 border border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#087CFF]/40 to-[#20BFE8]/30 border border-[#20BFE8]/50 flex items-center justify-center text-[#79DFFF] font-bold text-lg shrink-0">
                    DR
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-white font-heading">Dr. Weber, MD</h5>
                    <p className="text-xs font-mono text-cyan-300">Neurology & EEG Specialist</p>
                    <span className="text-[10px] text-slate-400 font-mono block">Clinical Neuro-physiology Dept.</span>
                  </div>
                </div>

                {/* Treatment Regimen Pills (From Ref Image 3) */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-2">THERAPEUTIC MODALITIES:</span>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-3 py-1 rounded-full bg-[#087CFF]/20 border border-[#20BFE8]/40 text-[#79DFFF]">
                      EEG Neurofeedback (SMR)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                      CBT Executive Coaching
                    </span>
                    <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/40 text-violet-300">
                      Circadian Melatonin Timing
                    </span>
                  </div>
                </div>

                {/* Checkup Schedule (From Ref Image 3) */}
                <div className="p-3.5 rounded-xl bg-[#020712]/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#20BFE8]" />
                    <div>
                      <span className="text-white font-bold block">Next EEG Follow-up</span>
                      <span className="text-slate-400 text-[10px]">Cohort Verification Scan</span>
                    </div>
                  </div>
                  <span className="text-cyan-400 font-bold">Thurs, 10:30 AM</span>
                </div>
              </div>

              {/* Patient Symptom / Complaint Tracking Log (From Ref Image 3) */}
              <div className="p-6 rounded-3xl glass-panel border border-[#20BFE8]/30 space-y-4 bg-[#030919]/90">
                <div className="flex items-center justify-between border-b border-[#20BFE8]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Symptom Log & Clinical Intervention
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Past 7 Days</span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#020712]/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Inattentive Fog (Afternoon)</span>
                      <span className="text-amber-400 font-bold">Moderate</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Prefrontal theta elevation after 2:30 PM screen tasks. Addressed via 15m NSDR session.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#020712]/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Motor Fidgeting / Restlessness</span>
                      <span className="text-emerald-400 font-bold">Low (Remitting)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Cz SMR power restored to 7.2 μV². Physical restlessness reduced by 40%.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#020712]/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Sleep Latency</span>
                      <span className="text-cyan-300 font-bold">Improved (22 min)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Blue-light elimination enabled melatonin onset by 10:45 PM.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
export default BrainRecoveryPage;
