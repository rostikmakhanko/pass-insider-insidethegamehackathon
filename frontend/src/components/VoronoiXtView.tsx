import React, { useState } from 'react';
import { Team } from '../types';

interface VoronoiXtViewProps {
  homeTeam: Team;
  awayTeam: Team;
}

export const VoronoiXtView: React.FC<VoronoiXtViewProps> = ({ homeTeam, awayTeam }) => {
  const [defensiveLineHeight, setDefensiveLineHeight] = useState(48); // meters
  const [compactnessIndex, setCompactnessIndex] = useState(62); // %

  const zonesData = [
    { zone: 14, name: 'Central Zone 14', xt: '+0.58', threat: 'CRITICAL', passes: 34, team: 'Manchester Blue' },
    { zone: 11, name: 'Right Half-Space High', xt: '+0.42', threat: 'HIGH', passes: 29, team: 'Manchester Blue' },
    { zone: 17, name: 'Penalty Box Center', xt: '+0.64', threat: 'LETHAL', passes: 14, team: 'Manchester Blue' },
    { zone: 8, name: 'Left Half-Space Mid', xt: '+0.27', threat: 'MODERATE', passes: 41, team: 'Manchester Blue' },
    { zone: 7, name: 'Defensive Third Left', xt: '+0.04', threat: 'LOW', passes: 52, team: 'Manchester Blue' },
    { zone: 16, name: 'Right Wing Final Third', xt: '+0.33', threat: 'HIGH', passes: 26, team: 'Manchester Blue' }
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2f3ff] p-4 rounded-xl border border-[#eaedff]">
        <div>
          <h2 className="font-display text-lg font-bold text-[#131b2e] tracking-tight">
            Spatial Voronoi Control &amp; Expected Threat (xT) Heatmap
          </h2>
          <p className="font-sans text-xs text-[#707973] mt-0.5">
            18-zone pitch partition, spatial control contours, and final-third danger density
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#dae2fd]">
            <span className="font-mono-data text-xs text-[#0284c7] font-bold">MAN BLUE 64%</span>
            <span className="font-mono-data text-xs text-[#707973]">vs</span>
            <span className="font-mono-data text-xs text-[#c00815] font-bold">REAL MADRID 36%</span>
          </div>
        </div>
      </div>

      {/* Visual Pitch 18-Zone Spatial Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-[#131b2e]">
              18-Zone Expected Threat (xT) Field Grid
            </span>
            <span className="font-mono-data text-[10px] text-[#0f5238] font-bold">
              High Danger Zone Highlight: Zone 14 &amp; Half-Spaces
            </span>
          </div>

          {/* Simulated 18-Zone Pitch */}
          <div className="relative w-full aspect-[16/9] md:aspect-[1.544] rounded-lg overflow-hidden bg-[#1b4332] border border-white/20 p-2">
            <div className="w-full h-full grid grid-cols-6 grid-rows-3 gap-1">
              {[...Array(18)].map((_, i) => {
                const zone = i + 1;
                const isZone14 = zone === 11 || zone === 14;
                const isBox = zone === 17 || zone === 18;
                const isHighThreat = isZone14 || isBox;
                const xtVal = (0.04 + ((i % 6) + 1) * 0.09).toFixed(2);

                return (
                  <div
                    key={zone}
                    className={`rounded flex flex-col justify-between p-2 border transition-all ${
                      isBox
                        ? 'bg-rose-500/25 border-rose-400'
                        : isZone14
                        ? 'bg-amber-400/25 border-amber-300'
                        : 'bg-emerald-950/40 border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono-data text-[10px] text-white font-bold">
                        Z{zone}
                      </span>
                      {isHighThreat && (
                        <span className="material-symbols-outlined text-xs text-amber-300">bolt</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono-data text-[11px] text-white font-extrabold block">
                        +{xtVal}
                      </span>
                      <span className="font-mono-data text-[8px] text-white/70">xT Density</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Tactical Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#f2f3ff] p-3 rounded-lg border border-[#eaedff]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-sans text-xs font-semibold text-[#131b2e]">
                  Defensive Line Height
                </span>
                <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                  {defensiveLineHeight}m
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="65"
                value={defensiveLineHeight}
                onChange={(e) => setDefensiveLineHeight(Number(e.target.value))}
                className="w-full accent-[#0051d5] cursor-pointer"
              />
              <span className="font-mono-data text-[10px] text-[#707973] block mt-1">
                Higher line concentrates pressing in central mid zones
              </span>
            </div>

            <div className="bg-[#f2f3ff] p-3 rounded-lg border border-[#eaedff]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-sans text-xs font-semibold text-[#131b2e]">
                  Spatial Compactness Index
                </span>
                <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                  {compactnessIndex}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={compactnessIndex}
                onChange={(e) => setCompactnessIndex(Number(e.target.value))}
                className="w-full accent-[#0f5238] cursor-pointer"
              />
              <span className="font-mono-data text-[10px] text-[#707973] block mt-1">
                Calculates Euclidean density radius between center-backs and forwards
              </span>
            </div>
          </div>
        </div>

        {/* High Threat Zone Ledger */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-base">radar</span>
            <span className="font-display text-sm font-bold text-[#131b2e]">
              Dangerous Space Utilization
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px]">
            {zonesData.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-data text-xs font-bold text-[#131b2e]">
                      Z{item.zone}
                    </span>
                    <span className="font-sans text-xs font-semibold text-[#131b2e]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono-data text-[10px] text-[#707973]">
                    {item.passes} passes completed
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono-data text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      item.threat === 'LETHAL'
                        ? 'bg-rose-100 text-rose-700'
                        : item.threat === 'CRITICAL'
                        ? 'bg-amber-100 text-amber-800'
                        : item.threat === 'HIGH'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.threat}
                  </span>
                  <span className="font-mono-data text-xs font-bold text-[#0f5238] block mt-1">
                    xT {item.xt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
