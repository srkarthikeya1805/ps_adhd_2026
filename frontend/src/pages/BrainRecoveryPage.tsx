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
  X,
  Play,
  Check,
} from 'lucide-react';
import { AuraTiltCard } from '../components/common/AuraTiltCard';
import { neuroAudio } from '../utils/audio';

// Hotspot definition in the Brain
interface BrainHotspot {
  id: string;
  name: string;
  channels: string[];
  xPercent: number;
  yPercent: number;
  color: string;
  image: string;
  imageCaption: string;
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
    image: '/images/prefrontal_dopamine_adhd.jpg',
    imageCaption: 'Active Prefrontal Synaptic Dopamine Vesicle Firing',
    adhdStatus: 'High Theta (4-8 Hz) excess, under-aroused dopamine transport, executive task fatigue',
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
    image: '/images/prefrontal_dopamine_adhd.jpg',
    imageCaption: 'Fronto-Striatal Dopamine Re-uptake Transporter (DAT1) Circuit',
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
    image: '/images/neurofeedback_smr_training.jpg',
    imageCaption: 'Sensorimotor Rhythm (SMR 12-15 Hz) Clinical Neurofeedback Training',
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
    image: '/images/deep_sleep_brain_rest.jpg',
    imageCaption: 'Stage 3 NREM Slow-Wave Sleep & Glymphatic Clearance',
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
    image: '/images/eeg_scalp_electrodes_3d.png',
    imageCaption: '10-20 Posterior Alpha Desynchronization Topography',
    adhdStatus: 'Attenuated P300 amplitude, incomplete posterior alpha desynchronization',
    controlStatus: 'High P300 oddball response, clear alpha suppression upon visual task engagement',
    pathology:
      'Reduced sensory filtering threshold causes environmental sensory overload (auditory noise, peripheral visual flicker distracting core focus).',
    restSolution:
      'Noise-cancelling headphones, low-luminance ambient workspace, visual field decluttering.',
  },
];

// Comprehensive 19-Channel Neuro-Pathological Dictionary
export interface ChannelClinicalData {
  channel: string;
  lobe: string;
  band: string;
  frequencyHz: number;
  voltageUv: string;
  adhdEffect: string;
  symptomExperience: string;
  biologicalMechanism: string;
  restGuideline: string;
  audioFreq: number;
  image: string;
}

export const ALL_19_CHANNELS_DATA: Record<string, ChannelClinicalData> = {
  Fp1: {
    channel: 'Fp1',
    lobe: 'Prefrontal Pole (Left)',
    band: 'Theta / Slow Wave',
    frequencyHz: 4.8,
    voltageUv: '-25 to +35 μV',
    adhdEffect: 'Impulse Brake Failure & Emotional Reactivity',
    symptomExperience: 'Acts before thinking; feels sudden frustration or irritability when tasks become tedious.',
    biologicalMechanism: 'Delayed maturation of left frontopolar GABAergic interneurons, causing low inhibitory control.',
    restGuideline: 'Physiological sigh breathing (two quick inhales through nose, long slow exhale through mouth for 3 mins).',
    audioFreq: 320,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  Fp2: {
    channel: 'Fp2',
    lobe: 'Prefrontal Pole (Right)',
    band: 'Theta / Slow Cortical',
    frequencyHz: 4.6,
    voltageUv: '-22 to +38 μV',
    adhdEffect: 'Novelty Craving & Risk Under-Appraisal',
    symptomExperience: 'Struggles with boredom; impulsively seeks high-stimulation tasks or social media dopamine spikes.',
    biologicalMechanism: 'Right prefrontal under-arousal impairs long-term consequence evaluation.',
    restGuideline: 'Digital sunset: Replace phone scrolling 1 hour before bed with physical book or calm audio.',
    audioFreq: 340,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  Fz: {
    channel: 'Fz',
    lobe: 'Midline Frontal',
    band: 'Theta / Beta Ratio Hub',
    frequencyHz: 5.2,
    voltageUv: '-30 to +48 μV',
    adhdEffect: 'Severe Attention Drift & Task Paralysis (TBR > 3.0)',
    symptomExperience: 'Brain "blanks out" during lectures, meetings, or reading; high effort produces little retention.',
    biologicalMechanism: 'Massive slow-wave theta synchronization flooding the midline attention network.',
    restGuideline: 'Theta-Suppression Neurofeedback & Pomodoro 25/5 rhythm (never work past cognitive burnout).',
    audioFreq: 440,
    image: '/images/adhd_vs_control_contrast.jpg',
  },
  F3: {
    channel: 'F3',
    lobe: 'Dorsolateral Prefrontal (Left)',
    band: 'Low Beta (13–18 Hz)',
    frequencyHz: 13.8,
    voltageUv: '-18 to +28 μV',
    adhdEffect: 'Working Memory Drop & Lost Train of Thought',
    symptomExperience: 'Walks into a room and forgets why; forgets instructions immediately after hearing them.',
    biologicalMechanism: 'Fronto-striatal dopamine depletion causes working memory buffers to clear prematurely.',
    restGuideline: '15-minute daily Dual N-Back cognitive workout; keep an external notebook for working memory offloading.',
    audioFreq: 520,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  F4: {
    channel: 'F4',
    lobe: 'Dorsolateral Prefrontal (Right)',
    band: 'Beta / Gamma',
    frequencyHz: 15.2,
    voltageUv: '-19 to +30 μV',
    adhdEffect: 'Sustained Vigilance Decay',
    symptomExperience: 'Can focus for 10-15 minutes, but focus deteriorates exponentially into mind-wandering.',
    biologicalMechanism: 'Right dorsal attentional network fails to maintain steady tonic noradrenaline release.',
    restGuideline: 'Nature Immersion (Green Time): 20 minutes walking outdoors resets involuntary soft attention.',
    audioFreq: 560,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  F7: {
    channel: 'F7',
    lobe: 'Inferior Frontal (Left)',
    band: 'Theta / Alpha',
    frequencyHz: 6.8,
    voltageUv: '-15 to +25 μV',
    adhdEffect: 'Verbal Clutter & Conversational Impulsivity',
    symptomExperience: 'Interrupts others mid-sentence; blurts out thoughts before organizing words.',
    biologicalMechanism: 'Broca area adjacent motor speech planning circuit lacks inhibitory pre-motor suppression.',
    restGuideline: 'Slow expressive journaling and pausing for 3 seconds before responding in dialogue.',
    audioFreq: 380,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  F8: {
    channel: 'F8',
    lobe: 'Inferior Frontal (Right)',
    band: 'Theta / Beta',
    frequencyHz: 7.0,
    voltageUv: '-16 to +26 μV',
    adhdEffect: 'Behavioral Inhibition & Motor Restlessness',
    symptomExperience: 'Difficulty waiting in lines or sitting still in chairs; constant physical fidgeting urges.',
    biologicalMechanism: 'Right inferior frontal gyrus (rIFG) response-inhibition circuit hypo-activation.',
    restGuideline: 'Proprioceptive physical movement breaks (stretching, wall push-ups) between desk work blocks.',
    audioFreq: 400,
    image: '/images/neurofeedback_smr_training.jpg',
  },
  Cz: {
    channel: 'Cz',
    lobe: 'Central Vertex',
    band: 'Sensorimotor Rhythm (SMR)',
    frequencyHz: 12.8,
    voltageUv: '-20 to +32 μV',
    adhdEffect: 'SMR Depletion & Somatic Restlessness (< 3.0 μV²)',
    symptomExperience: 'Persistent leg bouncing, tapping fingers, sensation of an "internal motor that won\'t stop".',
    biologicalMechanism: 'Sensorimotor cortex fails to generate calming 12-15 Hz rhythm during physical stillness.',
    restGuideline: 'SMR Neurofeedback (rewarding Cz 12-15 Hz), weighted blanket during sleep and relaxation.',
    audioFreq: 480,
    image: '/images/neurofeedback_smr_training.jpg',
  },
  C3: {
    channel: 'C3',
    lobe: 'Sensorimotor Cortex (Left)',
    band: 'Mu Rhythm (8–12 Hz)',
    frequencyHz: 9.5,
    voltageUv: '-18 to +28 μV',
    adhdEffect: 'Fine-Motor Jitters (Right Hand)',
    symptomExperience: 'Pencil spinning, continuous mouse clicking, difficulty maintaining neat handwriting under speed.',
    biologicalMechanism: 'Left hemisphere motor cortex desynchronization during static posture.',
    restGuideline: 'Tactile stress ball, textured desk surfaces to channel micro-movements harmlessly.',
    audioFreq: 460,
    image: '/images/neurofeedback_smr_training.jpg',
  },
  C4: {
    channel: 'C4',
    lobe: 'Sensorimotor Cortex (Right)',
    band: 'Mu Rhythm (8–12 Hz)',
    frequencyHz: 9.8,
    voltageUv: '-18 to +29 μV',
    adhdEffect: 'Gross-Motor Agitation (Left Body)',
    symptomExperience: 'Frequent posture shifting, crossing/uncrossing legs, feeling physically trapped when seated.',
    biologicalMechanism: 'Right motor strip sensorimotor gating suppression deficit.',
    restGuideline: 'Standing desk alternation: 25 mins standing, 25 mins sitting; progressive muscle relaxation.',
    audioFreq: 470,
    image: '/images/neurofeedback_smr_training.jpg',
  },
  T3: {
    channel: 'T3',
    lobe: 'Mid-Temporal (Left)',
    band: 'Alpha / Theta',
    frequencyHz: 7.4,
    voltageUv: '-14 to +22 μV',
    adhdEffect: 'Auditory Processing Fatigue',
    symptomExperience: 'Asks "What did you say?" even though they heard the sound; delay in understanding speech.',
    biologicalMechanism: 'Auditory temporal cortex has difficulty separating speech signals from ambient acoustic noise.',
    restGuideline: 'Use active noise-cancelling headphones in open offices; listen to 40 Hz gamma binaural tone.',
    audioFreq: 390,
    image: '/images/eeg_scalp_electrodes_3d.png',
  },
  T4: {
    channel: 'T4',
    lobe: 'Mid-Temporal (Right)',
    band: 'Alpha / Theta',
    frequencyHz: 7.6,
    voltageUv: '-14 to +24 μV',
    adhdEffect: 'Sensory Overload & Noise Sensitivity',
    symptomExperience: 'Easily irritated by chewing sounds, ticking clocks, or background chatter; feels overwhelmed.',
    biologicalMechanism: 'Hypersensitive auditory thalamocortical gating failing to filter non-essential ambient cues.',
    restGuideline: 'Daily 15-minute auditory silence sanctuary (earplugs, low sensory stimulation room).',
    audioFreq: 410,
    image: '/images/deep_sleep_brain_rest.jpg',
  },
  T5: {
    channel: 'T5',
    lobe: 'Posterior Temporal (Left)',
    band: 'Alpha (8–13 Hz)',
    frequencyHz: 8.8,
    voltageUv: '-12 to +20 μV',
    adhdEffect: 'Reading Comprehension Drift',
    symptomExperience: 'Reads the same paragraph 4 times without absorbing the meaning; eyes move but brain wanders.',
    biologicalMechanism: 'Wernicke area parietal-temporal junction loses phase-locking with frontal executive control.',
    restGuideline: 'Text-to-speech audio accompaniment while reading; summarize paragraphs in margin notes.',
    audioFreq: 430,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  T6: {
    channel: 'T6',
    lobe: 'Posterior Temporal (Right)',
    band: 'Alpha (8–13 Hz)',
    frequencyHz: 9.1,
    voltageUv: '-13 to +21 μV',
    adhdEffect: 'Social Cue Misinterpretation & Over-Worry',
    symptomExperience: 'Overthinks tone of voice or facial micro-expressions; experiences Rejection Sensitive Dysphoria (RSD).',
    biologicalMechanism: 'Right temporal amygdala-coupled hyper-reactivity to perceived negative social evaluation.',
    restGuideline: 'Cognitive reframing (CBT); write down factual evidence vs assumed emotional interpretation.',
    audioFreq: 450,
    image: '/images/deep_sleep_brain_rest.jpg',
  },
  Pz: {
    channel: 'Pz',
    lobe: 'Midline Parietal',
    band: 'P300 Event-Related Potential',
    frequencyHz: 10.4,
    voltageUv: '-24 to +38 μV',
    adhdEffect: 'Attenuated P300 Amplitude & Slow Target Identification',
    symptomExperience: 'Takes longer to notice mistakes in work; misses critical details on tests or spreadsheets.',
    biologicalMechanism: 'Marked reduction in P300 cognitive event-related potential amplitude during oddball stimuli.',
    restGuideline: 'Aerobic high-intensity intervals (HIIT): 20 mins cardio significantly amplifies P300 peak voltage.',
    audioFreq: 500,
    image: '/images/adhd_vs_control_contrast.jpg',
  },
  P3: {
    channel: 'P3',
    lobe: 'Parietal Association (Left)',
    band: 'Alpha Desynchronization',
    frequencyHz: 10.2,
    voltageUv: '-16 to +26 μV',
    adhdEffect: 'Spatial Working Memory & Math Anxiety',
    symptomExperience: 'Difficulty keeping numbers in head; loses place when following multi-step spatial directions.',
    biologicalMechanism: 'Left intraparietal sulcus parietal alpha desynchronization failure during mental arithmetic.',
    restGuideline: 'Use physical manipulatives, scratch paper for arithmetic, and visual spatial diagrams.',
    audioFreq: 510,
    image: '/images/prefrontal_dopamine_adhd.jpg',
  },
  P4: {
    channel: 'P4',
    lobe: 'Parietal Association (Right)',
    band: 'Alpha Desynchronization',
    frequencyHz: 10.6,
    voltageUv: '-17 to +27 μV',
    adhdEffect: 'Peripheral Visual Distraction',
    symptomExperience: 'Eyes constantly dart toward moving objects in the corner of room; easily pulled off task.',
    biologicalMechanism: 'Right temporoparietal junction (TPJ) hyper-arousal to bottom-up visual triggers.',
    restGuideline: 'Workspace boundary shields: Place monitor facing a plain wall, eliminating peripheral room motion.',
    audioFreq: 530,
    image: '/images/eeg_scalp_electrodes_3d.png',
  },
  O1: {
    channel: 'O1',
    lobe: 'Primary Visual Cortex (Left)',
    band: 'Posterior Alpha (8–12 Hz)',
    frequencyHz: 10.0,
    voltageUv: '-20 to +35 μV',
    adhdEffect: 'Visual Alpha Intrusion During Reading',
    symptomExperience: 'Eyes feel tired quickly; alpha waves intrude during reading, causing visual daydreaming.',
    biologicalMechanism: 'Failure of primary visual cortex to sustain desynchronized beta state under continuous load.',
    restGuideline: '20-20-20 Rule: Every 20 minutes look at an object 20 feet away for 20 seconds.',
    audioFreq: 490,
    image: '/images/deep_sleep_brain_rest.jpg',
  },
  O2: {
    channel: 'O2',
    lobe: 'Primary Visual Cortex (Right)',
    band: 'Posterior Alpha (8–12 Hz)',
    frequencyHz: 10.1,
    voltageUv: '-22 to +36 μV',
    adhdEffect: 'Visual Gaze Instability & Screen Fatigue',
    symptomExperience: 'Difficulty sustaining smooth visual tracking; frequent eye skips across lines of text.',
    biologicalMechanism: 'Right occipital eye field micro-saccadic instability in ADHD continuous performance.',
    restGuideline: 'Warm eye compress for 5 mins; decrease screen blue-light and increase ambient room illumination.',
    audioFreq: 495,
    image: '/images/deep_sleep_brain_rest.jpg',
  },
};

export const BrainRecoveryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'etiology' | 'comparison' | 'rest' | 'tracker'>('etiology');
  const [selectedHotspot, setSelectedHotspot] = useState<BrainHotspot>(BRAIN_HOTSPOTS[0]);
  const [showRefViewer, setShowRefViewer] = useState<boolean>(false);

  // Interactive Channel Modal State (Opens whenever user clicks ANY channel button!)
  const [activeChannelModal, setActiveChannelModal] = useState<ChannelClinicalData | null>(null);
  const [channelNormMode, setChannelNormMode] = useState<'adhd' | 'restored'>('adhd');

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

  // Helper to trigger channel inspection modal
  const handleInspectChannel = (channelCode: string) => {
    const data = ALL_19_CHANNELS_DATA[channelCode] || ALL_19_CHANNELS_DATA['Fz'];
    setActiveChannelModal(data);
    setChannelNormMode('adhd');
    neuroAudio.playSynapseBlip(data.audioFreq);
  };

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
      {/* 3. INTERACTIVE 19-CHANNEL QUICK-ACCESS STRIP (Click any channel!)         */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#040e24]/90 border border-[#20BFE8]/30 space-y-2.5 shadow-[0_0_25px_rgba(32,191,232,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#20BFE8] animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              INTERACTIVE 10-20 ELECTRODE INSPECTOR: CLICK ANY CHANNEL TO VIEW PATHOLOGY & IMAGE
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#79DFFF]">19 Scalp Leads Active</span>
        </div>

        {/* 19 Channel Pills */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {Object.keys(ALL_19_CHANNELS_DATA).map((chKey) => {
            const ch = ALL_19_CHANNELS_DATA[chKey];
            const isFrontal = ['Fp1', 'Fp2', 'F3', 'F4', 'Fz', 'F7', 'F8'].includes(ch.channel);
            const isCentral = ['C3', 'C4', 'Cz'].includes(ch.channel);
            return (
              <button
                key={ch.channel}
                onClick={() => handleInspectChannel(ch.channel)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 border ${
                  isFrontal
                    ? 'bg-[#0087FF]/20 text-[#79DFFF] hover:bg-[#0087FF]/35 border-[#0087FF]/50 shadow-[0_0_8px_rgba(0,135,255,0.25)]'
                    : isCentral
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/35 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                    : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/35 border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.25)]'
                }`}
                title={`Click to inspect ${ch.channel} (${ch.lobe})`}
              >
                {ch.channel}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CORE NAVIGATION TABS                                                   */}
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
          
          {/* Section A: Interactive Hotspot Neurological Brain with Image Previews */}
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
                  Click any glowing hotspot pin on the brain to load its specific high-resolution visual and channel diagnostics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#087CFF]/15 border border-[#20BFE8]/30 text-cyan-300">
                  5 Key Pathological Loci
                </span>
              </div>
            </div>

            {/* Hotspot Layout: Brain Visual on Left + Active Visual Telemetry Card on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Stylized Brain Diagram with Hotspot Pins */}
              <div className="lg:col-span-6 relative flex items-center justify-center p-6 rounded-2xl bg-[#010410]/90 border border-[#20BFE8]/30 shadow-inner min-h-[380px]">
                
                {/* Center Brain Visual */}
                <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                  <img
                    src="/images/brain_rotating_clean.mp4.jpg"
                    alt="Neurological Brain Map"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(32,191,232,0.4)] opacity-90 rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.src = '/images/neural_synapse_bg.png';
                    }}
                  />

                  {/* Hotspot Pins Overlaid on the Brain */}
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
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: spot.color }}
                        />
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform"
                          style={{
                            backgroundColor: spot.color,
                            boxShadow: `0 0 16px ${spot.color}`,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>

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

              {/* Right Column: Active Hotspot Deep Diagnostic Telemetry Card with IMAGE */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/40 space-y-4 shadow-[0_0_25px_rgba(32,191,232,0.15)]">
                  
                  {/* Top: Dedicated Clinical Image for this Hotspot */}
                  <div className="relative rounded-xl overflow-hidden border border-[#20BFE8]/40 shadow-lg group">
                    <img
                      src={selectedHotspot.image}
                      alt={selectedHotspot.name}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-white font-bold bg-[#00081c]/80 px-2.5 py-1 rounded-md border border-[#20BFE8]/40 backdrop-blur-md">
                        {selectedHotspot.imageCaption}
                      </span>
                    </div>
                  </div>

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

                  {/* Impacted EEG Channels Clickable Buttons */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      IMPACTED 10-20 CHANNELS (CLICK TO INSPECT):
                    </span>
                    <div className="flex flex-wrap gap-2 font-mono text-xs">
                      {selectedHotspot.channels.map((ch) => (
                        <button
                          key={ch}
                          onClick={() => handleInspectChannel(ch)}
                          className="px-2.5 py-1 rounded-md bg-[#20BFE8]/15 border border-[#20BFE8]/40 text-[#79DFFF] font-bold hover:bg-[#20BFE8] hover:text-black transition-all cursor-pointer"
                        >
                          {ch} →
                        </button>
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

                  {/* Prescribed Recovery */}
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

          {/* Section B: All 19 Channels Clinical Dysregulation Grid with Interactive Visual Triggers */}
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/25 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-[#20BFE8] font-bold uppercase tracking-wider">
                  ELECTRODE ANATOMICAL BREAKDOWN
                </span>
                <h3 className="text-xl font-bold font-heading text-white mt-0.5">
                  19-Channel ADHD Pathological Spectrum
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Click any card to launch the interactive live signal simulator and clinical rehabilitation modal
                </p>
              </div>

              <span className="text-xs font-mono text-cyan-300">
                Tip: Click any lead to inspect live waves
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(ALL_19_CHANNELS_DATA).map((chKey) => {
                const spec = ALL_19_CHANNELS_DATA[chKey];
                return (
                  <div
                    key={spec.channel}
                    onClick={() => handleInspectChannel(spec.channel)}
                    className="p-5 rounded-2xl bg-[#040e22]/80 border border-[#20BFE8]/25 space-y-3 hover:border-[#20BFE8]/80 hover:bg-[#071633] transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#20BFE8]/20 border border-[#20BFE8] flex items-center justify-center font-mono font-black text-sm text-[#79DFFF] group-hover:scale-105 transition-transform">
                          {spec.channel}
                        </div>
                        <span className="text-[11px] font-mono font-bold text-white">
                          {spec.lobe}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {spec.band}
                      </span>
                    </div>

                    {/* Mini Waveform Graphic */}
                    <div className="h-7 w-full flex items-center px-1 bg-slate-950/60 rounded-md border border-slate-800/80">
                      <svg className="w-full h-full text-cyan-400 opacity-80 group-hover:opacity-100" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path
                          d="M 0 10 Q 10 2, 20 10 T 40 10 T 60 10 T 80 10 L 100 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">IMPACT:</span>
                        <span className="text-amber-400 font-bold">{spec.adhdEffect}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">SYMPTOM IN PERSON:</span>
                        <p className="text-slate-300 text-[11px] font-sans leading-relaxed line-clamp-2">
                          {spec.symptomExperience}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#79DFFF] group-hover:text-white">
                        <span>Click for Image & Deep Dive</span>
                        <ChevronRight className="w-4 h-4 text-[#20BFE8] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADHD VS. HEALTHY CONTROL COMPARATIVE MATRIX (With Generated Image) */}
      {/* ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          
          {/* Featured Side-by-Side Comparison Image (Direct from Prompt) */}
          <AuraTiltCard
            maxTilt={8}
            scale={1.01}
            className="p-6 md:p-8 rounded-3xl glass-panel border border-[#20BFE8]/40 space-y-5 bg-gradient-to-b from-[#030a1c]/95 to-[#020512]/95 shadow-[0_0_40px_rgba(32,191,232,0.2)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20BFE8]/20 pb-4">
              <div>
                <span className="text-xs font-mono text-[#20BFE8] font-bold uppercase tracking-wider">
                  CLINICAL SCIENTIFIC NEURAL VISUALIZATION
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
                  Comparative Neural Dynamics: ADHD Brain vs. Control Brain
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Direct fMRI / EEG neuro-spectral activation contrast demonstrating slow theta excess versus structured prefrontal beta focus
                </p>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#087CFF]/20 text-[#79DFFF] border border-[#20BFE8]/40">
                IEEE & Mendeley Calibrated
              </span>
            </div>

            {/* The High-Resolution Side-by-Side Brain Comparison Image */}
            <div className="relative rounded-2xl overflow-hidden border border-[#20BFE8]/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] group bg-black">
              <img
                src="/images/adhd_vs_control_contrast.jpg"
                alt="ADHD Brain vs Control Brain Comparison"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>
          </AuraTiltCard>

          {/* Detailed Side-by-Side Architectural Comparison Cards */}
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
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BRAIN REST & RECOVERY PROTOCOLS (With Images in Each Box!)         */}
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

            {/* 4 Pillars of Brain Rest Cards WITH IMAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pillar 1: Circadian Slow-Wave Sleep (WITH IMAGE) */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-4 shadow-lg group">
                <div className="relative rounded-xl overflow-hidden border border-[#20BFE8]/40 shadow-md">
                  <img
                    src="/images/deep_sleep_brain_rest.jpg"
                    alt="Deep Sleep Brain Rest"
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-mono text-cyan-300 bg-[#00081c]/80 px-2 py-0.5 rounded border border-[#20BFE8]/30 backdrop-blur-md">
                    Glymphatic Clearance Active (N3 Sleep)
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Moon className="w-4 h-4 text-[#20BFE8]" />
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
                </div>
              </div>

              {/* Pillar 2: Non-Sleep Deep Rest (NSDR) (WITH IMAGE) */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-4 shadow-lg group">
                <div className="relative rounded-xl overflow-hidden border border-[#20BFE8]/40 shadow-md">
                  <img
                    src="/images/neurofeedback_smr_training.jpg"
                    alt="Neurofeedback SMR Session"
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-mono text-emerald-300 bg-[#00081c]/80 px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-md">
                    SMR 12-15 Hz Neurofeedback Rest Session
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-white">2. Non-Sleep Deep Rest (NSDR) / SMR</h4>
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
                    <span>Elevates striatal dopamine reserves by up to 65%</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Ultradian Pacing */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-4 shadow-lg group">
                <div className="relative rounded-xl overflow-hidden border border-[#20BFE8]/40 shadow-md">
                  <img
                    src="/images/prefrontal_dopamine_adhd.jpg"
                    alt="Prefrontal Glycogen Pacing"
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-mono text-amber-300 bg-[#00081c]/80 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-md">
                    Prefrontal Glycogen Cycle (25/5 min)
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4 text-amber-400" />
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
                    <span>5 minutes physical movement (no social media or screens)</span>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Nature Immersion */}
              <div className="p-6 rounded-2xl bg-[#061226]/90 border border-[#20BFE8]/30 space-y-4 shadow-lg group">
                <div className="relative rounded-xl overflow-hidden border border-[#20BFE8]/40 shadow-md">
                  <img
                    src="/images/eeg_scalp_electrodes_3d.png"
                    alt="Soft Fascination Topography"
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-mono text-violet-300 bg-[#00081c]/80 px-2 py-0.5 rounded border border-violet-500/30 backdrop-blur-md">
                    Involuntary Soft Fascination Alpha Reset
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-[#20BFE8]/20 pb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-400">
                    <Sparkles className="w-4 h-4 text-violet-400" />
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
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SLEEP QUALITY, BRAIN WORKOUT & CLINICAL CARE                       */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Sleep Quality Weekly Chart & Brain Workout Routine */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Sleep Quality Weekly Bar Chart */}
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
                    <div className="absolute top-[28%] left-0 right-0 border-b border-dashed border-[#20BFE8]/40 flex items-center justify-end pr-2">
                      <span className="text-[10px] font-mono text-[#79DFFF] bg-[#00081c] px-2 rounded">
                        Goal: 8.5h
                      </span>
                    </div>

                    {sleepDays.map((d) => {
                      const heightPercent = (d.hours / 10) * 100;
                      return (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-mono text-cyan-300 opacity-80 group-hover:opacity-100 font-bold">
                            {d.hours}h
                          </span>
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

              {/* Brain Workout Routine */}
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

            {/* Right 5 Cols: Clinical Care, Specialist & Prescriptions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Doctor / Specialist Card */}
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

              {/* Patient Symptom Tracking Log */}
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

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CHANNEL SPOTLIGHT MODAL (Triggered by Any Channel Button)   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeChannelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl rounded-3xl bg-[#03091c] border border-[#20BFE8]/50 shadow-[0_0_50px_rgba(32,191,232,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Top Navigation Bar */}
              <div className="p-5 flex items-center justify-between border-b border-[#20BFE8]/25 bg-[#020614]/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#20BFE8] text-black font-mono font-black text-lg flex items-center justify-center shadow-[0_0_15px_#20BFE8]">
                    {activeChannelModal.channel}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                      <span>{activeChannelModal.lobe}</span>
                      <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#087CFF]/20 text-[#79DFFF] border border-[#20BFE8]/40">
                        {activeChannelModal.band}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Standard 10-20 Scalp Sensor Placement • Microvolt Telemetry & Clinical Recovery
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => neuroAudio.playSynapseBlip(activeChannelModal.audioFreq)}
                    className="p-2 rounded-xl bg-[#087CFF]/20 border border-[#20BFE8]/40 text-[#79DFFF] hover:bg-[#20BFE8] hover:text-black transition-all cursor-pointer"
                    title="Play Channel Neural Tone"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveChannelModal(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* 1. Image & Dynamic Wave Simulator Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Left: Circuit Visual Representation */}
                  <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-[#20BFE8]/40 shadow-lg group bg-black">
                    <img
                      src={activeChannelModal.image}
                      alt={activeChannelModal.channel}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00081c] via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-cyan-300 border border-[#20BFE8]/30">
                      Electrode Location: {activeChannelModal.channel}
                    </span>
                  </div>

                  {/* Right: Live Simulated Signal Oscillator */}
                  <div className="md:col-span-7 p-4 rounded-2xl bg-[#020714] border border-[#20BFE8]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        LIVE BIO-ELECTRICAL OSCILLATION
                      </span>
                      {/* Interactive ADHD vs Restored Toggle */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono">
                        <button
                          onClick={() => setChannelNormMode('adhd')}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            channelNormMode === 'adhd'
                              ? 'bg-orange-500 text-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ADHD Wave
                        </button>
                        <button
                          onClick={() => setChannelNormMode('restored')}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            channelNormMode === 'restored'
                              ? 'bg-emerald-400 text-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Restored Wave
                        </button>
                      </div>
                    </div>

                    {/* Animated Wave SVG */}
                    <div className="h-16 w-full flex items-center justify-center bg-slate-950 rounded-xl px-2 border border-slate-800/80 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                        {channelNormMode === 'adhd' ? (
                          // Large amplitude, erratic slow theta wave
                          <motion.path
                            animate={{ x: [-20, 0] }}
                            transition={{ repeat: Infinity, duration: 1.0, ease: 'linear' }}
                            d="M 0 20 Q 25 -10, 50 20 T 100 20 T 150 20 T 200 20 T 250 20"
                            fill="none"
                            stroke="#F97316"
                            strokeWidth="2.5"
                          />
                        ) : (
                          // Tight, rhythmic, coherent beta / alpha wave
                          <motion.path
                            animate={{ x: [-20, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                            d="M 0 20 Q 10 5, 20 20 T 40 20 T 60 20 T 80 20 T 100 20 T 120 20 T 140 20 T 160 20 T 180 20 T 200 20 T 220 20"
                            fill="none"
                            stroke="#20BFE8"
                            strokeWidth="2"
                          />
                        )}
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>
                        {channelNormMode === 'adhd' ? (
                          <strong className="text-orange-400 font-bold">Theta Perturbation: 4.8 Hz (+38 μV)</strong>
                        ) : (
                          <strong className="text-emerald-400 font-bold">Coherent Rhythm: 14.2 Hz (18 μV)</strong>
                        )}
                      </span>
                      <span>128 Hz Standard Sampling</span>
                    </div>
                  </div>

                </div>

                {/* 2. Deep Neuro-Pathological Clinical Details */}
                <div className="space-y-3 font-mono text-xs">
                  
                  {/* How it affects the person in daily life */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>HOW THIS CHANNEL AFFECTS THE PERSON IN DAILY LIFE:</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed pl-6">
                      {activeChannelModal.symptomExperience}
                    </p>
                  </div>

                  {/* Biological Neuro-Mechanism */}
                  <div className="p-4 rounded-2xl bg-[#087CFF]/15 border border-[#20BFE8]/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <Brain className="w-4 h-4 text-[#20BFE8]" />
                      <span>UNDERLYING BIOLOGICAL & ELECTRO-PHYSIOLOGICAL CAUSE:</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed pl-6">
                      {activeChannelModal.biologicalMechanism}
                    </p>
                  </div>

                  {/* Prescribed Rest & Recovery Exercise */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PRESCRIBED BRAIN REST & REHABILITATION EXERCISE:</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed pl-6 font-bold">
                      {activeChannelModal.restGuideline}
                    </p>
                  </div>

                </div>

              </div>

              {/* Modal Bottom Action Footer */}
              <div className="p-4 border-t border-[#20BFE8]/20 bg-[#020614]/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Channel {activeChannelModal.channel} Calibrated against 10-20 Standard Montage
                </span>
                <button
                  onClick={() => setActiveChannelModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#20BFE8] text-black font-mono font-bold text-xs shadow-[0_0_15px_#20BFE8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Close & Return
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default BrainRecoveryPage;
