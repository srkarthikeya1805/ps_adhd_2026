import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sliders,
  Cpu,
  Layers,
  BookOpen,
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, getHealth, getRootInfo } from '../services/api';
import { BackendRootInfo, HealthResponse } from '../types';
import { BENCHMARK_DATASETS } from '../utils/sampleData';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [rootInfo, setRootInfo] = useState<BackendRootInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiUrl(getApiBaseUrl());
    testConnection();
  }, []);

  const testConnection = () => {
    setIsTesting(true);
    setSaveSuccess(false);
    Promise.all([
      getHealth().catch(() => null),
      getRootInfo().catch(() => null),
    ]).then(([h, r]) => {
      setHealth(h);
      setRootInfo(r);
      setIsTesting(false);
    });
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setSaveSuccess(true);
    testConnection();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    setApiBaseUrl('');
    setApiUrl(getApiBaseUrl());
    testConnection();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-widest text-[11px]">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Environment</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mt-1">
          Settings & Backend Configuration
        </h2>
        <p className="text-slate-400 font-sans text-xs mt-1">
          Manage FastAPI connection endpoints, verify neural device execution, and review system specifications.
        </p>
      </div>

      {/* Backend API URL Configuration Form */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-white">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>FastAPI Server Endpoint</span>
          </div>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Reset to Default (http://127.0.0.1:8000)
          </button>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 text-xs"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Endpoint
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={testConnection}
              isLoading={isTesting}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Test Connection
            </Button>
          </div>

          {saveSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Endpoint updated successfully!
            </span>
          )}

          <p className="text-[11px] text-slate-500 font-sans">
            Controlled by <code>VITE_API_BASE_URL</code> environment variable with localStorage override capability.
          </p>
        </form>
      </div>

      {/* Live Server Diagnostics Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-violet-400" />
          <span>Live Backend Diagnostics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">HEALTH PROBE</span>
            <span className="flex items-center gap-1.5 font-bold text-sm">
              {health ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                  <span className="text-emerald-400">GET /api/health OK</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-400">Disconnected</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">INFERENCE ACCELERATOR</span>
            <span className="text-cyan-400 font-bold text-sm">
              {health?.device || rootInfo?.model?.device || 'CPU'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">SERVICE VERSION</span>
            <span className="text-white font-bold text-sm">
              {health?.version || rootInfo?.version || 'v3.0.0'}
            </span>
          </div>
        </div>

        {rootInfo && (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block mb-1">Supported File Extensions:</span>
              <div className="flex flex-wrap gap-1.5">
                {rootInfo.supported_formats.map((fmt: string) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Endpoints Discovered:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                {Object.entries(rootInfo.endpoints).map(([key, route]) => (
                  <div key={key} className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500">{key}:</span> <strong className="text-cyan-300">{String(route)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* College Project & Research Citations */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-400" />
          <span>Project Information & Research Citations</span>
        </h3>

        <div className="space-y-3 text-slate-400 font-sans text-xs leading-relaxed">
          <p>
            <strong className="text-white font-heading">Project Title:</strong> The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG.
          </p>
          <p>
            <strong className="text-white font-heading">Ensemble Architecture:</strong> 1D Convolutional Neural Network with Multi-Head Temporal Self-Attention (50%), Depthwise Separable EEGNet (25%), and Welch Power Spectral Density with Gradient Boosted Trees (25%).
          </p>
          <div className="pt-2 border-t border-slate-800 font-mono text-[11px] space-y-1">
            <span className="text-slate-300 block">Evaluated Datasets:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>IEEE DataPort Nasrabadi et al. (121 children, 19 channels, 128 Hz)</li>
              <li>Mendeley Data Bajestani et al. (79 adults, topographic projection)</li>
              <li>RepOD Nature Scientific Data Prucnal et al. (16 adults, 144 files)</li>
              <li>Figshare Multi-Channel Continuous Split Archive (56 channels)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
