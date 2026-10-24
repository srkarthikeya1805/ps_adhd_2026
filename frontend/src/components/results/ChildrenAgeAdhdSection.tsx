import React, { useState } from 'react';
import {
  Baby,
  GraduationCap,
  Sparkles,
  Users,
  Activity,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Clock,
  Layers,
} from 'lucide-react';
import childrenAgeImg from '../../assets/adhd_children_age_development.jpg';

interface AgeMilestone {
  id: 'early' | 'school' | 'adolescent' | 'adult';
  title: string;
  ageRange: string;
  icon: any;
  primaryPresentation: string;
  normalTbrRange: string;
  adhdTbrRange: string;
  neurodevelopmentalHallmarks: string[];
  eegCharacteristics: string[];
  parentGuidance: string;
}

interface ChildrenAgeAdhdSectionProps {
  isADHD: boolean;
  patientCalculatedTbr?: number;
}

export const ChildrenAgeAdhdSection: React.FC<ChildrenAgeAdhdSectionProps> = ({
  isADHD,
  patientCalculatedTbr = 3.84,
}) => {
  const [selectedAge, setSelectedAge] = useState<'early' | 'school' | 'adolescent' | 'adult'>('school');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const milestones: AgeMilestone[] = [
    {
      id: 'early',
      title: 'Early Childhood',
      ageRange: 'Ages 4 – 7 Years',
      icon: Baby,
      primaryPresentation: 'Hyperactive / Impulsive Dominant',
      normalTbrRange: '3.2 – 4.2',
      adhdTbrRange: '5.2 – 7.0+',
      neurodevelopmentalHallmarks: [
        'Emergent frontal cortex synaptic pruning and unmyelinated prefrontal pathways.',
        'Sensorimotor cortex high excitability leading to persistent gross motor fidgeting.',
        'Immature dopamine transporter (DAT1) regulation causing rapid stimulus habituation.',
      ],
      eegCharacteristics: [
        'Naturally higher slow-wave amplitude (Delta & Theta) due to incomplete cortical thinning.',
        'In ADHD, Frontal Theta power exceeds normative developmental thresholds by >60%.',
        'Marked sensorimotor rhythm (SMR 12-15 Hz) suppression during sustained seated tasks.',
      ],
      parentGuidance:
        'Focus on structured daily routines, active physical movement breaks, positive behavioral reinforcement, and pediatric developmental screening before formal academic entry.',
    },
    {
      id: 'school',
      title: 'School-Age Children',
      ageRange: 'Ages 8 – 12 Years',
      icon: GraduationCap,
      primaryPresentation: 'Combined (Inattentive & Hyperactive)',
      normalTbrRange: '1.8 – 2.4',
      adhdTbrRange: '3.2 – 5.0',
      neurodevelopmentalHallmarks: [
        'Prefrontal cortex maturation delay of approximately 3 years behind neurotypical peers.',
        'Fronto-striatal functional connectivity deficits impacting working memory maintenance.',
        'Decreased striatal dopamine D1/D2 receptor density causing executive fatigue in low-salience tasks.',
      ],
      eegCharacteristics: [
        'Gold-standard FDA NEBA biomarker window: Theta/Beta ratio elevation highly specific.',
        'Frontal slow-wave bursts during academic task transition and reading comprehension.',
        'Occipital alpha wave desynchronization indicating sensory filtering vulnerability.',
      ],
      parentGuidance:
        'Individualized Education Plans (IEP), classroom visual accommodations, chunked academic tasks, sleep hygiene optimization, and multimodal clinical consultation.',
    },
    {
      id: 'adolescent',
      title: 'Adolescence',
      ageRange: 'Ages 13 – 17 Years',
      icon: Users,
      primaryPresentation: 'Predominantly Inattentive / Internal Restlessness',
      normalTbrRange: '1.4 – 1.9',
      adhdTbrRange: '2.6 – 3.8',
      neurodevelopmentalHallmarks: [
        'Hormonal remodeling and delayed dorsolateral prefrontal cortex synaptic refinement.',
        'Internalized restlessness replacing overt gross motor hyperactivity.',
        'Limbic-prefrontal disconnect causing emotional dysregulation and delayed sleep phase syndrome.',
      ],
      eegCharacteristics: [
        'Persistent frontal theta elevation despite pubertal cortical thinning.',
        'Delayed sleep phase EEG signatures (altered circadian spindles and delta power).',
        'Executive beta-wave deficiency during unstructured independent study.',
      ],
      parentGuidance:
        'Support executive function coaching, digital device boundaries before sleep, collaborative autonomy, and adolescent-focused behavioral therapy.',
    },
    {
      id: 'adult',
      title: 'Young Adults & Adults',
      ageRange: 'Ages 18+ Years',
      icon: Activity,
      primaryPresentation: 'Executive Dysfunction & Time Blindness',
      normalTbrRange: '1.1 – 1.6',
      adhdTbrRange: '2.0 – 3.2',
      neurodevelopmentalHallmarks: [
        'Persistent fronto-parietal and default mode network (DMN) hyper-connectivity during cognitive load.',
        'Compensatory behavioral strategies masking underlying working memory deficits.',
        'Dopaminergic and noradrenergic chronic hypo-arousal in executive networks.',
      ],
      eegCharacteristics: [
        'Elevated Theta/Beta ratio persists into adulthood in ~65% of persistent ADHD cases.',
        'Frontal midline theta dysregulation and diminished P300 event-related potential amplitude.',
        'Reduced sensory gating efficiency in posterior and central electrodes.',
      ],
      parentGuidance:
        'Externalized organizational systems, cognitive behavioral therapy (CBT), occupational accommodation, and regular sleep architecture tracking.',
    },
  ];

  const current = milestones.find((m) => m.id === selectedAge) || milestones[1];

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Baby className="w-3.5 h-3.5" />
            <span>Pediatric & Developmental Neuroscience</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white mt-0.5">
            ADHD Manifestations & EEG Markers Across Children’s Age Milestones
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Neurodevelopmental delays, synaptic pruning timelines, and age-adjusted Theta/Beta Ratio norms
          </p>
        </div>

        {/* Expandable Image Trigger */}
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
          <span>View Developmental Diagram</span>
        </button>
      </div>

      {/* Image Preview Banner */}
      <div
        onClick={() => setIsImageModalOpen(true)}
        className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-lg"
      >
        <img
          src={childrenAgeImg}
          alt="Neurodevelopmental Tracking in ADHD Across Age Milestones"
          className="w-full h-48 md:h-64 object-cover object-top filter brightness-95 group-hover:brightness-105 group-hover:scale-[1.01] transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4 md:p-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 mb-1 inline-block">
                Clinical Neuroimaging Study
              </span>
              <h4 className="text-sm md:text-base font-bold text-white font-heading">
                Brain Maturation & Dopaminergic Pathway Evolution in ADHD (Ages 4 to 17+)
              </h4>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click to Enlarge</span>
            </span>
          </div>
        </div>
      </div>

      {/* Age Milestone Selector Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {milestones.map((m) => {
          const isSelected = selectedAge === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedAge(m.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900/80 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold font-heading text-white">{m.title}</h5>
                  <span className="text-[10px] font-mono text-cyan-400 block">{m.ageRange}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Milestone Analysis Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Primary Presentation for {current.title}
            </span>
            <h4 className="text-lg md:text-xl font-bold font-heading text-white mt-0.5">
              {current.primaryPresentation}
            </h4>
          </div>

          {/* Age-Specific Theta/Beta Ratio Comparison Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">NORMAL TBR</span>
              <span className="text-emerald-400 font-bold">{current.normalTbrRange}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block">ADHD TBR</span>
              <span className="text-amber-400 font-bold">{current.adhdTbrRange}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block">PATIENT VALUE</span>
              <span className="text-fuchsia-400 font-bold">{patientCalculatedTbr.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Insights: Neurodevelopment vs EEG Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Neurobiology Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Neurodevelopmental Mechanisms</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
              {current.neurodevelopmentalHallmarks.map((item, i) => (
                <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* EEG Characteristics Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-fuchsia-400 flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>EEG Spectral Signatures</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
              {current.eegCharacteristics.map((item, i) => (
                <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinical / Parent Support Recommendation */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 text-xs font-sans space-y-1">
          <span className="text-cyan-400 font-mono font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Age-Appropriate Support & Recommendations:</span>
          </span>
          <p className="text-slate-300 leading-relaxed pl-5">
            {current.parentGuidance}
          </p>
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution Developmental Diagram */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-base font-bold font-heading text-white">
                Neurodevelopmental Tracking: Brain Maturation & EEG Activity Across Age Milestones
              </h4>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl">
              <img
                src={childrenAgeImg}
                alt="Enlarged Neurodevelopmental Chart"
                className="w-full h-auto object-contain"
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 text-center">
              Scientific illustration showing delayed prefrontal pruning, dopamine pathway shifts, and Theta/Beta ratio progression across pediatric cohorts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
