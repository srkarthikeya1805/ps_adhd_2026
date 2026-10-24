import React, { useState } from 'react';
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
  ShieldCheck,
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
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'New EEG Analysis', to: '/dashboard/upload', icon: UploadCloud },
    { label: 'Analysis Results', to: '/dashboard/results', icon: Activity },
    { label: 'Model Ensemble', to: '/dashboard/models', icon: Cpu },
    { label: 'Signal Explorer', to: '/dashboard/signal-explorer', icon: Layers },
    { label: 'Batch Analysis', to: '/dashboard/batch', icon: FileStack },
    { label: 'Analysis History', to: '/dashboard/history', icon: History },
    { label: 'Settings & Info', to: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#080B1B]/95 backdrop-blur-2xl border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800/80">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-heading font-bold text-base text-white tracking-wider">
                  NEUROSCAN<span className="text-cyan-400">.AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">Control Center</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-heading text-sm font-bold tracking-wide transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
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
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 text-xs font-bold font-mono">
            {session?.name ? session.name[0].toUpperCase() : 'G'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden leading-tight flex-1">
              <span className="block text-xs font-semibold text-slate-200 truncate">
                {session?.name || 'Research Guest'}
              </span>
              <span className="block text-[10px] text-slate-400 truncate font-mono">
                {session?.isGuest ? 'Demo Access' : session?.email}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Exit Session</span>}
        </button>
      </div>
    </aside>
  );
};
