import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  FolderArchive,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { validateEEG, predictEEG, ApiError } from '../services/api';
import { saveLatestBatch, addToHistory, saveSelectedFileResult } from '../services/storage';

import { ValidationReport, FilePredictionResult } from '../types';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { FileList } from '../components/upload/FileList';
import { ValidationModal } from '../components/upload/ValidationModal';
import { CinematicLoadingOverlay } from '../components/upload/CinematicLoadingOverlay';
import { Button } from '../components/ui/Button';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [samplingRateOverride, setSamplingRateOverride] = useState<string>('');
  const [validationReports, setValidationReports] = useState<ValidationReport[] | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    setValidationReports(null);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setValidationReports(null);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setValidationReports(null);
    setErrorMessage(null);
  };

  // Helper to generate realistic sample files in-memory for testing
  const handleLoadSample = (sampleType: 'single_csv' | 'multi_mat' | 'zip_archive') => {
    setErrorMessage(null);
    setValidationReports(null);

    if (sampleType === 'single_csv') {
      // 19 channels, 1280 rows (10s at 128 Hz)
      const channels = ['Fp1','Fp2','F7','F3','Fz','F4','F8','T3','C3','Cz','C4','T4','T5','P3','Pz','P4','T6','O1','O2'];
      let csvContent = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        const row = channels.map((_, chIdx) => {
          const val = Math.sin(i * 0.1 + chIdx) * 15 + (Math.random() - 0.5) * 5;
          return val.toFixed(3);
        });
        csvContent += row.join(',') + '\n';
      }
      const file = new File([csvContent], 'v1p_sample.csv', { type: 'text/csv' });
      setSelectedFiles([file]);
    } else if (sampleType === 'multi_mat') {
      // Create two sample files
      const channels = ['Fp1','Fp2','F7','F3','Fz','F4','F8','T3','C3','Cz','C4','T4','T5','P3','Pz','P4','T6','O1','O2'];
      let csv1 = channels.join(',') + '\n';
      let csv2 = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        csv1 += channels.map((_, c) => (Math.sin(i * 0.12 + c) * 12).toFixed(3)).join(',') + '\n';
        csv2 += channels.map((_, c) => (Math.cos(i * 0.08 + c) * 14).toFixed(3)).join(',') + '\n';
      }
      const file1 = new File([csv1], 'Subject_01_ADHD.csv', { type: 'text/csv' });
      const file2 = new File([csv2], 'Subject_02_Control.csv', { type: 'text/csv' });
      setSelectedFiles([file1, file2]);
    } else if (sampleType === 'zip_archive') {
      // For ZIP, inform the user or allow uploading tests/fixtures/dataset.zip
      // Provide a clear helper message
      const channels = ['Fp1','Fp2','F7','F3','Fz','F4','F8','T3','C3','Cz','C4','T4','T5','P3','Pz','P4','T6','O1','O2'];
      let csv = channels.join(',') + '\n';
      for (let i = 0; i < 1280; i++) {
        csv += channels.map(() => (Math.random() * 20 - 10).toFixed(3)).join(',') + '\n';
      }
      const file = new File([csv], 'benchmark_recording.csv', { type: 'text/csv' });
      setSelectedFiles([file]);
    }
  };

  // Run Pre-validation (POST /api/validate)
  const handleValidate = async () => {
    if (selectedFiles.length === 0) return;
    setIsValidating(true);
    setErrorMessage(null);

    const fsVal = samplingRateOverride.trim() ? parseFloat(samplingRateOverride) : undefined;

    try {
      const reports = await validateEEG(selectedFiles, fsVal);
      setValidationReports(reports);
      setIsValidationModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation failed. Ensure backend is running.');
    } finally {
      setIsValidating(false);
    }
  };

  // Run Full Prediction (POST /api/predict)
  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    const fsVal = samplingRateOverride.trim() ? parseFloat(samplingRateOverride) : undefined;

    try {
      const batchResponse = await predictEEG(selectedFiles, fsVal);

      // Save to session storage
      saveLatestBatch(batchResponse);

      // Save each successful file into analysis history
      batchResponse.results.forEach((res: FilePredictionResult) => {
        if (res.status === 'success') {
          addToHistory(res, batchResponse.batch_type);
        }
      });

      // Navigate to appropriate results page
      if (batchResponse.batch_type === 'single_file') {
        if (batchResponse.results && batchResponse.results.length > 0) {
          saveSelectedFileResult(batchResponse.results[0]);
        }
        navigate('/dashboard/results');
      } else {
        navigate('/dashboard/batch');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Analysis failed. Ensure FastAPI backend is running and model weights are accessible.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
          New EEG Recording Analysis
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
          Upload single files, multi-file cohorts, or ZIP archives for pre-inference validation and ensemble classification.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Pipeline Error:</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Drop Zone */}
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        onLoadSample={handleLoadSample}
        disabled={isAnalyzing || isValidating}
      />

      {/* Selected Files List */}
      <FileList
        files={selectedFiles}
        validationReports={validationReports}
        onRemoveFile={handleRemoveFile}
        onClearAll={handleClearAll}
        disabled={isAnalyzing || isValidating}
      />

      {/* Options & Action Controls Bar */}
      {selectedFiles.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Optional Sampling Rate Override */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sampling Rate Override (Optional, Hz)</span>
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                step="1"
                placeholder="Auto-detect from file header"
                value={samplingRateOverride}
                onChange={(e) => setSamplingRateOverride(e.target.value)}
                disabled={isAnalyzing || isValidating}
                className="w-64 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[10px] text-slate-500 font-mono block">
                Leave blank to allow the universal parser to extract sampling rate automatically.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleValidate}
                isLoading={isValidating}
                disabled={isAnalyzing}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              >
                Validate Recording
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={isValidating}
                leftIcon={<Play className="w-4 h-4" />}
                className="shadow-[0_0_25px_rgba(0,229,255,0.35)]"
              >
                Analyze EEG (Ensemble)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal Report */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        reports={validationReports}
        onProceedToAnalyze={() => {
          setIsValidationModalOpen(false);
          handleAnalyze();
        }}
      />

      {/* 5-Stage Cinematic Analysis Loading Overlay */}
      <CinematicLoadingOverlay
        isAnalyzing={isAnalyzing}
        filename={selectedFiles[0]?.name || 'Recording.eeg'}
        onCancel={() => setIsAnalyzing(false)}
      />
    </div>
  );
};
