import React, { useRef, useState } from 'react';
import { UploadCloud, FileCode, Sparkles, FolderArchive, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (sampleType: 'single_csv' | 'multi_mat' | 'zip_archive') => void;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  onLoadSample,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    '.mat', '.csv', '.tsv', '.npy', '.npz', '.edf', '.bdf', '.gdf', '.fif', '.set', '.zip'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(selected);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone with Animated Orbital Ring & Glowing Border */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-3xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden border-2 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_50px_rgba(0,229,255,0.4)] scale-[1.01]'
            : 'border-cyan-500/30 hover:border-cyan-400/70 bg-slate-900/40 hover:bg-slate-900/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".mat,.csv,.tsv,.npy,.npz,.edf,.bdf,.gdf,.fif,.set,.zip"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Dynamic Animated Perimeter Glow */}
        <div className="absolute inset-0 pointer-events-none radial-glow-cyan opacity-40 animate-pulse" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* Animated Upload Icon with Revolving Orbital Satellite Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Orbital Ring 1 */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-spin" style={{ animationDuration: '14s' }}>
              <span className="absolute -top-1.5 left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00E5FF]" />
            </div>

            {/* Inner Orbital Ring 2 (counter-rotating) */}
            <div className="absolute inset-2 rounded-full border border-violet-500/40 border-dotted animate-spin" style={{ animationDuration: '9s', animationDirection: 'reverse' }}>
              <span className="absolute -bottom-1.5 left-1/2 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_10px_#8B5CF6]" />
              <span className="absolute top-1/2 -right-1 w-2 h-2 -translate-y-1/2 rounded-full bg-pink-400 shadow-[0_0_8px_#F472D0]" />
            </div>

            {/* Core Icon Capsule */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-violet-600/25 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.35)] group-hover:scale-105 transition-transform backdrop-blur-md">
              <UploadCloud className="w-8 h-8 text-cyan-300 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold font-heading text-white">
              Start a New EEG Analysis
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto font-sans">
              Drag and drop an EEG recording or click to browse standard multi-channel files.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              type="button"
              variant="glow-cyan"
              size="md"
              leftIcon={<FileCode className="w-4 h-4" />}
            >
              Choose EEG Files
            </Button>
          </div>

          {/* Supported Format Tags */}
          <div className="pt-4 border-t border-slate-800/80 max-w-lg w-full">
            <span className="text-[11px] font-mono text-slate-500 block mb-2 uppercase tracking-wider">
              Accepted Formats (10-20 Standard & ZIP Cohort Archives)
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {supportedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-cyan-300/90 shadow-sm"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Load Benchmark Demo Recordings */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-heading">
              Test with Real EEG Fixture Datasets
            </h4>
            <p className="text-[11px] text-slate-400">
              Load built-in clinical research files instantly to evaluate pipeline inference
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onLoadSample('single_csv')}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <span>v1p.csv (ADHD)</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('multi_mat')}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Cohort (2 files)</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('zip_archive')}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition-all flex items-center gap-1.5"
          >
            <FolderArchive className="w-3 h-3" />
            <span>Multi-Record ZIP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
