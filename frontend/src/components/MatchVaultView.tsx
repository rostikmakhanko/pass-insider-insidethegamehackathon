import React, { useState } from 'react';
import { MatchSession } from '../types';

interface MatchVaultViewProps {
  sessions: MatchSession[];
  activeSession: MatchSession;
  onSelectSession: (session: MatchSession) => void;
  onNavigateToWorkbench: () => void;
  onUpdateSession?: (sessionId: string, updatedData: Partial<MatchSession>) => void;
  onDuplicateSession?: (session: MatchSession) => void;
  onCreateSession?: (title?: string, competition?: string) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const MatchVaultView: React.FC<MatchVaultViewProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  onNavigateToWorkbench,
  onUpdateSession,
  onDuplicateSession,
  onCreateSession,
  onDeleteSession
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newComp, setNewComp] = useState('');

  // Editing state for match cards
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    competition: string;
    date: string;
    passAcc: string;
    xt: string;
  }>({
    title: '',
    competition: '',
    date: '',
    passAcc: '',
    xt: ''
  });

  const phases = [
    { label: "0' - 15'", value: '0-15', note: 'Opening Press & Feeling Out Phase' },
    { label: "15' - 30'", value: '15-30', note: 'Midfield Overloads & Sustained Possession' },
    { label: "30' - 45'", value: '30-45', note: 'Direct Transitions & Box Infiltrations' },
    { label: "45' - 60'", value: '45-60', note: 'Tactical Adjustments & Rest Defense' },
    { label: "60' - 75'", value: '60-75', note: 'High Intensity Counter-Pressing Phase' },
    { label: "75' - 90'+", value: '75-90', note: 'Endgame Chaos & Deep Block Stature' }
  ];

  const handleStartEdit = (e: React.MouseEvent, sess: MatchSession) => {
    e.stopPropagation();
    setEditingSessionId(sess.id);
    setEditForm({
      title: sess.title,
      competition: sess.competition,
      date: sess.date,
      passAcc: sess.kpis.passAcc,
      xt: sess.kpis.xt
    });
  };

  const handleSaveEdit = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (onUpdateSession) {
      onUpdateSession(sessionId, {
        title: editForm.title.trim() || 'Untitled Tactical Session',
        competition: editForm.competition.trim() || 'Custom Competition',
        date: editForm.date.trim() || new Date().toISOString().split('T')[0],
        kpis: {
          ...sessions.find((s) => s.id === sessionId)!.kpis,
          passAcc: editForm.passAcc.trim() || '85.0%',
          xt: editForm.xt.startsWith('+') ? editForm.xt.trim() : `+${editForm.xt.trim()}`
        }
      });
    }
    setEditingSessionId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateSession) {
      onCreateSession(
        newTitle.trim() || 'New Tactical Analysis Session',
        newComp.trim() || 'Domestic / International League'
      );
    }
    setNewTitle('');
    setNewComp('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2f3ff] p-4 rounded-xl border border-[#eaedff]">
        <div>
          <h2 className="font-display text-lg font-bold text-[#131b2e] tracking-tight">
            Match Vault &amp; Telemetry Archives
          </h2>
          <p className="font-sans text-xs text-[#707973] mt-0.5">
            Historical match playbooks, phase-by-phase tactical telemetry, and custom session managers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Session Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0051d5] text-white font-sans text-xs font-semibold flex items-center gap-1.5 hover:bg-[#003ea8] transition-all shadow-sm active:scale-95"
            title="Create a new tactical match session"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>New Session</span>
          </button>

          <button
            onClick={onNavigateToWorkbench}
            className="px-3 py-1.5 rounded-lg bg-[#0f5238] text-white font-sans text-xs font-semibold flex items-center gap-1.5 hover:bg-[#2d6a4f] transition-all shadow-sm active:scale-95"
            title="Open selected session in Pitch Workbench"
          >
            <span className="material-symbols-outlined text-sm">sports_soccer</span>
            <span>Open in Pitch Workbench</span>
          </button>
        </div>
      </div>

      {/* New Session Inline Creator Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 bg-white rounded-xl border-2 border-[#0051d5] shadow-md flex flex-col gap-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
            <span className="font-display text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0051d5] text-sm">note_add</span>
              Create New Match Session
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-[#707973] hover:text-[#131b2e] text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono-data text-[9px] text-[#707973] block mb-1">
                Match Title (e.g. Manchester Blue vs Arsenal)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Manchester Blue vs Liverpool FC - Matchday 22"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0051d5]"
              />
            </div>
            <div>
              <label className="font-mono-data text-[9px] text-[#707973] block mb-1">
                Competition / Phase
              </label>
              <input
                type="text"
                placeholder="e.g. UEFA Champions League · Quarter-Final"
                value={newComp}
                onChange={(e) => setNewComp(e.target.value)}
                className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0051d5]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#eaedff]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#404943] hover:bg-[#f2f3ff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#0051d5] text-white text-xs font-bold hover:bg-[#003ea8] shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">check</span>
              Save &amp; Load Session
            </button>
          </div>
        </form>
      )}

      {/* Match Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick Add Session Dashed Card */}
        <div
          onClick={() => setIsCreating(true)}
          className="p-4 rounded-xl border-2 border-dashed border-[#dae2fd] hover:border-[#0051d5] bg-[#f2f3ff]/40 hover:bg-[#f2f3ff] cursor-pointer transition-all flex flex-col items-center justify-center min-h-[190px] text-center group"
          title="Create a new match session"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-2xs group-hover:bg-[#0051d5] group-hover:text-white text-[#0051d5] flex items-center justify-center transition-colors mb-2">
            <span className="material-symbols-outlined text-xl">add</span>
          </div>
          <span className="font-display text-xs font-bold text-[#131b2e] group-hover:text-[#0051d5] transition-colors">
            Create New Session
          </span>
          <span className="font-sans text-[11px] text-[#707973] mt-1 max-w-[200px]">
            Start fresh tactical whiteboard with blank vectors and 22-player squads
          </span>
        </div>

        {sessions.map((sess) => {
          const isSelected = sess.id === activeSession.id;
          const isEditing = editingSessionId === sess.id;

          if (isEditing) {
            /* Inline Edit Mode Card */
            return (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-white shadow-md border-2 border-[#0f5238] flex flex-col justify-between gap-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[#eaedff]">
                  <span className="font-mono-data text-[10px] text-[#0f5238] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit</span>
                    Edit Match Session
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteSession) onDeleteSession(sess.id);
                      }}
                      type="button"
                      className="p-1 rounded text-[#707973] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors mr-0.5"
                      title="Delete this session"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                    <button
                      onClick={(e) => handleSaveEdit(e, sess.id)}
                      type="button"
                      className="px-2 py-0.5 rounded bg-[#0f5238] text-white font-mono-data text-[10px] font-bold flex items-center gap-1 hover:bg-[#2d6a4f] shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(null);
                      }}
                      type="button"
                      className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#707973] font-mono-data text-[10px] font-bold hover:bg-[#eaedff]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="font-mono-data text-[8px] text-[#707973] block mb-0.5">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs font-semibold text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                    />
                  </div>
                  <div>
                    <label className="font-mono-data text-[8px] text-[#707973] block mb-0.5">Competition</label>
                    <input
                      type="text"
                      value={editForm.competition}
                      onChange={(e) => setEditForm({ ...editForm, competition: e.target.value })}
                      className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-2 py-1 text-xs text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block mb-0.5">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data text-[#131b2e] focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block mb-0.5">Pass Acc</label>
                      <input
                        type="text"
                        value={editForm.passAcc}
                        onChange={(e) => setEditForm({ ...editForm, passAcc: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data text-[#0051d5] font-bold focus:outline-hidden focus:border-[#0051d5]"
                      />
                    </div>
                    <div>
                      <label className="font-mono-data text-[8px] text-[#707973] block mb-0.5">Net xT</label>
                      <input
                        type="text"
                        value={editForm.xt}
                        onChange={(e) => setEditForm({ ...editForm, xt: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#dae2fd] rounded px-1.5 py-0.5 text-[10px] font-mono-data text-[#0f5238] font-bold focus:outline-hidden focus:border-[#0f5238]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          /* Normal Match Card with Edit & Duplicate Buttons */
          return (
            <div
              key={sess.id}
              onClick={() => onSelectSession(sess)}
              className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white shadow-md border-[#0051d5] ring-2 ring-[#0051d5]/20'
                  : 'bg-white hover:bg-[#f2f3ff] border-[#eaedff]'
              }`}
            >
              <div>
                {/* Card Header with Badges & Actions */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-data text-[10px] text-[#0f5238] font-bold">
                    {sess.date}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Duplicate Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDuplicateSession) onDuplicateSession(sess);
                      }}
                      className="p-1 rounded text-[#707973] hover:text-[#0051d5] hover:bg-[#eaedff] transition-colors"
                      title="Duplicate this match session"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleStartEdit(e, sess)}
                      className="p-1 rounded text-[#707973] hover:text-[#0f5238] hover:bg-[#eaedff] transition-colors"
                      title="Edit match details"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteSession) onDeleteSession(sess.id);
                      }}
                      className="p-1 rounded text-[#707973] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors"
                      title="Delete this match session"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-[#e2e7ff] text-[#0051d5] font-mono-data text-[9px] font-bold ml-1">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-sm font-bold text-[#131b2e] leading-snug group-hover:text-[#0051d5] transition-colors">
                  {sess.title}
                </h3>
                <p className="font-sans text-xs text-[#707973] mt-1">{sess.competition}</p>

                {/* Match Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#eaedff]">
                  <div className="bg-[#f2f3ff] p-2 rounded">
                    <span className="font-mono-data text-[9px] text-[#707973] block">PASS ACC</span>
                    <span className="font-mono-data text-xs font-bold text-[#131b2e]">
                      {sess.kpis.passAcc}
                    </span>
                  </div>
                  <div className="bg-[#f2f3ff] p-2 rounded">
                    <span className="font-mono-data text-[9px] text-[#707973] block">NET xT</span>
                    <span className="font-mono-data text-xs font-bold text-[#0f5238]">
                      {sess.kpis.xt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between text-xs font-sans font-medium text-[#0051d5]">
                <span>{isSelected ? 'Currently Loaded' : 'Select Session'}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
