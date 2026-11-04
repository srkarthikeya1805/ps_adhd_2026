import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#20BFE8]/15 bg-[#030914]/90 px-6 py-6 text-xs text-[#A5B8CC]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Research Disclaimer */}
        <div className="flex items-start md:items-center gap-2 max-w-2xl text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 md:mt-0" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-300">Academic & Research Prototype:</strong> This platform is designed strictly for scientific evaluation and university demonstration. It provides AI-assisted binary classification of EEG signal features, not a confirmed clinical medical diagnosis.
          </p>
        </div>

        {/* Technical Stack Credit */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 shrink-0">
          <span>FastAPI Backend</span>
          <span>•</span>
          <span>CNN-Transformer + EEGNet + XGBoost</span>
          <span>•</span>
          <span>19-ch 10-20 EEG</span>
        </div>
      </div>
    </footer>
  );
};
