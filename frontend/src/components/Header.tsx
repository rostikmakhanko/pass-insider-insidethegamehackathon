import React from 'react';
import { TabType, MatchSession } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeSession: MatchSession;
  sessions: MatchSession[];
  onSelectSession: (session: MatchSession) => void;
  isDrawMode: boolean;
  onToggleDrawMode: () => void;
  onClear: () => void;
  onAnimate: () => void;
  isAnimating: boolean;
  onOpenPreset: () => void;
  onOpenExport: () => void;
  isAiInsightsOpen: boolean;
  onToggleAiInsights: () => void;
  vectorCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeSession,
  sessions,
  onSelectSession,
  isDrawMode,
  onToggleDrawMode,
  onClear,
  onAnimate,
  isAnimating,
  onOpenPreset,
  onOpenExport,
  isAiInsightsOpen,
  onToggleAiInsights,
  vectorCount
}) => {
  const [sessionMenuOpen, setSessionMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#ffffff]/95 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.12)] border-b border-[#eaedff]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Brand & Active Session */}
        <div className="flex items-center gap-4">
          <div className="flex items-center shrink-0">
            <span className="font-display text-base sm:text-lg tracking-tight uppercase text-[#131b2e] font-bold leading-none whitespace-nowrap">
              Pass Insider
            </span>
          </div>

          <div className="h-6 w-px bg-[#dae2fd] hidden md:block"></div>

          {/* Active Session Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setSessionMenuOpen(!sessionMenuOpen)}
              className="flex items-center gap-2 bg-[#f2f3ff] hover:bg-[#eaedff] px-3 py-1.5 rounded-lg transition-colors border border-[#eaedff] text-left"
              title="Click to switch active match session"
            >
              <span className="material-symbols-outlined text-[#0051d5] text-base">folder_managed</span>
              <div className="flex flex-col">
                <span className="font-mono-data text-[10px] text-[#404943] uppercase tracking-wider font-semibold">
                  Active Session
                </span>
                <span className="font-sans text-xs text-[#131b2e] font-semibold truncate max-w-[200px] lg:max-w-[260px]">
                  {activeSession.title}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#404943] text-sm ml-1">unfold_more</span>
            </button>

            {sessionMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-[#dae2fd] py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-[#eaedff] font-mono-data text-[10px] text-[#707973] uppercase tracking-wider font-semibold">
                  Switch Match Session
                </div>
                {sessions.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => {
                      onSelectSession(sess);
                      setSessionMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex flex-col hover:bg-[#f2f3ff] transition-colors ${
                      sess.id === activeSession.id ? 'bg-[#eaedff]/60 border-l-2 border-[#0051d5]' : ''
                    }`}
                  >
                    <span className="font-sans text-xs font-semibold text-[#131b2e]">{sess.title}</span>
                    <span className="font-sans text-[11px] text-[#707973]">{sess.competition}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Telemetry Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#eaedff] px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-[#0f5238] animate-pulse"></span>
            <span className="font-mono-data text-[11px] text-[#404943] font-semibold uppercase tracking-wider">
              LIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-lg border border-[#eaedff]">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-1 text-xs transition-all font-semibold rounded ${
              activeTab === 'workbench'
                ? 'bg-[#2d6a4f] text-white shadow-sm'
                : 'text-[#404943] hover:text-[#131b2e] hover:bg-white/60'
            }`}
          >
            Pitch Workbench
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 text-xs transition-all font-semibold rounded ${
              activeTab === 'matrix'
                ? 'bg-[#2d6a4f] text-white shadow-sm'
                : 'text-[#404943] hover:text-[#131b2e] hover:bg-white/60'
            }`}
          >
            Network Matrix
          </button>
          <button
            onClick={() => setActiveTab('voronoi')}
            className={`px-3 py-1 text-xs transition-all font-semibold rounded ${
              activeTab === 'voronoi'
                ? 'bg-[#2d6a4f] text-white shadow-sm'
                : 'text-[#404943] hover:text-[#131b2e] hover:bg-white/60'
            }`}
          >
            Voronoi &amp; xT
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1 text-xs transition-all font-semibold rounded ${
              activeTab === 'vault'
                ? 'bg-[#2d6a4f] text-white shadow-sm'
                : 'text-[#404943] hover:text-[#131b2e] hover:bg-white/60'
            }`}
          >
            Match Vault
          </button>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-lg border border-[#eaedff]">
            {/* AI Insights Action Button */}
            <button
              onClick={onToggleAiInsights}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                isAiInsightsOpen
                  ? 'bg-[#0f5238] text-white font-semibold shadow-xs'
                  : 'text-[#0f5238] hover:bg-[#b1f0ce]/40 font-semibold'
              }`}
              title="Open Tactical AI Insights Chat"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span className="hidden sm:inline">AI Insights</span>
            </button>

            <button
              onClick={onToggleDrawMode}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                isDrawMode
                  ? 'bg-[#0f5238] text-white font-semibold'
                  : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
              title="Toggle Draw Mode"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span className="hidden sm:inline">Draw Mode</span>
            </button>
            <button
              onClick={onClear}
              className="px-2.5 py-1 rounded text-xs text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors flex items-center gap-1"
              title="Clear all vectors"
            >
              <span className="material-symbols-outlined text-sm">ink_eraser</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onAnimate}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                isAnimating
                  ? 'bg-[#0051d5] text-white font-semibold'
                  : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
              title="Animate pass sequence playback"
            >
              <span className="material-symbols-outlined text-sm">
                {isAnimating ? 'pause' : 'play_arrow'}
              </span>
              <span className="hidden sm:inline">{isAnimating ? 'Playing' : 'Animate'}</span>
            </button>
            <button
              onClick={onOpenPreset}
              className="px-2.5 py-1 rounded text-xs text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors flex items-center gap-1"
              title="Tactical presets & formations"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              <span className="hidden sm:inline">Preset</span>
            </button>
            <button
              onClick={onOpenExport}
              className="px-3 py-1 rounded bg-[#0f5238] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#2d6a4f] transition-colors shadow-sm"
              title="Export match dossier"
            >
              <span className="material-symbols-outlined text-sm">ios_share</span>
              <span>Export</span>
            </button>
          </div>

          <div className="h-6 w-px bg-[#dae2fd] hidden sm:block"></div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-1">
            <div className="flex flex-col text-right hidden lg:flex">
              <span className="font-mono-data text-[11px] text-[#131b2e] font-semibold leading-tight">
                L. Moretti
              </span>
              <span className="font-mono-data text-[9px] text-[#0f5238] font-bold">
                Lead Analyst
              </span>
            </div>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0f5238]/30"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvTpGqfTGgsXbayi1SfSR8sw22Q8B68Pz-TxXHFlbStUl0xAiwvzgxIisxRLLmcFpOlmlR5nqhCFWBCMRAYS8Z0kM6d5WVTIUnc7p3lWXhyYf_1O-igXT18wuB_qgK6x6jhN3B_M9h-trH1fCqGB3Ouq1vC1Vk7VpAiY2Yu263y-1gaAOdKUkXOIoU2fPF19BmXDzlm83rHWnYEhzHCJjdNf43Ua1hT5A9K-1Z8zeQhlsdcEgidWkSaQ"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
