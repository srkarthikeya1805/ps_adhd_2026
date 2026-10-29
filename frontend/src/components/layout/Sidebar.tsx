import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  Cpu,
  Layers,
  FileStack,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Brain,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { clearSession, getSession } from '../../services/storage';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const session = getSession();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, tag: 'LAB', exact: true },
    { label: 'New EEG Analysis', to: '/dashboard/upload', icon: UploadCloud, tag: 'IN' },
    { label: 'Analysis Results', to: '/dashboard/results', icon: Activity, tag: 'ML' },
    { label: 'Brain Recovery & Care', to: '/dashboard/neuro-care', icon: HeartPulse, tag: 'CARE' },
    { label: 'Model Ensemble', to: '/dashboard/models', icon: Cpu, tag: '3X' },
    { label: 'Signal Explorer', to: '/dashboard/signal-explorer', icon: Layers, tag: '19CH' },
    { label: 'Batch Analysis', to: '/dashboard/batch', icon: FileStack, tag: 'SET' },
    { label: 'Analysis History', to: '/dashboard/history', icon: History, tag: 'LOG' },
    { label: 'Settings & Info', to: '/dashboard/settings', icon: Settings, tag: 'SYS' },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#030914]/80 backdrop-blur-2xl border-r border-[#20BFE8]/25 transition-all duration-300 flex flex-col justify-between select-none shadow-[4px_0_30px_rgba(0,0,0,0.6)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-20 px-4 flex items-center justify-between border-b border-[#20BFE8]/20 bg-[#020712]/50">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#087CFF]/30 to-[#20BFE8]/20 border border-[#20BFE8]/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(32,191,232,0.3)] group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-[#20BFE8] filter drop-shadow-[0_0_8px_#20BFE8]" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-base text-white tracking-wider">
                    NEUROSCAN<span className="text-[#20BFE8]">.AI</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#087CFF]/20 border border-[#20BFE8]/40 text-[#79DFFF]">
                    v3.0
                  </span>
                </div>
                <span className="block text-[11px] text-[#A5B8CC] font-heading font-bold uppercase tracking-wider">
                  Neural Control Lab
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#20BFE8]" /> : <ChevronLeft className="w-4 h-4 text-[#20BFE8]" />}
          </button>
        </div>

        {/* Navigation Section Header */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-1">
            <span className="text-[10px] font-heading font-extrabold text-cyan-400/80 uppercase tracking-widest">
              Diagnostic Suite
            </span>
          </div>
        )}

        {/* Navigation Items with Bold High-Tech Format */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#087CFF]/30 via-[#20BFE8]/20 to-transparent text-white border-l-4 border-l-[#20BFE8] border-y border-r border-[#20BFE8]/40 shadow-[0_0_25px_rgba(32,191,232,0.25)]'
                      : 'text-[#A5B8CC] hover:text-white hover:bg-[#07172C]/80 border border-transparent hover:border-[#20BFE8]/25'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Futuristic Icon Capsule with Neon Glow */}
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-br from-[#087CFF]/40 to-[#20BFE8]/30 border border-[#20BFE8] shadow-[0_0_15px_#20BFE8]'
                          : 'bg-[#030914] border border-slate-800 group-hover:border-[#20BFE8]/60 group-hover:bg-[#061426]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#79DFFF] filter drop-shadow-[0_0_6px_#20BFE8]' : 'text-slate-400 group-hover:text-[#20BFE8]'
                        }`}
                      />
                    </div>

                    {/* Bold High-Tech Label */}
                    {!isCollapsed && (
                      <span className="font-heading font-extrabold text-xs tracking-wider uppercase flex-1 truncate">
                        {item.label}
                      </span>
                    )}

                    {/* Micro Technical Tag */}
                    {!isCollapsed && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${
                          isActive
                            ? 'bg-[#20BFE8]/20 text-[#79DFFF] border border-[#20BFE8]/50 shadow-[0_0_8px_rgba(32,191,232,0.4)]'
                            : 'text-slate-500 group-hover:text-slate-400 bg-slate-900/60'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#061426] border border-[#20BFE8]/50 text-xs text-[#79DFFF] font-heading font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Sign Out */}
      <div className="p-3 border-t border-[#20BFE8]/20 bg-[#020712]/40 space-y-2">
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-[#061426]/90 border border-[#20BFE8]/25 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#087CFF]/30 to-[#20BFE8]/20 border border-[#20BFE8]/50 flex items-center justify-center shrink-0 text-[#79DFFF] text-xs font-heading font-extrabold">
            {session?.name ? session.name[0].toUpperCase() : 'G'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden leading-tight flex-1">
              <span className="block text-xs font-heading font-extrabold text-white truncate tracking-wide">
                {session?.name || 'Research Guest'}
              </span>
              <span className="block text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider truncate">
                {session?.isGuest ? 'Demo Access' : session?.email}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="uppercase tracking-wider">Exit Session</span>}
        </button>
      </div>
    </aside>
  );
};
