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
    <header className="h-20 px-6 md:px-8 border-b border-[#20BFE8]/20 bg-[#030914]/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold font-heading text-white tracking-wide flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-[#20BFE8] font-mono font-bold tracking-wider uppercase hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status Pill */}
        <div
          onClick={checkConnection}
          className="cursor-pointer group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061426]/90 border border-[#20BFE8]/30 hover:border-[#20BFE8]/70 transition-all text-xs font-mono select-none shadow-[0_0_15px_rgba(32,191,232,0.15)]"
          title="Click to re-ping backend API"
        >
          {health ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-emerald-400 font-bold font-mono tracking-wide">FastAPI Online</span>
              <span className="text-[10px] text-slate-400 font-bold hidden md:inline">
                ({health.device} • {health.version})
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400 font-bold font-mono">Backend Offline</span>
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#087CFF] to-[#20BFE8] text-[#030914] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(32,191,232,0.35)] hover:shadow-[0_0_30px_rgba(32,191,232,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Analysis</span>
        </Link>
      </div>
    </header>
  );
};
