import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Layers, Clock, Activity } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ValidationReport } from '../../types';
import { Button } from '../ui/Button';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ValidationReport[] | null;
  onProceedToAnalyze?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  reports,
  onProceedToAnalyze,
}) => {
  if (!reports || reports.length === 0) return null;

  const allValid = reports.every((r) => r.valid && r.model_compatible);
  const totalCount = reports.length;
  const validCount = reports.filter((r) => r.valid && r.model_compatible).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Signal Validation & Pipeline Compatibility Report"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            allValid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {allValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <div>
              <h4 className="font-heading font-bold text-sm text-white">
                {allValid
                  ? 'All Uploaded Recordings Passed Preprocessing Checks'
                  : `${validCount} of ${totalCount} Recordings Passed Preprocessing Checks`}
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                Validated against 19-channel 10-20 standard montage and 128 Hz model input tensor shape.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed File Reports */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {reports.map((report, idx) => (
            <div
              key={`${report.file}_${idx}`}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm truncate max-w-sm">
                  {report.file}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    report.valid && report.model_compatible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {report.valid && report.model_compatible ? 'MODEL COMPATIBLE' : 'COMPATIBILITY ISSUE'}
                </span>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">FORMAT</span>
                  <span className="text-cyan-400 font-bold uppercase">{report.format}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">SAMPLING RATE</span>
                  <span className="text-white font-bold">
                    {report.sampling_rate ? `${report.sampling_rate} Hz` : 'Auto'} → {report.target_sampling_rate} Hz
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">DURATION</span>
                  <span className="text-white font-bold">
                    {report.duration_seconds !== null && report.duration_seconds !== undefined
                      ? `${report.duration_seconds}s`
                      : '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">WINDOWS (10s)</span>
                  <span className="text-cyan-400 font-bold">
                    {report.windows_count !== null && report.windows_count !== undefined
                      ? report.windows_count
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Signal Shape & Channels */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span>
                  Signal Shape:{' '}
                  <strong className="text-slate-200">
                    {report.signal_shape ? `[${report.signal_shape.join(', ')}]` : 'Determined at parse'}
                  </strong>
                </span>
                <span>
                  19-Channel Montage:{' '}
                  <strong className={report.required_channels_available ? 'text-emerald-400' : 'text-amber-400'}>
                    {report.required_channels_available ? 'Mapped to Standard' : 'Harmonized / Projected'}
                  </strong>
                </span>
              </div>

              {/* Warnings & Issues */}
              {report.warnings && report.warnings.length > 0 && (
                <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Pipeline Warnings:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {report.warnings.map((w, wIdx) => (
                      <li key={wIdx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.issues && report.issues.length > 0 && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Validation Errors:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {report.issues.map((issue, iIdx) => (
                      <li key={iIdx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close Report
          </Button>
          {onProceedToAnalyze && allValid && (
            <Button variant="primary" onClick={onProceedToAnalyze}>
              Proceed with Analysis
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
