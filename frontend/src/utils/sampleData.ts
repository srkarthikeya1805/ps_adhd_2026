import { BrainRegionInfo } from '../types';

export const BRAIN_REGIONS: BrainRegionInfo[] = [
  {
    key: 'frontal',
    name: 'Frontal Region',
    scientificName: 'Prefrontal & Frontal Cortices',
    color: '#00E5FF', // Electric cyan
    channels: ['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8'],
    functionDescription:
      'Mediates executive function, attentional allocation, impulse inhibition, goal-directed behavior, and working memory.',
    adhdRelevance:
      'Neuroimaging and EEG literature frequently report frontal attentional modulation differences, including elevated fronto-central Theta/Beta ratios (TBR) and reduced beta activation during cognitive load in ADHD cohorts.',
    eegConsideration:
      'Scalp electrodes (Fp1, Fp2, F3, F4, Fz, F7, F8) measure cumulative electrical potentials conducted across cerebrospinal fluid, skull, and scalp tissues; they do not isolate deep subcortical structures directly.',
  },
  {
    key: 'parietal',
    name: 'Parietal Region',
    scientificName: 'Posterior Parietal Cortex',
    color: '#8B5CF6', // Electric violet
    channels: ['P3', 'Pz', 'P4'],
    functionDescription:
      'Coordinates somatosensory integration, visuospatial attention, sensory reorienting, and mental arithmetic processing.',
    adhdRelevance:
      'Altered parietal alpha desynchronization has been observed during spatial orienting and target discrimination tasks in subjects with attention difficulties.',
    eegConsideration:
      'Parietal electrode signals (P3, Pz, P4) capture cortical surface field potentials and parietal alpha rhythms (8–13 Hz), which modulate when visual attention is deployed.',
  },
  {
    key: 'temporal',
    name: 'Temporal Region',
    scientificName: 'Lateral & Inferior Temporal Lobes',
    color: '#478BFF', // Neon blue
    channels: ['T3', 'T4', 'T5', 'T6'],
    functionDescription:
      'Underlies auditory processing, speech comprehension, cross-modal semantic memory, and emotional stimulus evaluation.',
    adhdRelevance:
      'Temporal auditory evoked potentials (e.g., Mismatch Negativity and P300 components) often show latency and amplitude variations related to sensory gating in attention deficits.',
    eegConsideration:
      'Temporal electrodes (T3, T4, T5, T6; harmonized to T7, T8, P7, P8 in extended 10-20 montages) are particularly sensitive to muscle artifacts (temporalis muscle clenching) requiring bandpass and artifact filtering.',
  },
  {
    key: 'occipital',
    name: 'Occipital Region',
    scientificName: 'Primary & Secondary Visual Cortex (V1/V2)',
    color: '#F472D0', // Magenta
    channels: ['O1', 'O2'],
    functionDescription:
      'Primary center for visual feature extraction, motion perception, and visual stimulus encoding.',
    adhdRelevance:
      'Occipital regions produce prominent Posterior Alpha Rhythms (8–12 Hz) during eyes-closed resting states. Suppression failure during visual tasks can signal attentional vigilance drift.',
    eegConsideration:
      'Electrodes O1 and O2 record clean posterior alpha activity. In universal EEG preprocessing, 1.0–45.0 Hz Butterworth bandpass filtering isolates these rhythms while suppressing DC drift.',
  },
];

export const STANDARD_19_CHANNELS = [
  'Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8',
  'T3', 'C3', 'Cz', 'C4', 'T4', 'T5', 'P3',
  'Pz', 'P4', 'T6', 'O1', 'O2'
];

export const FREQUENCY_BANDS = [
  { name: 'Delta', range: '1.0 – 4.0 Hz', description: 'Slow oscillations associated with deep rest and slow-wave sleep.', color: '#3B82F6' },
  { name: 'Theta', range: '4.0 – 8.0 Hz', description: 'Prominent during drowsiness and internal focus; elevated in fronto-central ADHD profiles.', color: '#00E5FF' },
  { name: 'Alpha', range: '8.0 – 13.0 Hz', description: 'Dominant resting-state posterior rhythm reflecting active cortical inhibition and relaxed alertness.', color: '#8B5CF6' },
  { name: 'Beta', range: '13.0 – 30.0 Hz', description: 'Fast cortical activity associated with active cognitive concentration, problem-solving, and alertness.', color: '#39F5C8' },
  { name: 'Gamma', range: '30.0 – 45.0 Hz', description: 'High-frequency synchronization involved in multi-sensory binding and higher-order cortical computation.', color: '#F472D0' },
];

export const BENCHMARK_DATASETS = [
  {
    name: 'IEEE DataPort (Nasrabadi et al., 2020)',
    description: '121 children (ages 7–12; 61 ADHD, 60 Control) performing visual attention counting task.',
    channels: '19 channels',
    samplingRate: '128 Hz',
    context: 'Standard 10-20 montage reference dataset',
  },
  {
    name: 'Mendeley Data (Bajestani & Abedian, 2023)',
    description: '79 adults (37 ADHD, 42 Control) during resting-state and auditory paradigms.',
    channels: '2 channels (projected to 19)',
    samplingRate: '128 / 250 / 256 Hz',
    context: 'Evaluated with symmetrical topographic projection',
  },
  {
    name: 'RepOD / Nature Scientific Data (Prucnal et al., 2024)',
    description: '16 adults across 9 cognitive tasks (Stroop, Flanker, Go/No-Go).',
    channels: '19 channels',
    samplingRate: '500 Hz (downsampled to 128 Hz)',
    context: 'Parsed from MATLAB MCOS tabular structures',
  },
  {
    name: 'Figshare Multi-Channel Continuous Split Archive',
    description: 'High-density multi-channel continuous clinical recordings split across segments.',
    channels: '56 channels (harmonized)',
    samplingRate: '128 / 250 / 256 Hz',
    context: 'Continuous recording split with companion channel montages',
  },
];
