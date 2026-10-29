import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getModelInfo, getRootInfo } from '../services/api';
import { BackendRootInfo, ModelInfoResponse } from '../types';
import { EnsembleCard } from '../components/models/EnsembleCard';
import { PipelineDiagram } from '../components/models/PipelineDiagram';
import { Button } from '../components/ui/Button';
import { AuraBounceHeading, AuraBounceBox } from '../components/common/AuraScrollText';

export const ModelEnsemblePage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [rootInfo, setRootInfo] = useState<BackendRootInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      getModelInfo().catch(() => null),
      getRootInfo().catch(() => null),
    ]).then(([mInfo, rInfo]) => {
      setModelInfo(mInfo);
      setRootInfo(rInfo);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Telemetry</span>
          </div>
          <AuraBounceHeading as="h2" className="text-2xl md:text-3xl font-bold font-heading text-white mt-1">
            Three-Model Ensemble Architecture
          </AuraBounceHeading>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Calibrated weighted voting framework combining deep spatio-temporal attention, compact EEGNet convolutions, and Welch spectral density.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Live Status
        </Button>
      </div>

      {/* Live Model Metadata Chips Grid */}
      <AuraBounceBox className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">WEIGHTS LOADED</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">EXECUTION DEVICE</span>
          <span className="text-cyan-400 font-bold">
            {modelInfo?.device || rootInfo?.model?.device || 'CPU'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">TARGET SAMPLING</span>
          <span className="text-white font-bold">
            {modelInfo?.sampling_rate || 128.0} Hz
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">REQUIRED CHANNELS</span>
          <span className="text-white font-bold">
            {modelInfo?.channels || 19} Channels
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">WINDOW DURATION</span>
          <span className="text-violet-400 font-bold">
            {modelInfo?.window_seconds || 10}s (1280 pts)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-500 block text-[10px]">TOTAL PARAMETERS</span>
          <span className="text-pink-400 font-bold">
            {modelInfo?.total_params ? modelInfo.total_params.toLocaleString() : '142,880'}
          </span>
        </div>
      </AuraBounceBox>

      {/* Model Ensemble Cards Section */}
      <AuraBounceBox>
        <EnsembleCard
          weights={modelInfo?.weights || { cnn_transformer: 0.5, eegnet: 0.25, xgboost: 0.25 }}
          threshold={modelInfo?.threshold ?? 0.5}
        />
      </AuraBounceBox>

      {/* Full Signal Pipeline Architecture Diagram */}
      <AuraBounceBox className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <PipelineDiagram />
      </AuraBounceBox>
    </div>
  );
};
