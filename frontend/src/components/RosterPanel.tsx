import React, { useState } from 'react';
import { Player, Team } from '../types';

interface RosterPanelProps {
  homeTeam: Team;
  awayTeam: Team;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onUpdateTeam?: (teamId: 'home' | 'away', updatedData: Partial<Team>) => void;
  onUpdatePlayer?: (teamId: 'home' | 'away', playerId: string, updatedData: Partial<Player>) => void;
  onAddPlayer?: (teamId: 'home' | 'away') => void;
}

export const RosterPanel: React.FC<RosterPanelProps> = ({
  homeTeam,
  awayTeam,
  selectedPlayerId,
  onSelectPlayer,
  onUpdateTeam,
  onUpdatePlayer
}) => {
  // Editing state for Teams
  const [editingTeamId, setEditingTeamId] = useState<'home' | 'away' | null>(null);
  const [teamForm, setTeamForm] = useState<{
    name: string;
    formationType: string;
    possession: string;
    passSucc: string;
    ppda: string;
    transitions: string;
  }>({
    name: '',
    formationType: '',
    possession: '',
    passSucc: '',
    ppda: '',
    transitions: ''
  });

  // Editing state for Players
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState<{
    num: number;
    name: string;
    pos: string;
    passes: string;
    pct: string;
    xt: string;
    prog: number;
  }>({
    num: 0,
    name: '',
    pos: '',
    passes: '',
    pct: '',
    xt: '',
    prog: 0
  });

  // Start editing team
  const startEditTeam = (team: Team, isHome: boolean) => {
    setEditingTeamId(isHome ? 'home' : 'away');
    setTeamForm({
      name: team.name,
      formationType: team.formationType,
      possession: team.possession,
      passSucc: team.passSucc,
      ppda: team.ppda || '9.2',
      transitions: team.transitions || '18 High'
    });
  };

  // Save team edits
  const saveTeam = (isHome: boolean) => {
    if (onUpdateTeam && editingTeamId) {
      onUpdateTeam(editingTeamId, {
        name: teamForm.name.trim() || (isHome ? 'HOME TEAM' : 'AWAY TEAM'),
        formationType: teamForm.formationType.trim() || '4-3-3',
        possession: teamForm.possession.trim() || '50.0%',
        passSucc: teamForm.passSucc.trim() || '85.0%',
        ppda: teamForm.ppda.trim(),
        transitions: teamForm.transitions.trim()
      });
    }
    setEditingTeamId(null);
  };

  // Start editing player
  const startEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setPlayerForm({
      num: player.num,
      name: player.name,
      pos: player.pos,
      passes: player.passes,
      pct: player.pct,
      xt: player.xt,
      prog: player.prog
    });
  };

  // Save player edits
  const savePlayer = (isHome: boolean) => {
    if (onUpdatePlayer && editingPlayerId) {
      onUpdatePlayer(isHome ? 'home' : 'away', editingPlayerId, {
        num: Number(playerForm.num) || 1,
        name: playerForm.name.trim() || 'Player',
        pos: playerForm.pos.trim().toUpperCase() || 'CM',
        passes: playerForm.passes.trim() || '20/25',
        pct: playerForm.pct.trim() || '80%',
        xt: playerForm.xt.startsWith('+') ? playerForm.xt.trim() : `+${playerForm.xt.trim()}`,
        prog: Number(playerForm.prog) || 0
      });
    }
    setEditingPlayerId(null);
  };

  const renderTeamColumn = (team: Team, isHome: boolean) => {
    const isEditingThisTeam = editingTeamId === (isHome ? 'home' : 'away');

    return (
      <div className="flex flex-col bg-[#f2f3ff] rounded-xl p-3 shadow-md border border-[#eaedff]">
        {/* Team Header */}
        <div className="pb-2 bg-[#f2f3ff] border-b border-[#dae2fd]">
          {isEditingThisTeam ? (
            /* Team Edit Form */
            <div className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-[#dae2fd] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-[10px] text-[#0f5238] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">edit</span>
                  Edit Team Data
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => saveTeam(isHome)}
                    type="button"
                    className="px-2 py-0.5 rounded bg-[#0f5238] text-white font-mono-data text-[10px] font-bold flex items-center gap-1 hover:bg-[#2d6a4f] shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-xs">check</span>
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTeamId(null)}
                    type="button"
                    className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#707973] font-mono-data text-[10px] font-bold hover:bg-[#eaedff]"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">Team Name</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                  />
                </div>
                <div>
                  <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">Formation / Style</label>
                  <input
                    type="text"
                    value={teamForm.formationType}
                    onChange={(e) => setTeamForm({ ...teamForm, formationType: e.target.value })}
                    className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {isHome ? (
                  <>
                    <div>
                      <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">Possession</label>
                      <input
                        type="text"
                        value={teamForm.possession}
                        onChange={(e) => setTeamForm({ ...teamForm, possession: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-mono-data font-bold text-[#0051d5] focus:outline-hidden focus:border-[#0051d5]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">Pass Success</label>
                      <input
                        type="text"
                        value={teamForm.passSucc}
                        onChange={(e) => setTeamForm({ ...teamForm, passSucc: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-mono-data font-bold text-[#0f5238] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">PPDA</label>
                      <input
                        type="text"
                        value={teamForm.ppda}
                        onChange={(e) => setTeamForm({ ...teamForm, ppda: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-mono-data font-bold text-[#c00815] focus:outline-hidden focus:border-[#c00815]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[9px] text-[#707973] block mb-0.5">Transitions</label>
                      <input
                        type="text"
                        value={teamForm.transitions}
                        onChange={(e) => setTeamForm({ ...teamForm, transitions: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-mono-data font-bold text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Normal Team Header View with Pencil Button */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-display text-sm font-bold shadow-sm ${
                    isHome ? 'bg-[#0284c7]' : 'bg-[#c00815]'
                  }`}
                >
                  {team.initial || team.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm text-[#131b2e] font-bold tracking-tight">
                      {team.name}
                    </span>
                    <button
                      onClick={() => startEditTeam(team, isHome)}
                      className="p-0.5 rounded text-[#707973] hover:text-[#0f5238] hover:bg-white transition-colors"
                      title="Edit team name and match stats"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                  </div>
                  <span
                    className={`font-mono-data text-[10px] font-semibold tracking-wider ${
                      isHome ? 'text-[#0f5238]' : 'text-[#c00815]'
                    }`}
                  >
                    FORMATION: {team.formationType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-right">
                {isHome ? (
                  <>
                    <div className="bg-[#eaedff] px-2 py-0.5 rounded border border-[#dae2fd]">
                      <span className="font-mono-data text-[9px] text-[#404943] block">POSSESSION</span>
                      <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                        {team.possession}
                      </span>
                    </div>
                    <div className="bg-[#eaedff] px-2 py-0.5 rounded border border-[#dae2fd]">
                      <span className="font-mono-data text-[9px] text-[#404943] block">PASS SUCC.</span>
                      <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                        {team.passSucc}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-[#eaedff] px-2 py-0.5 rounded border border-[#dae2fd]">
                      <span className="font-mono-data text-[9px] text-[#404943] block">PPDA</span>
                      <span className="font-mono-data text-xs font-bold text-[#c00815]">
                        {team.ppda || '9.2'}
                      </span>
                    </div>
                    <div className="bg-[#eaedff] px-2 py-0.5 rounded border border-[#dae2fd]">
                      <span className="font-mono-data text-[9px] text-[#404943] block">TRANSITIONS</span>
                      <span className="font-mono-data text-xs font-bold text-[#131b2e]">
                        {team.transitions || '18 High'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-1.5 mt-2 overflow-y-auto max-h-[480px] pr-1">
          {team.players.map((player) => {
            const isSelected = player.id === selectedPlayerId;
            const isEditing = editingPlayerId === player.id;

            if (isEditing) {
              /* Player Inline Edit Mode */
              return (
                <div
                  key={player.id}
                  className="p-2.5 rounded-lg bg-white border-2 border-[#0f5238] shadow-md flex flex-col gap-2 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#eaedff]">
                    <span className="font-mono-data text-[10px] text-[#0f5238] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">edit</span>
                      Edit Player #{player.num}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => savePlayer(isHome)}
                        type="button"
                        className="px-2.5 py-0.5 rounded bg-[#0f5238] text-white font-mono-data text-[10px] font-bold flex items-center gap-1 hover:bg-[#2d6a4f] shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-xs">check</span>
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        type="button"
                        className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#707973] font-mono-data text-[10px] font-bold hover:bg-[#eaedff]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Player Identity Row */}
                  <div className="grid grid-cols-12 gap-1.5">
                    <div className="col-span-3">
                      <label className="font-mono-data text-[8px] text-[#707973] block">Number</label>
                      <input
                        type="number"
                        value={playerForm.num}
                        onChange={(e) => setPlayerForm({ ...playerForm, num: Number(e.target.value) })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-xs font-mono-data font-bold text-center text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="font-mono-data text-[8px] text-[#707973] block">Player Name</label>
                      <input
                        type="text"
                        value={playerForm.name}
                        onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-0.5 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="font-mono-data text-[8px] text-[#707973] block">Pos</label>
                      <input
                        type="text"
                        value={playerForm.pos}
                        onChange={(e) => setPlayerForm({ ...playerForm, pos: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1 py-0.5 text-xs font-mono-data font-bold text-center text-[#131b2e] uppercase focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                  </div>

                  {/* Player Match Stats Row */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#eaedff]">
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block">Pass Vol</label>
                      <input
                        type="text"
                        placeholder="46/55"
                        value={playerForm.passes}
                        onChange={(e) => setPlayerForm({ ...playerForm, passes: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block">Pass %</label>
                      <input
                        type="text"
                        placeholder="83%"
                        value={playerForm.pct}
                        onChange={(e) => setPlayerForm({ ...playerForm, pct: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block">xT Created</label>
                      <input
                        type="text"
                        placeholder="+0.58"
                        value={playerForm.xt}
                        onChange={(e) => setPlayerForm({ ...playerForm, xt: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data font-bold text-[#0f5238] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block">Prog Pass</label>
                      <input
                        type="number"
                        placeholder="14"
                        value={playerForm.prog}
                        onChange={(e) => setPlayerForm({ ...playerForm, prog: Number(e.target.value) })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data font-bold text-[#0051d5] focus:outline-hidden focus:border-[#0051d5]"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            /* Normal Player View with Pencil Icon */
            return (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player.id)}
                className={`p-2 rounded cursor-pointer transition-all flex items-center justify-between border group ${
                  isSelected
                    ? 'bg-[#e2e7ff] shadow-sm pl-3 border-l-4 border-l-[#2d6a4f] border-[#dae2fd]'
                    : 'bg-[#eaedff]/60 hover:bg-[#e2e7ff] border-transparent'
                }`}
              >
                {/* Player identity */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-white font-mono-data text-xs font-bold shrink-0 ${
                      isHome ? 'bg-[#0284c7]' : 'bg-[#c00815]'
                    }`}
                  >
                    {player.num}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-xs text-[#131b2e] font-semibold truncate">
                        {player.name}
                      </span>
                      <span className="font-mono-data text-[10px] text-[#404943] bg-white px-1 rounded border border-[#dae2fd]">
                        {player.pos}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditPlayer(player);
                        }}
                        className="opacity-60 group-hover:opacity-100 p-0.5 rounded text-[#707973] hover:text-[#0f5238] hover:bg-white transition-all ml-0.5"
                        title="Edit player name and stats"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                    </div>
                    <span className="font-mono-data text-[10px] text-[#707973]">
                      Pass Vol: {player.passes} ({player.pct})
                    </span>
                  </div>
                </div>

                {/* Tactical Metrics */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono-data text-[9px] text-[#707973] block">xT CREATED</span>
                    <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                      {player.xt}
                    </span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="font-mono-data text-[9px] text-[#707973] block">PROG. PASS</span>
                    <span className="font-mono-data text-xs font-bold text-[#0051d5]">
                      {player.prog}
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isSelected ? 'text-[#0f5238]' : 'text-[#707973]'
                    }`}
                  >
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderTeamColumn(homeTeam, true)}
        {renderTeamColumn(awayTeam, false)}
      </div>
    </section>
  );
};
