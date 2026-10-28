import React from 'react';
import { Player, PassVector, VectorType, TacticalTool, Team } from '../types';
import { PitchCanvas } from './PitchCanvas';
import { RosterPanel } from './RosterPanel';

interface PitchWorkbenchProps {
  homeTeam: Team;
  awayTeam: Team;
  vectors: PassVector[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onUpdatePlayerPos: (id: string, x: number, y: number) => void;
  onAddVector: (fromId: string, toId: string, type: VectorType) => void;
  onDeleteVector: (index: number) => void;
  onResetVectors: () => void;
  onApplyPreset: (presetId: string) => void;
  onInvertPitchAxis: () => void;
  showVoronoi: boolean;
  onToggleVoronoi: () => void;
  showSpatialGrid: boolean;
  currentTool: TacticalTool;
  onSelectTool: (tool: TacticalTool) => void;
  activeVectorType: VectorType;
  setActiveVectorType: (type: VectorType) => void;
  isDrawMode: boolean;
  setIsDrawMode: (isDraw: boolean) => void;
  isAnimating: boolean;
  onAnimationEnd: () => void;
  isAiInsightsOpen?: boolean;
  onToggleAiInsights?: () => void;
  onUpdateTeam?: (teamId: 'home' | 'away', updatedData: Partial<Team>) => void;
  onUpdatePlayer?: (teamId: 'home' | 'away', playerId: string, updatedData: Partial<Player>) => void;
  kpis: {
    passAcc: string;
    passAccDelta: string;
    avgPassDist: string;
    tempo: string;
    xt: string;
    progPasses: number;
    finalThird: number;
    territorialTilt: string;
    dominantStatus: string;
  };
}

export const PitchWorkbench: React.FC<PitchWorkbenchProps> = ({
  homeTeam,
  awayTeam,
  vectors,
  selectedPlayerId,
  onSelectPlayer,
  onUpdatePlayerPos,
  onAddVector,
  onDeleteVector,
  onResetVectors,
  onApplyPreset,
  onInvertPitchAxis,
  showVoronoi,
  onToggleVoronoi,
  showSpatialGrid,
  currentTool,
  onSelectTool,
  activeVectorType,
  setActiveVectorType,
  isDrawMode,
  setIsDrawMode,
  isAnimating,
  onAnimationEnd,
  isAiInsightsOpen,
  onToggleAiInsights,
  onUpdateTeam,
  onUpdatePlayer,
  kpis
}) => {
  const allPlayers = [...homeTeam.players, ...awayTeam.players];
  const focusedPlayer = allPlayers.find((p) => p.id === selectedPlayerId) || homeTeam.players[6]; // default De Bruyne

  // Calculated dynamic xT and progressive pass count based on drawn vectors
  const computedProgPasses = kpis.progPasses + vectors.length;
  const netXtValue = (1.12 + vectors.length * 0.06).toFixed(2);

  return (
    <div className="flex flex-col w-full gap-4">
      {/* HUD Top Bar: Pitch Telemetry Metrics & Fast Tactical Action Trigger Array */}
      <section className="w-full px-4 sm:px-6 py-3 bg-[#f2f3ff] shadow-sm flex flex-col gap-3 rounded-xl border border-[#eaedff]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Action Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-data text-[10px] text-[#404943] uppercase tracking-wider font-semibold mr-1">
              Tactic Setup:
            </span>

            <button
              onClick={() => onApplyPreset('433-attack')}
              type="button"
              className="px-2.5 py-1 rounded bg-white text-[#131b2e] hover:bg-[#eaedff] transition-all font-sans text-xs font-semibold flex items-center gap-1 border border-[#dae2fd] shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-[#0f5238]">schema</span>
              <span>4-3-3 Attacking</span>
            </button>

            <button
              onClick={() => onApplyPreset('4231-highpress')}
              type="button"
              className="px-2.5 py-1 rounded bg-white text-[#131b2e] hover:bg-[#eaedff] transition-all font-sans text-xs font-semibold flex items-center gap-1 border border-[#dae2fd] shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-[#0051d5]">grid_goldenratio</span>
              <span>4-2-3-1 High Press</span>
            </button>

            <button
              onClick={onInvertPitchAxis}
              type="button"
              className="px-2.5 py-1 rounded bg-white text-[#131b2e] hover:bg-[#eaedff] transition-all font-sans text-xs font-semibold flex items-center gap-1 border border-[#dae2fd] shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-[#0f5238]">swap_horiz</span>
              <span>Invert Pitch Axis</span>
            </button>

            <button
              onClick={onToggleVoronoi}
              type="button"
              className={`px-2.5 py-1 rounded transition-all font-sans text-xs font-semibold flex items-center gap-1 border shadow-xs active:scale-95 ${
                showVoronoi
                  ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                  : 'bg-white text-[#131b2e] border-[#dae2fd] hover:bg-[#eaedff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-[#c00815]">grain</span>
              <span>Territorial Voronoi: {showVoronoi ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>

          {/* Pitch Engine Status & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-[#dae2fd]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f5238] animate-ping"></span>
              <span className="font-mono-data text-[11px] text-[#131b2e] font-semibold">
                PITCH ENGINE: ACTIVE DYNAMICS
              </span>
            </div>

            {onToggleAiInsights && (
              <button
                onClick={onToggleAiInsights}
                type="button"
                className={`px-2.5 py-1 rounded font-mono-data text-xs font-bold flex items-center gap-1 transition-all border ${
                  isAiInsightsOpen
                    ? 'bg-[#0f5238] text-white border-[#0f5238] shadow-xs'
                    : 'bg-white text-[#0f5238] hover:bg-[#eaedff] border-[#dae2fd]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>AI Insights</span>
              </button>
            )}

            <button
              onClick={onResetVectors}
              type="button"
              className="px-2.5 py-1 rounded bg-[#eaedff] text-[#ba1a1a] font-mono-data text-xs font-bold flex items-center gap-1 hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors border border-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reset Vectors</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry KPI Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Pass Accuracy */}
          <div className="bg-[#eaedff] p-2.5 rounded-lg flex flex-col justify-between border border-[#dae2fd]/60">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#404943] font-semibold tracking-wider">
                PASS ACCURACY
              </span>
              <span className="material-symbols-outlined text-sm text-[#0f5238]">insights</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-[#131b2e]">
                {kpis.passAcc}
              </span>
              <span className="font-mono-data text-[11px] text-[#0f5238] font-semibold">
                {kpis.passAccDelta}
              </span>
            </div>
          </div>

          {/* Avg Pass Distance */}
          <div className="bg-[#eaedff] p-2.5 rounded-lg flex flex-col justify-between border border-[#dae2fd]/60">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#404943] font-semibold tracking-wider">
                AVG PASS DISTANCE
              </span>
              <span className="material-symbols-outlined text-sm text-[#0051d5]">straighten</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-[#131b2e]">
                {kpis.avgPassDist}
              </span>
              <span className="font-mono-data text-[11px] text-[#0051d5] font-semibold">
                {kpis.tempo}
              </span>
            </div>
          </div>

          {/* Expected Threat */}
          <div className="bg-[#eaedff] p-2.5 rounded-lg flex flex-col justify-between border border-[#dae2fd]/60">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#404943] font-semibold tracking-wider">
                EXPECTED THREAT (xT)
              </span>
              <span className="material-symbols-outlined text-sm text-[#c00815]">bolt</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-[#0f5238]">
                +{netXtValue}
              </span>
              <span className="font-mono-data text-[10px] text-[#0f5238] bg-[#b1f0ce] px-1 rounded font-bold">
                Net Flow
              </span>
            </div>
          </div>

          {/* Progressive Passes */}
          <div className="bg-[#eaedff] p-2.5 rounded-lg flex flex-col justify-between border border-[#dae2fd]/60">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#404943] font-semibold tracking-wider">
                PROGRESSIVE PASSES
              </span>
              <span className="material-symbols-outlined text-sm text-[#404943]">fast_forward</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-[#131b2e]">
                {computedProgPasses}
              </span>
              <span className="font-mono-data text-[11px] text-[#404943]">
                {kpis.finalThird} Final Third
              </span>
            </div>
          </div>

          {/* Territorial Tilt */}
          <div className="bg-[#eaedff] p-2.5 rounded-lg flex flex-col justify-between col-span-2 sm:col-span-1 border border-[#dae2fd]/60">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#404943] font-semibold tracking-wider">
                TERRITORIAL TILT
              </span>
              <span className="material-symbols-outlined text-sm text-[#0051d5]">pie_chart</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-[#0051d5]">
                {kpis.territorialTilt}
              </span>
              <span className="font-mono-data text-[11px] text-[#404943]">
                {kpis.dominantStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Vector Engine Floating Context Bar */}
      <section className="w-full flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-lg border border-[#dae2fd]">
            <span className="font-mono-data text-[10px] text-[#404943] px-1 font-semibold">MODE:</span>
            <button
              onClick={() => {
                setIsDrawMode(true);
                onSelectTool('ground');
              }}
              type="button"
              className={`px-2.5 py-1 rounded font-mono-data text-[11px] font-bold flex items-center gap-1 transition-all ${
                isDrawMode
                  ? 'bg-[#0f5238] text-white shadow-xs'
                  : 'text-[#404943] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">timeline</span>
              <span>DRAW VECTOR</span>
            </button>
            <button
              onClick={() => {
                setIsDrawMode(false);
                onSelectTool('select');
              }}
              type="button"
              className={`px-2.5 py-1 rounded font-mono-data text-[11px] font-bold flex items-center gap-1 transition-all ${
                !isDrawMode
                  ? 'bg-[#0f5238] text-white shadow-xs'
                  : 'text-[#404943] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">pan_tool</span>
              <span>MOVE PLAYER</span>
            </button>
          </div>

          {/* Vector Types */}
          <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-lg border border-[#dae2fd]">
            <button
              onClick={() => {
                setActiveVectorType('ground');
                setIsDrawMode(true);
              }}
              type="button"
              className={`px-2 py-1 rounded font-mono-data text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                activeVectorType === 'ground' && isDrawMode
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'text-[#404943] hover:text-[#131b2e]'
              }`}
            >
              <span className="w-2 h-0.5 bg-[#0284c7] rounded-full"></span>
              <span>Ground Pass</span>
            </button>

            <button
              onClick={() => {
                setActiveVectorType('aerial');
                setIsDrawMode(true);
              }}
              type="button"
              className={`px-2 py-1 rounded font-mono-data text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                activeVectorType === 'aerial' && isDrawMode
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'text-[#404943] hover:text-[#131b2e]'
              }`}
            >
              <span className="w-2 h-0.5 border-t border-dashed border-[#0051d5]"></span>
              <span>Aerial / Cross</span>
            </button>

            <button
              onClick={() => {
                setActiveVectorType('through');
                setIsDrawMode(true);
              }}
              type="button"
              className={`px-2 py-1 rounded font-mono-data text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                activeVectorType === 'through' && isDrawMode
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'text-[#404943] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-xs text-[#c00815]">arrow_outward</span>
              <span>Through Run</span>
            </button>
          </div>
        </div>

        {/* Focused Tactical Node Badge */}
        {focusedPlayer && (
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] text-[#404943] uppercase tracking-wider font-semibold">
              FOCUSED TACTICAL NODE:
            </span>
            <div className="px-2.5 py-1 rounded-md bg-[#eaedff] text-[#131b2e] font-mono-data text-xs flex items-center gap-2 border border-[#dae2fd]">
              <span
                className={`w-2 h-2 rounded-full ${
                  focusedPlayer.id.startsWith('h') ? 'bg-[#0051d5]' : 'bg-[#c00815]'
                }`}
              ></span>
              <span className="font-bold">
                #{focusedPlayer.num} {focusedPlayer.name} ({focusedPlayer.pos})
              </span>
              <span className="text-[#0f5238] font-bold">xT: {focusedPlayer.xt}</span>
              {focusedPlayer.role && (
                <span className="text-[10px] text-[#707973] border-l border-[#dae2fd] pl-1.5 hidden md:inline">
                  {focusedPlayer.role}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Central Football Pitch */}
      <PitchCanvas
        homePlayers={homeTeam.players}
        awayPlayers={awayTeam.players}
        vectors={vectors}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={onSelectPlayer}
        onUpdatePlayerPos={onUpdatePlayerPos}
        onAddVector={onAddVector}
        onDeleteVector={onDeleteVector}
        showVoronoi={showVoronoi}
        showSpatialGrid={showSpatialGrid}
        currentTool={currentTool}
        activeVectorType={activeVectorType}
        isDrawMode={isDrawMode}
        isAnimating={isAnimating}
        onAnimationEnd={onAnimationEnd}
      />

      {/* Synchronized Side-by-Side Rosters */}
      <RosterPanel
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={onSelectPlayer}
        onUpdateTeam={onUpdateTeam}
        onUpdatePlayer={onUpdatePlayer}
      />
    </div>
  );
};
