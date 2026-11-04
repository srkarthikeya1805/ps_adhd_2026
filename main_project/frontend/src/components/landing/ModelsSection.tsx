import React from 'react';
import { Cpu, Sparkles, HelpCircle } from 'lucide-react';
import { EnsembleCard } from '../models/EnsembleCard';

export const ModelsSection: React.FC = () => {
  return (
    <section id="models-section" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          Multi-Model Architecture
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">Three AI Models</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
          Heterogeneous deep learning and spectral classifiers. Hover to experience 3D perspective tilt and inspect live neural feature canvas visualizations.
        </p>
      </div>

      {/* Render the 3 interactive model cards with 3D tilt and live canvases */}
      <EnsembleCard weights={{ cnn_transformer: 0.5, eegnet: 0.25, psd_xgboost: 0.25 }} threshold={0.5} />
    </section>
  );
};
