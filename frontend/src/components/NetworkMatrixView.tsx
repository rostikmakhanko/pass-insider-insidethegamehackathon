import React, { useState } from 'react';
import { Team, Player } from '../types';

interface NetworkMatrixViewProps {
  homeTeam: Team;
  awayTeam: Team;
  onSelectPlayer: (id: string) => void;
}

export const NetworkMatrixView: React.FC<NetworkMatrixViewProps> = ({
  homeTeam,
  awayTeam,
  onSelectPlayer
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<'home' | 'away'>('home');
  const activeTeam = selectedTeamId === 'home' ? homeTeam : awayTeam;

  // Generate deterministic realistic pass volume matrix for the 11 players
  const getPassCount = (p1: Player, p2: Player) => {
    if (p1.id === p2.id) return '-';
    const hash = (p1.num * 17 + p2.num * 31) % 35;
    // Boost central midfielders
    const isMid = ['DM', 'CM', 'AM', 'CB'].includes(p1.pos) && ['DM', 'CM', 'AM', 'CB'].includes(p2.pos);
    return isMid ? 14 + (hash % 22) : 2 + (hash % 12);
  };

  const topCombinations = [
    { from: 'Rodri (16)', to: 'K. De Bruyne (17)', count: 28, xtGain: '+0.42', comp: '96%' },
    { from: 'J. Stones (5)', to: 'Rodri (16)', count: 24, xtGain: '+0.19', comp: '94%' },
    { from: 'K. De Bruyne (17)', to: 'E. Haaland (9)', count: 18, xtGain: '+0.54', comp: '88%' },
    { from: 'J. Gvardiol (24)', to: 'J. Grealish (10)', count: 19, xtGain: '+0.23', comp: '92%' },
    { from: 'R. Dias (3)', to: 'J. Stones (5)', count: 22, xtGain: '+0.08', comp: '98%' },
    { from: 'B. Silva (20)', to: 'P. Foden (47)', count: 17, xtGain: '+0.31', comp: '91%' }
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-10">
      {/* Top Header & Team Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2f3ff] p-4 rounded-xl border border-[#eaedff]">
        <div>
          <h2 className="font-display text-lg font-bold text-[#131b2e] tracking-tight">
            Pass Connectivity Matrix &amp; Network Topology
          </h2>
          <p className="font-sans text-xs text-[#707973] mt-0.5">
            Dyadic passing frequencies, eigenvector centrality, and progressive channel distribution
          </p>
        </div>

        {/* Team Segmented Switcher */}
        <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-lg border border-[#dae2fd]">
          <button
            onClick={() => setSelectedTeamId('home')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              selectedTeamId === 'home'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-[#404943] hover:text-[#131b2e]'
            }`}
          >
            {homeTeam.name}
          </button>
          <button
            onClick={() => setSelectedTeamId('away')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              selectedTeamId === 'away'
                ? 'bg-[#c00815] text-white shadow-xs'
                : 'text-[#404943] hover:text-[#131b2e]'
            }`}
          >
            {awayTeam.name}
          </button>
        </div>
      </div>

      {/* Grid: 11x11 Passing Matrix & Centrality Hubs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Matrix Table */}
        <div className="xl:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-[#eaedff] overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0051d5] text-base">hub</span>
              <span className="font-display text-sm font-bold text-[#131b2e]">
                Passing Linkage Matrix (Completed Passes)
              </span>
            </div>
            <span className="font-mono-data text-[10px] text-[#707973]">
              Y-Axis: Passer → X-Axis: Receiver
            </span>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-[#eaedff]">
                <th className="p-2 text-left font-mono-data text-[10px] text-[#707973]">PASSER</th>
                {activeTeam.players.map((p) => (
                  <th
                    key={`th-${p.id}`}
                    className="p-1.5 font-mono-data text-[10px] text-[#131b2e] font-bold bg-[#f2f3ff]/60"
                  >
                    #{p.num}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTeam.players.map((p1) => (
                <tr key={`tr-${p1.id}`} className="border-b border-[#eaedff]/60 hover:bg-[#f2f3ff]/40">
                  <td
                    onClick={() => onSelectPlayer(p1.id)}
                    className="p-2 text-left font-sans text-xs font-semibold text-[#131b2e] cursor-pointer hover:text-[#0051d5] whitespace-nowrap"
                  >
                    <span className="font-mono-data text-[10px] text-[#707973] mr-1.5">
                      #{p1.num}
                    </span>
                    {p1.name}
                  </td>
                  {activeTeam.players.map((p2) => {
                    const count = getPassCount(p1, p2);
                    const isNum = typeof count === 'number';
                    const intensity = isNum ? Math.min(count / 28, 1) : 0;
                    return (
                      <td
                        key={`cell-${p1.id}-${p2.id}`}
                        style={{
                          backgroundColor:
                            isNum && count > 5
                              ? selectedTeamId === 'home'
                                ? `rgba(2, 132, 199, ${intensity * 0.4})`
                                : `rgba(192, 8, 21, ${intensity * 0.4})`
                              : 'transparent'
                        }}
                        className={`p-1.5 font-mono-data text-[11px] ${
                          isNum && count > 15 ? 'font-bold text-[#131b2e]' : 'text-[#707973]'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tactical Key Combinations & Hubs */}
        <div className="flex flex-col gap-4">
          {/* Top Passing Partnerships */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eaedff]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#0f5238] text-base">compare_arrows</span>
              <span className="font-display text-sm font-bold text-[#131b2e]">
                Top Pass Combinations
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {topCombinations.map((combo, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-[#131b2e]">
                      {combo.from} → {combo.to}
                    </span>
                    <span className="font-mono-data text-[10px] text-[#707973]">
                      Pass Success: {combo.comp}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                      {combo.count} passes
                    </span>
                    <span className="font-mono-data text-[10px] text-[#0f5238] block font-semibold">
                      xT {combo.xtGain}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Metrics Readout */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eaedff]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#c00815] text-base">account_tree</span>
              <span className="font-display text-sm font-bold text-[#131b2e]">
                Centrality Index
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-mono-data mb-1">
                  <span>Rodri (#16 DM)</span>
                  <span className="font-bold text-[#0f5238]">94.2 / 100</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0f5238] h-full rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-data mb-1">
                  <span>K. De Bruyne (#17 AM)</span>
                  <span className="font-bold text-[#0f5238]">88.6 / 100</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0f5238] h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-data mb-1">
                  <span>J. Stones (#5 CB)</span>
                  <span className="font-bold text-[#0051d5]">81.4 / 100</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0051d5] h-full rounded-full" style={{ width: '81%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-data mb-1">
                  <span>R. Dias (#3 CB)</span>
                  <span className="font-bold text-[#0051d5]">76.0 / 100</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0051d5] h-full rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
