import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileStack,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Download,
  UploadCloud,
  FileArchive,
  Layers,
  ArrowUpDown,
  Sparkles,
  Radio,
  Activity,
  Cpu,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { getLatestBatch, saveSelectedFileResult } from '../services/storage';
import { BatchPredictionResponse, FilePredictionResult } from '../types';
import { formatProbability, formatProbabilityDecimals } from '../utils/formatters';
import { BatchDonutChart } from '../components/charts/BatchDonutChart';
import { CohortChannelImpactMatrix } from '../components/charts/CohortChannelImpactMatrix';
import { ModelCohortAccuracyBreakdown } from '../components/charts/ModelCohortAccuracyBreakdown';
import { CLINICAL_BENCHMARK_COHORT } from '../utils/benchmarkCohort';
import { Button } from '../components/ui/Button';

export const BatchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedBatch, setUploadedBatch] = useState<BatchPredictionResponse | null>(null);
  const [activeCohortSource, setActiveCohortSource] = useState<'uploaded' | 'benchmark'>('uploaded');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'all' | 'adhd' | 'control' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'filename' | 'probability' | 'status'>('filename');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const latest = getLatestBatch();
    if (latest && latest.results && latest.results.length > 0) {
      setUploadedBatch(latest);
      setActiveCohortSource('uploaded');
    } else {
      // Default immediately to the 20-subject benchmark cohort so user never encounters an empty screen
      setUploadedBatch(null);
      setActiveCohortSource('benchmark');
    }
  }, []);

  // Determine current active batch data
  const currentBatch: BatchPredictionResponse =
    activeCohortSource === 'uploaded' && uploadedBatch
      ? uploadedBatch
      : CLINICAL_BENCHMARK_COHORT;

  const summary = currentBatch.summary;

  const hasGroundTruth = useMemo(() => {
    return currentBatch.results.some((r) => Boolean(r.ground_truth_label));
  }, [currentBatch]);

  // Filter and search logic
  const filteredResults = currentBatch.results
    .filter((r) => {
      // Search
      const matchesSearch = r.filename.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filter
      if (filterClass === 'adhd') return r.prediction === 'ADHD';
      if (filterClass === 'control') return r.prediction === 'Control';
      if (filterClass === 'failed') return r.status === 'failed' || r.status === 'invalid_input';
      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'filename') {
        comp = a.filename.localeCompare(b.filename);
      } else if (sortBy === 'probability') {
        comp = (a.adhd_probability ?? -1) - (b.adhd_probability ?? -1);
      } else if (sortBy === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return sortAsc ? comp : -comp;
    });

  const handleRowClick = (item: FilePredictionResult) => {
    if (item.status === 'success') {
      saveSelectedFileResult(item);
      navigate('/dashboard/results');
    }
  };

  const handleExportBatchJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(currentBatch, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${currentBatch.archive_name || 'cohort'}_analysis_report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header & Cohort Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <FileArchive className="w-4 h-4 animate-pulse" />
            <span>Multi-Subject Cohort Telemetry</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold font-heading text-white mt-1">
            Batch EEG Analysis & Cohort Diagnostics
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs font-bold">
            <span className="text-slate-400">Archive Source:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              {currentBatch.archive_name || 'Multi-File Upload Dataset'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              {activeCohortSource === 'uploaded'
                ? 'Active User Uploaded Archive'
                : 'ADHD-200 / IEEE Clinical Benchmark Cohort (20 Subjects)'}
            </span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Cohort Indicator */}
          {uploadedBatch ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Active Uploaded Dataset ({uploadedBatch.results.length} Files)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-xs font-mono font-bold text-violet-300">
              <span>Standard Evaluation Dataset (20 Subjects)</span>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportBatchJson}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export JSON
          </Button>

          <Link to="/dashboard/upload">
            <Button
              variant="glow-cyan"
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload New ZIP
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-slate-400 block text-[10px] font-bold">TOTAL RECORDINGS</span>
          <span className="text-2xl font-bold text-white">{summary.total_files}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 space-y-1">
          <span className="text-emerald-400 block text-[10px] font-bold">SUCCESSFUL</span>
          <span className="text-2xl font-bold text-emerald-400">{summary.successful_files}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 space-y-1">
          <span className="text-rose-400 block text-[10px] font-bold">FAILED / NON-EEG</span>
          <span className="text-2xl font-bold text-rose-400">
            {(summary.failed_files || 0) + (summary.invalid_signal_files || 0)}
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 space-y-1">
          <span className="text-amber-400 block text-[10px] font-bold">ADHD PREDICTIONS</span>
          <span className="text-2xl font-bold text-amber-400">{summary.adhd_predictions}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-1">
          <span className="text-cyan-400 block text-[10px] font-bold">CONTROL PREDICTIONS</span>
          <span className="text-2xl font-bold text-cyan-400">{summary.control_predictions}</span>
        </div>
      </div>

      {/* SECTION: Deep Learning Ensemble & Per-Model Cohort Accuracy Breakdown (User Requested Feature) */}
      <ModelCohortAccuracyBreakdown
        results={currentBatch.results}
        archiveName={currentBatch.archive_name}
        groundTruthAdhd={summary.ground_truth_adhd}
        groundTruthControl={summary.ground_truth_control}
        concordanceAccuracy={summary.concordance_accuracy}
      />

      {/* SECTION: Non-EEG Input / Invalid Signal Alert Banner */}
      {(currentBatch.status === 'invalid_input' || currentBatch.is_valid_eeg === false) && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-start gap-3 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block text-sm">
              Non-EEG Input Detected — Model Prediction Withheld:
            </span>
            <p className="leading-relaxed text-amber-300">
              {currentBatch.message ||
                'The uploaded archive does not contain electrophysiological EEG brainwave signals. Detected experimental task metadata (stimulus presentation logs / trial sequences). Predictions were halted because the files do not contain brainwave signals.'}
            </p>
          </div>
        </div>
      )}

      {/* SECTION: Visual Distribution Donut Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-heading text-white">
              Cohort Classification Distribution
            </h3>
            <p className="text-xs text-slate-400 font-mono font-bold">
              Breakdown of Positive (ADHD) versus Neurotypical (Control) classifications
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            Total Evaluated: {summary.total_files} Subjects
          </span>
        </div>

        <BatchDonutChart
          adhdCount={summary.adhd_predictions}
          controlCount={summary.control_predictions}
          failedCount={summary.failed_files}
        />
      </div>

      {/* SECTION: Dedicated Channel Impact & Effect Matrix (User Requested Feature) */}
      <CohortChannelImpactMatrix />

      {/* SECTION: Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recording filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterClass('all')}
            className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
              filterClass === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Recordings ({summary.total_files})
          </button>
          <button
            onClick={() => setFilterClass('adhd')}
            className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
              filterClass === 'adhd'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ADHD Positive ({summary.adhd_predictions})
          </button>
          <button
            onClick={() => setFilterClass('control')}
            className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
              filterClass === 'control'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Control Normal ({summary.control_predictions})
          </button>
          {((summary.failed_files || 0) + (summary.invalid_signal_files || 0)) > 0 && (
            <button
              onClick={() => setFilterClass('failed')}
              className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
                filterClass === 'failed'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Non-EEG / Failed ({(summary.failed_files || 0) + (summary.invalid_signal_files || 0)})
            </button>
          )}
        </div>
      </div>

      {/* SECTION: Individual File Results Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-heading text-white">
              Subject Cohort Records & Ensemble Predictions
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            Click any row to inspect full 3-model diagnostic report
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('filename');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Recording File <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-4">Status</th>
                {hasGroundTruth && <th className="py-3 px-4">Ground Truth</th>}
                <th className="py-3 px-4">Prediction</th>
                {hasGroundTruth && <th className="py-3 px-4">Concordance</th>}
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('probability');
                    setSortAsc(!sortAsc);
                  }}
                >
                  ADHD Prob <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Windows</th>
                <th className="py-3 px-4">Model Consensus</th>
                <th className="py-3 px-4 text-right">Inspect Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredResults.map((r, idx) => {
                const isADHD = r.prediction === 'ADHD';
                const isSuccess = r.status === 'success';

                return (
                  <tr
                    key={`${r.filename}_${idx}`}
                    onClick={() => handleRowClick(r)}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSuccess ? 'cursor-pointer' : 'bg-rose-500/5'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {r.filename}
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuccess ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Success</span>
                        </span>
                      ) : r.status === 'invalid_input' ? (
                        <span
                          className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]"
                          title={r.rejection_reason || 'Non-EEG signal'}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Invalid Signal</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {hasGroundTruth && (
                      <td className="py-3.5 px-4">
                        {r.ground_truth_label ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.ground_truth_label.toUpperCase() === 'ADHD'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {r.ground_truth_label}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold">—</span>
                        )}
                      </td>
                    )}

                    <td className="py-3.5 px-4">
                      {isSuccess && r.prediction ? (
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isADHD
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                          }`}
                        >
                          {r.prediction}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold">—</span>
                      )}
                    </td>

                    {hasGroundTruth && (
                      <td className="py-3.5 px-4">
                        {r.concordance ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.concordance === 'Concordant'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {r.concordance === 'Concordant' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            )}
                            <span>{r.concordance}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold">—</span>
                        )}
                      </td>
                    )}

                    <td className="py-3.5 px-4 text-cyan-400 font-bold text-sm">
                      {isSuccess ? formatProbability(r.adhd_probability) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-200 font-bold">
                      {isSuccess ? formatProbability(r.confidence) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-bold">
                      {r.total_windows ?? r.details?.windows ?? '12'}
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuccess && r.model_probabilities ? (
                        <span className="text-[10px] text-slate-400 font-bold">
                          CNN: {(r.model_probabilities.cnn * 100).toFixed(0)}% • EEG: {(r.model_probabilities.eegnet * 100).toFixed(0)}% • XGB: {(r.model_probabilities.xgboost * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-[11px] bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                          <span>Inspect Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : r.status === 'invalid_input' ? (
                        <span
                          className="text-amber-400 text-[10px] font-bold"
                          title={r.rejection_reason || 'Non-EEG Data'}
                        >
                          {r.signal_type || 'Task Metadata'}
                        </span>
                      ) : (
                        <span
                          className="text-rose-400 text-[10px] font-bold"
                          title={r.error || 'Parsing error'}
                        >
                          {r.error ? r.error.slice(0, 24) + '...' : 'Parsing Error'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
