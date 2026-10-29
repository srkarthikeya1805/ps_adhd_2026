import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History,
  Trash2,
  Download,
  Eye,
  FileText,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { getHistory, clearHistory, saveSelectedFileResult } from '../services/storage';
import { AnalysisHistoryItem } from '../types';
import { formatDate, formatProbability } from '../utils/formatters';
import { Button } from '../components/ui/Button';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear local demo session analysis history?')) {
      clearHistory();
      setHistoryItems([]);
    }
  };

  const handleInspect = (item: AnalysisHistoryItem) => {
    saveSelectedFileResult(item.raw_result);
    navigate('/dashboard/results');
  };

  const handleExportHistoryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `session_eeg_analysis_history.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <History className="w-3.5 h-3.5" />
            <span>Session Audit Log</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mt-1">
            Analysis Session History
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Chronological records of EEG analyses processed during your current browser session.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportHistoryJson}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleClear}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear History
            </Button>
          </div>
        )}
      </div>

      {/* Ephemeral Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Local Session Privacy:</strong> Analysis records and probability predictions are stored ephemerally in browser localStorage for project demonstration. No raw patient voltage arrays or confidential biomedical data are transmitted to third parties or persisted in permanent cloud stores.
        </p>
      </div>

      {/* History Items Table */}
      {historyItems.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">
            No Session History Recorded Yet
          </h3>
          <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
            Once you execute an EEG analysis or validate a recording, summary outcomes will appear here.
          </p>
          <Link to="/dashboard/upload">
            <Button variant="primary" size="md" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Start an Analysis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Prediction</th>
                  <th className="py-3 px-4">ADHD Prob</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Windows</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyItems.map((item) => {
                  const isADHD = item.prediction.toLowerCase().includes('adhd');
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleInspect(item)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(item.timestamp)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                        {item.filename}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isADHD
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-cyan-400 font-bold">
                        {formatProbability(item.adhd_probability)}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {formatProbability(item.confidence)}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {item.windows} Windows
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]">
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
