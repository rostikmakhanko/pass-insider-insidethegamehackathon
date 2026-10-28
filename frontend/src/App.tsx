import React, { useState } from 'react';
import {
  TabType,
  TacticalTool,
  VectorType,
  MatchSession,
  Team,
  Player,
  PassVector
} from './types';
import {
  MOCK_MATCH_SESSIONS,
  FORMATION_PRESETS
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PitchWorkbench } from './components/PitchWorkbench';
import { NetworkMatrixView } from './components/NetworkMatrixView';
import { VoronoiXtView } from './components/VoronoiXtView';
import { MatchVaultView } from './components/MatchVaultView';
import { ExportModal } from './components/ExportModal';
import { PresetModal } from './components/PresetModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { AiInsightsPanel } from './components/AiInsightsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workbench');
  const [sessions, setSessions] = useState<MatchSession[]>(MOCK_MATCH_SESSIONS);
  const [activeSession, setActiveSession] = useState<MatchSession>(MOCK_MATCH_SESSIONS[0]);
  
  // Tactical Board State
  const [homeTeam, setHomeTeam] = useState<Team>(MOCK_MATCH_SESSIONS[0].homeTeam);
  const [awayTeam, setAwayTeam] = useState<Team>(MOCK_MATCH_SESSIONS[0].awayTeam);
  const [vectors, setVectors] = useState<PassVector[]>(MOCK_MATCH_SESSIONS[0].vectors);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('h17'); // De Bruyne

  // Tool Modes
  const [currentTool, setCurrentTool] = useState<TacticalTool>('ground');
  const [activeVectorType, setActiveVectorType] = useState<VectorType>('ground');
  const [isDrawMode, setIsDrawMode] = useState<boolean>(true);
  const [showVoronoi, setShowVoronoi] = useState<boolean>(false);
  const [showSpatialGrid, setShowSpatialGrid] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState<boolean>(true);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isPresetOpen, setIsPresetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Change Active Session
  const handleSelectSession = (sess: MatchSession) => {
    setActiveSession(sess);
    setHomeTeam(sess.homeTeam);
    setAwayTeam(sess.awayTeam);
    setVectors(sess.vectors);
    setSelectedPlayerId(sess.homeTeam.players[6]?.id || 'h1');
  };

  // Update a Match Session in Vault
  const handleUpdateSession = (sessionId: string, updatedData: Partial<MatchSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updatedData } : s))
    );
    if (activeSession.id === sessionId) {
      setActiveSession((prev) => ({ ...prev, ...updatedData }));
      if (updatedData.homeTeam) setHomeTeam(updatedData.homeTeam);
      if (updatedData.awayTeam) setAwayTeam(updatedData.awayTeam);
      if (updatedData.vectors) setVectors(updatedData.vectors);
    }
  };

  // Duplicate a Match Session
  const handleDuplicateSession = (session: MatchSession) => {
    const newId = `session_${Date.now()}`;
    const duplicated: MatchSession = {
      ...session,
      id: newId,
      title: `${session.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      homeTeam: {
        ...session.homeTeam,
        players: session.homeTeam.players.map((p) => ({ ...p }))
      },
      awayTeam: {
        ...session.awayTeam,
        players: session.awayTeam.players.map((p) => ({ ...p }))
      },
      vectors: session.vectors.map((v) => ({ ...v, id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` }))
    };
    setSessions((prev) => [duplicated, ...prev]);
  };

  // Create a New Match Session
  const handleCreateSession = (customTitle?: string, customComp?: string) => {
    const newId = `session_${Date.now()}`;
    const newSession: MatchSession = {
      id: newId,
      title: customTitle || 'New Tactical Analysis Session',
      competition: customComp || 'Domestic / International League',
      date: new Date().toISOString().split('T')[0],
      homeTeam: {
        ...MOCK_MATCH_SESSIONS[0].homeTeam,
        name: 'HOME TEAM',
        players: MOCK_MATCH_SESSIONS[0].homeTeam.players.map((p) => ({ ...p }))
      },
      awayTeam: {
        ...MOCK_MATCH_SESSIONS[0].awayTeam,
        name: 'AWAY TEAM',
        players: MOCK_MATCH_SESSIONS[0].awayTeam.players.map((p) => ({ ...p }))
      },
      vectors: [],
      kpis: {
        passAcc: '85.0%',
        passAccDelta: '+0.0% vs avg',
        avgPassDist: '20.0m',
        tempo: 'Tempo: Balanced',
        xt: '+0.00',
        progPasses: 10,
        finalThird: 5,
        territorialTilt: '50% / 50%',
        dominantStatus: 'Even'
      }
    };
    setSessions((prev) => [newSession, ...prev]);
    handleSelectSession(newSession);
  };

  // Delete a Match Session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (activeSession.id === sessionId && remaining.length > 0) {
        handleSelectSession(remaining[0]);
      }
      return remaining;
    });
  };

  // Move Player Position
  const handleUpdatePlayerPos = (id: string, x: number, y: number) => {
    if (id.startsWith('h')) {
      setHomeTeam((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, x, y } : p))
      }));
    } else {
      setAwayTeam((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, x, y } : p))
      }));
    }
  };

  // Add Drawn Vector
  const handleAddVector = (fromId: string, toId: string, type: VectorType) => {
    const all = [...homeTeam.players, ...awayTeam.players];
    const pFrom = all.find((p) => p.id === fromId);
    const pTo = all.find((p) => p.id === toId);

    if (!pFrom || !pTo) return;

    const dx = (pTo.x - pFrom.x) * 1.05;
    const dy = (pTo.y - pFrom.y) * 0.68;
    const distMeters = Math.round(Math.hypot(dx, dy));
    const randomXt = (0.04 + Math.random() * 0.22).toFixed(2);
    const speed = Math.round(14 + Math.random() * 8);

    const newVec: PassVector = {
      id: `v_${Date.now()}`,
      from: fromId,
      to: toId,
      type,
      xt: `+${randomXt}`,
      dist: `${distMeters}m`,
      vel: `${speed}m/s`
    };

    setVectors((prev) => [...prev, newVec]);
  };

  // Delete Individual Vector
  const handleDeleteVector = (idx: number) => {
    setVectors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reset Vectors
  const handleResetVectors = () => {
    setVectors([]);
  };

  // Update Team Data
  const handleUpdateTeam = (teamId: 'home' | 'away', updatedData: Partial<Team>) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({ ...prev, ...updatedData }));
    } else {
      setAwayTeam((prev) => ({ ...prev, ...updatedData }));
    }
  };

  // Update Player Data
  const handleUpdatePlayer = (teamId: 'home' | 'away', playerId: string, updatedData: Partial<Player>) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === playerId ? { ...p, ...updatedData } : p))
      }));
    } else {
      setAwayTeam((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === playerId ? { ...p, ...updatedData } : p))
      }));
    }
  };

  // Apply Tactical Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = FORMATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setHomeTeam((prev) => ({
      ...prev,
      formationType: preset.name.toUpperCase(),
      players: prev.players.map((p, idx) => {
        if (preset.coords[idx]) {
          return { ...p, x: preset.coords[idx].x, y: preset.coords[idx].y };
        }
        return p;
      })
    }));
  };

  // Invert Pitch Axis
  const handleInvertPitchAxis = () => {
    setHomeTeam((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({ ...p, x: Math.round(100 - p.x) }))
    }));
    setAwayTeam((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({ ...p, x: Math.round(100 - p.x) }))
    }));
  };

  // Select Sidebar Tool
  const handleSelectTool = (tool: TacticalTool) => {
    setCurrentTool(tool);
    if (tool === 'select') {
      setIsDrawMode(false);
    } else if (tool === 'ground') {
      setIsDrawMode(true);
      setActiveVectorType('ground');
    } else if (tool === 'aerial') {
      setIsDrawMode(true);
      setActiveVectorType('aerial');
    } else if (tool === 'through') {
      setIsDrawMode(true);
      setActiveVectorType('through');
    } else if (tool === 'caliper') {
      setIsDrawMode(false);
    }
  };

  const calculatedNetXt = (1.12 + vectors.length * 0.06).toFixed(2);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col selection:bg-[#2d6a4f] selection:text-white">
      {/* Top Fixed Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSession={activeSession}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        isDrawMode={isDrawMode}
        onToggleDrawMode={() => setIsDrawMode(!isDrawMode)}
        onClear={handleResetVectors}
        onAnimate={() => setIsAnimating(!isAnimating)}
        isAnimating={isAnimating}
        onOpenPreset={() => setIsPresetOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isAiInsightsOpen={isAiInsightsOpen}
        onToggleAiInsights={() => setIsAiInsightsOpen((prev) => !prev)}
        vectorCount={vectors.length}
      />

      {/* Main Layout Container with Left Sidebar & Right AI Insights Panel */}
      <div className="flex flex-1 pt-16">
        <Sidebar
          currentTool={currentTool}
          onSelectTool={handleSelectTool}
          showSpatialGrid={showSpatialGrid}
          onToggleSpatialGrid={() => setShowSpatialGrid(!showSpatialGrid)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleLayerMenu={() => setShowVoronoi(!showVoronoi)}
          isAiInsightsOpen={isAiInsightsOpen}
          onToggleAiInsights={() => setIsAiInsightsOpen((prev) => !prev)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-between">
          <div>
            {activeTab === 'workbench' && (
              <PitchWorkbench
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                vectors={vectors}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                onUpdatePlayerPos={handleUpdatePlayerPos}
                onAddVector={handleAddVector}
                onDeleteVector={handleDeleteVector}
                onResetVectors={handleResetVectors}
                onApplyPreset={handleApplyPreset}
                onInvertPitchAxis={handleInvertPitchAxis}
                showVoronoi={showVoronoi}
                onToggleVoronoi={() => setShowVoronoi(!showVoronoi)}
                showSpatialGrid={showSpatialGrid}
                currentTool={currentTool}
                onSelectTool={handleSelectTool}
                activeVectorType={activeVectorType}
                setActiveVectorType={setActiveVectorType}
                isDrawMode={isDrawMode}
                setIsDrawMode={setIsDrawMode}
                isAnimating={isAnimating}
                onAnimationEnd={() => setIsAnimating(false)}
                isAiInsightsOpen={isAiInsightsOpen}
                onToggleAiInsights={() => setIsAiInsightsOpen((prev) => !prev)}
                onUpdateTeam={handleUpdateTeam}
                onUpdatePlayer={handleUpdatePlayer}
                kpis={activeSession.kpis}
              />
            )}

            {activeTab === 'matrix' && (
              <NetworkMatrixView
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                onSelectPlayer={setSelectedPlayerId}
              />
            )}

            {activeTab === 'voronoi' && (
              <VoronoiXtView homeTeam={homeTeam} awayTeam={awayTeam} />
            )}

            {activeTab === 'vault' && (
              <MatchVaultView
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={handleSelectSession}
                onNavigateToWorkbench={() => setActiveTab('workbench')}
                onUpdateSession={handleUpdateSession}
                onDuplicateSession={handleDuplicateSession}
                onCreateSession={handleCreateSession}
                onDeleteSession={handleDeleteSession}
              />
            )}
          </div>

          {/* Bottom Precision Telemetry Footer */}
          <div className="mt-8">
            <Footer vectorCount={vectors.length} netXt={calculatedNetXt} />
          </div>
        </main>

        {/* Right Side Tactical AI Insights Chat Panel */}
        <AiInsightsPanel
          isOpen={isAiInsightsOpen}
          onClose={() => setIsAiInsightsOpen(false)}
          vectors={vectors}
          allPlayers={[...homeTeam.players, ...awayTeam.players]}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
          onDeleteVector={handleDeleteVector}
          onSelectPlayer={setSelectedPlayerId}
        />
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={activeSession}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        vectors={vectors}
        netXt={calculatedNetXt}
      />

      <PresetModal
        isOpen={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
