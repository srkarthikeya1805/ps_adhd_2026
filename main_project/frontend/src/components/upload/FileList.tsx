import React from 'react';
import { File, Trash2, CheckCircle2, AlertTriangle, FileArchive, XCircle } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { ValidationReport } from '../../types';

interface FileListProps {
  files: File[];
  validationReports?: ValidationReport[] | null;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  validationReports,
  onRemoveFile,
  onClearAll,
  disabled = false,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-heading text-white">Selected Recordings</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        <button
          onClick={onClearAll}
          disabled={disabled}
          className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
        >
          Clear Selection
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {files.map((file, idx) => {
          const isZip = file.name.toLowerCase().endsWith('.zip');
          const ext = file.name.split('.').pop()?.toUpperCase() || 'EEG';

          // Match validation report if available
          const valReport = validationReports?.find(
            (r) => r.file === file.name || r.file.endsWith(file.name)
          );

          return (
            <div
              key={`${file.name}_${idx}`}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono group hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {isZip ? (
                    <FileArchive className="w-4 h-4 text-amber-400" />
                  ) : (
                    <File className="w-4 h-4 text-cyan-400" />
                  )}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 truncate">{file.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                      {ext}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Validation Status & Remove */}
              <div className="flex items-center gap-3 shrink-0">
                {valReport && (
                  <div>
                    {valReport.valid && valReport.model_compatible ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid ({valReport.duration_seconds}s)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Invalid</span>
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => onRemoveFile(idx)}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
