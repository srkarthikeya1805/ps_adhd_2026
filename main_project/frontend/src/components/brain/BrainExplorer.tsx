import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  AlertCircle,
  Info,
  ChevronRight,
  Brain,
  HelpCircle,
  CheckCircle2,
  Zap,
  Target,
  Glasses,
  Ear,
  Headphones,
} from 'lucide-react';
import { BrainRegionKey } from '../../types';
import { BRAIN_REGIONS } from '../../utils/sampleData';
import { BrainCanvas } from './BrainCanvas';

interface LobeGuide {
  key: BrainRegionKey;
  name: string;
  scientificName: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  icon: any;
  everydayRole: string;
  adhdExplanation: string;
  eegElectrodes: string[];
  wavePattern: string;
  realWorldExample: string;
}

export const BrainExplorer: React.FC = () => {
  const [selectedRegionKey, setSelectedRegionKey] = useState<BrainRegionKey>('frontal');

  const lobeGuides: LobeGuide[] = [
    {
      key: 'frontal',
      name: 'Frontal Lobe',
      scientificName: 'Prefrontal & Motor Cortex',
      color: '#00E5FF',
      borderColor: 'border-cyan-500/50',
      bgGlow: 'shadow-[0_0_25px_rgba(0,229,255,0.25)]',
      icon: Target,
      everydayRole: 'Executive command center: planning, working memory, emotional impulse control, decision making, and sustaining focus on tasks.',
      adhdExplanation:
        'In ADHD, low dopamine levels in the frontal cortex cause hypoarousal (under-activation). The brain struggles to stay alert during repetitive or low-stimulation tasks, leading to mind-wandering, daydreaming, procrastination, and physical fidgeting.',
      eegElectrodes: ['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8'],
      wavePattern: 'High Theta Waves (4–8 Hz) & Low Beta Waves (13–30 Hz), producing elevated Theta/Beta Ratio (TBR > 3.0).',
      realWorldExample: 'Starting homework, remembering multi-step instructions, resisting the urge to interrupt or blurt out thoughts.',
    },
    {
      key: 'parietal',
      name: 'Parietal Lobe',
      scientificName: 'Somatosensory & Associative Cortex',
      color: '#8B5CF6',
      borderColor: 'border-violet-500/50',
      bgGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.25)]',
      icon: Zap,
      everydayRole: 'Sensory integration, spatial orientation, body position awareness, and coordinating motor responses.',
      adhdExplanation:
        'Altered sensory gating in the parietal cortex causes individuals with ADHD to feel easily overwhelmed in loud, cluttered, or sensory-heavy environments. Restlessness occurs because the body seeks sensory stimulation to boost alertness.',
      eegElectrodes: ['P3', 'Pz', 'P4'],
      wavePattern: 'Altered alpha-theta phase synchronization and abnormal sensorimotor rhythm (SMR 12–15 Hz).',
      realWorldExample: 'Bumping into objects, feeling irritated by scratchy clothing tags, or having trouble sitting still in crowded rooms.',
    },
    {
      key: 'temporal',
      name: 'Temporal Lobe',
      scientificName: 'Auditory & Hippocampal Complex',
      color: '#F02BD5',
      borderColor: 'border-pink-500/50',
      bgGlow: 'shadow-[0_0_25px_rgba(240,43,213,0.25)]',
      icon: Ear,
      everydayRole: 'Hearing comprehension, processing spoken language, short-term to long-term memory consolidation, and emotional regulation.',
      adhdExplanation:
        'Auditory working memory lag: speech sounds enter properly, but the temporal-frontal link fails to store them rapidly into immediate recall. This causes the classic "I heard you, but I forgot what you said" phenomenon.',
      eegElectrodes: ['T3', 'T4', 'T5', 'T6'],
      wavePattern: 'Asymmetrical theta activity and delayed auditory evoked P300 potential latency.',
      realWorldExample: 'Forgetting verbal 3-step directions immediately after hearing them, or sudden emotional frustration surges.',
    },
    {
      key: 'occipital',
      name: 'Occipital Lobe',
      scientificName: 'Primary & Secondary Visual Cortex',
      color: '#35F5C8',
      borderColor: 'border-teal-500/50',
      bgGlow: 'shadow-[0_0_25px_rgba(53,245,200,0.25)]',
      icon: Glasses,
      everydayRole: 'Visual perception, pattern recognition, spatial color processing, and visual sensory gating.',
      adhdExplanation:
        'Reduced visual gating: healthy brains generate robust occipital Alpha waves (8–13 Hz) to block out background visual clutter. In ADHD, alpha rhythm suppression allows peripheral movements or screen notifications to instantly distract gaze.',
      eegElectrodes: ['O1', 'O2'],
      wavePattern: 'Desynchronized resting alpha peak frequency (< 9.5 Hz) and incomplete visual suppression.',
      realWorldExample: 'Getting distracted by someone walking past the window while trying to read, or missing small visual details on a test.',
    },
  ];

  const currentLobe = lobeGuides.find((l) => l.key === selectedRegionKey) || lobeGuides[0];

  return (
    <section id="brain-explorer" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Interactive 3D Brain Anatomy & Functional Masterguide
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight">
          Understanding the Four Brain Regions in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">ADHD</span>
        </h2>
        <p className="max-w-3xl mx-auto text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium">
          Click any brain region below to inspect its anatomical function, its real-world manifestation in everyday life, and how our 19-channel EEG electrodes measure its electrophysiological activity.
        </p>
      </div>

      {/* 3D Brain Stage & Active Lobe Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: 3D Brain WebGL Stage */}
        <div className="lg:col-span-7 h-[520px] rounded-3xl glass-panel relative overflow-hidden border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono font-bold text-white backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: currentLobe.color }} />
            <span>Active Region: <strong style={{ color: currentLobe.color }}>{currentLobe.name}</strong></span>
          </div>

          <BrainCanvas activeRegion={selectedRegionKey} isOpeningCycleActive={false} interactive={true} />

          <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 backdrop-blur-md flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Rotate brain with mouse to view 3D cortical perspective</span>
            </span>
            <span className="text-cyan-400 font-bold uppercase">{currentLobe.scientificName}</span>
          </div>
        </div>

        {/* Right: Selected Lobe In-Depth Clinical & Everyday Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Lobe Selection Tabs */}
          <div className="grid grid-cols-2 gap-2.5">
            {lobeGuides.map((guide) => {
              const isSelected = guide.key === selectedRegionKey;
              const Icon = guide.icon;
              return (
                <button
                  key={guide.key}
                  type="button"
                  onClick={() => setSelectedRegionKey(guide.key)}
                  className={`p-3.5 rounded-2xl text-left border transition-all duration-300 flex items-center gap-3 ${
                    isSelected
                      ? `bg-slate-900/90 ${guide.borderColor} ${guide.bgGlow} scale-[1.02]`
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${guide.color}22`,
                      border: `1.5px solid ${guide.color}66`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: guide.color }} />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold font-heading text-white block truncate">
                      {guide.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {guide.eegElectrodes.slice(0, 3).join(', ')}...
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Lobe Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLobe.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className={`p-6 rounded-3xl glass-panel border ${currentLobe.borderColor} space-y-4 shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    {currentLobe.scientificName}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white font-heading mt-0.5">
                    {currentLobe.name}
                  </h3>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: `${currentLobe.color}18`,
                    borderColor: `${currentLobe.color}55`,
                    color: currentLobe.color,
                  }}
                >
                  Active Focus
                </span>
              </div>

              {/* Everyday Role */}
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Everyday Cognitive Function:</span>
                </h4>
                <p className="text-xs font-sans text-slate-200 leading-relaxed pl-5 font-medium">
                  {currentLobe.everydayRole}
                </p>
              </div>

              {/* What Happens in ADHD */}
              <div className="space-y-1 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>How This Lobe is Affected in ADHD:</span>
                </h4>
                <p className="text-xs font-sans text-slate-300 leading-relaxed font-medium">
                  {currentLobe.adhdExplanation}
                </p>
              </div>

              {/* Real World Everyday Example */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 text-xs font-sans space-y-0.5">
                <span className="font-bold font-mono text-cyan-300 block">
                  Real-World Daily Challenge:
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentLobe.realWorldExample}
                </p>
              </div>

              {/* Electrodes & Wave Pattern Chips */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold shrink-0">10-20 Electrodes:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentLobe.eegElectrodes.map((ch) => (
                      <span
                        key={ch}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] font-bold"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Biomarker Pattern:</strong> {currentLobe.wavePattern}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Comprehensive 4-Lobe Comparison Table for Complete Clarity */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white">
            Quick Reference: The 4 Lobes in Everyday Life vs. ADHD
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Clear anatomical breakdown designed for parents, educators, students, and clinicians
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lobeGuides.map((guide) => (
            <div
              key={guide.key}
              onClick={() => setSelectedRegionKey(guide.key)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer space-y-3 ${
                selectedRegionKey === guide.key
                  ? `bg-slate-900/90 ${guide.borderColor} ${guide.bgGlow}`
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: guide.color }} />
                  <h4 className="text-sm font-bold font-heading text-white">{guide.name}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {guide.eegElectrodes.length} Leads
                </span>
              </div>

              <div className="space-y-1 text-xs font-sans">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  In Healthy Brain:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                  {guide.everydayRole}
                </p>
              </div>

              <div className="space-y-1 text-xs font-sans pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase text-pink-400 font-bold block">
                  In ADHD:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                  {guide.adhdExplanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
                <span>Click to View 3D</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
