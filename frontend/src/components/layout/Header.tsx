import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, UploadCloud, Server, ShieldCheck, AlertCircle } from 'lucide-react';
import { getHealth } from '../../services/api';
import { HealthResponse } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Neural Control Center',
  subtitle = 'Universal EEG Signal Analysis & Deep Learning Ensemble Pipeline',
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = () => {
    setIsLoading(true);
    getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    checkConnection();
    // Re-check health every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 px-6 md:px-8 border-b border-slate-800 bg-[#050816]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status Pill */}
        <div
          onClick={checkConnection}
          className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all text-xs font-mono select-none"
          title="Click to re-ping backend API"
        >
          {health ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              <span className="text-emerald-400 font-semibold">FastAPI Connected</span>
              <span className="text-[10px] text-slate-500 hidden md:inline">
                ({health.device} • {health.version})
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400 font-semibold">Backend Offline</span>
            </>
          )}

          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ${
              isLoading ? 'animate-spin text-cyan-400' : ''
            }`}
          />
        </div>

        {/* Quick Upload CTA */}
        <Link
          to="/dashboard/upload"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-heading font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">New Analysis</span>
        </Link>
      </div>
    </header>
  );
};
