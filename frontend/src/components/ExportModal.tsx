import React, { useState } from 'react';
import { MatchSession, PassVector, Team } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MatchSession;
  homeTeam: Team;
  awayTeam: Team;
  vectors: PassVector[];
  netXt?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  session,
  homeTeam,
  awayTeam,
  vectors,
  netXt
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const matchTitle = `${homeTeam.name} vs ${awayTeam.name}`;
  const effectiveXt = netXt ? `+${netXt}` : session.kpis.xt;
  const computedProgPasses = session.kpis.progPasses + vectors.length;

  const exportData = {
    app: 'Pass Insider',
    timestamp: new Date().toISOString(),
    match: matchTitle,
    competition: session.competition,
    vectorsCount: vectors.length,
    vectors: vectors,
    kpis: {
      ...session.kpis,
      xt: effectiveXt,
      progPasses: computedProgPasses
    },
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.name,
      formation: homeTeam.formation,
      formationType: homeTeam.formationType,
      possession: homeTeam.possession,
      passSucc: homeTeam.passSucc,
      players: homeTeam.players
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.name,
      formation: awayTeam.formation,
      formationType: awayTeam.formationType,
      possession: awayTeam.possession,
      passSucc: awayTeam.passSucc,
      ppda: awayTeam.ppda,
      transitions: awayTeam.transitions,
      players: awayTeam.players
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = matchTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `passinsider-${sanitizedTitle}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f5238] text-xl">ios_share</span>
            <h3 className="font-display text-base font-bold text-[#131b2e]">
              Export Tactical Telemetry Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#707973] hover:text-[#131b2e] p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Live Match Summary Preview with Updated Data */}
        <div className="bg-[#f2f3ff] p-3.5 rounded-xl border border-[#eaedff] space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs font-bold text-[#131b2e]">{matchTitle}</span>
            <span className="font-mono-data text-[10px] text-[#0f5238] font-bold bg-[#b1f0ce] px-2 py-0.5 rounded">
              UPDATED LIVE DOSSIER
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono-data text-[#404943]">
            <span>{homeTeam.name} ({homeTeam.formationType})</span>
            <span>vs</span>
            <span>{awayTeam.name} ({awayTeam.formationType})</span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#dae2fd]">
            <div>
              <span className="font-mono-data text-[9px] text-[#707973] block">VECTORS</span>
              <span className="font-mono-data text-xs font-bold text-[#131b2e]">
                {vectors.length} Drawn
              </span>
            </div>
            <div>
              <span className="font-mono-data text-[9px] text-[#707973] block">HOME PASS %</span>
              <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                {homeTeam.passSucc}
              </span>
            </div>
            <div>
              <span className="font-mono-data text-[9px] text-[#707973] block">POSSESSION</span>
              <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                {homeTeam.possession}
              </span>
            </div>
            <div>
              <span className="font-mono-data text-[9px] text-[#707973] block">NET xT</span>
              <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                {effectiveXt}
              </span>
            </div>
          </div>
        </div>

        {/* Code Preview showing Live Updated JSON */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono-data text-[10px] text-[#707973] uppercase tracking-wider font-semibold">
              Live Tactical Telemetry Payload (JSON)
            </span>
            <span className="font-mono-data text-[10px] text-[#0f5238] font-semibold">
              {homeTeam.players.length + awayTeam.players.length} Players Configured
            </span>
          </div>
          <pre className="p-3 bg-[#0f172a] text-[#dae2fd] rounded-lg font-mono-data text-[11px] overflow-x-auto max-h-56">
            {JSON.stringify(exportData, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#404943] hover:bg-[#f2f3ff] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCopyJSON}
            className="px-4 py-2 rounded-lg bg-[#eaedff] text-[#0051d5] text-xs font-bold hover:bg-[#dbe1ff] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-lg bg-[#0f5238] text-white text-xs font-bold hover:bg-[#2d6a4f] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
