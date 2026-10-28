import React, { useRef, useState, useEffect } from 'react';
import { Player, PassVector, VectorType, TacticalTool } from '../types';

interface PitchCanvasProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  vectors: PassVector[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onUpdatePlayerPos: (id: string, x: number, y: number) => void;
  onAddVector: (fromId: string, toId: string, type: VectorType) => void;
  onDeleteVector: (index: number) => void;
  showVoronoi: boolean;
  showSpatialGrid: boolean;
  currentTool: TacticalTool;
  activeVectorType: VectorType;
  isDrawMode: boolean;
  isAnimating: boolean;
  onAnimationEnd: () => void;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  homePlayers,
  awayPlayers,
  vectors,
  selectedPlayerId,
  onSelectPlayer,
  onUpdatePlayerPos,
  onAddVector,
  onDeleteVector,
  showVoronoi,
  showSpatialGrid,
  currentTool,
  activeVectorType,
  isDrawMode,
  isAnimating,
  onAnimationEnd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingSourcePlayer, setDrawingSourcePlayer] = useState<Player | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  
  // Caliper state
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);

  // Ball animation state
  const [animatedBallPos, setAnimatedBallPos] = useState<{ x: number; y: number } | null>(null);
  const [activeVectorIdx, setActiveVectorIdx] = useState<number>(-1);

  const allPlayers = [...homePlayers, ...awayPlayers];
  const getPlayer = (id: string) => allPlayers.find((p) => p.id === id);

  // Handle Ball Animation sequence
  useEffect(() => {
    if (!isAnimating || vectors.length === 0) {
      setAnimatedBallPos(null);
      setActiveVectorIdx(-1);
      return;
    }

    let currentVec = 0;
    let startTime: number | null = null;
    const durationPerVector = 1200; // ms

    let animFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationPerVector);

      if (currentVec < vectors.length) {
        const vec = vectors[currentVec];
        const p1 = getPlayer(vec.from);
        const p2 = getPlayer(vec.to);

        if (p1 && p2) {
          const curX = p1.x + (p2.x - p1.x) * progress;
          let curY = p1.y + (p2.y - p1.y) * progress;

          // If aerial arc, apply parabolic curve elevation
          if (vec.type === 'aerial') {
            const arcOffset = Math.sin(progress * Math.PI) * 12;
            curY -= arcOffset;
          }

          setAnimatedBallPos({ x: curX, y: curY });
          setActiveVectorIdx(currentVec);
        }

        if (progress >= 1) {
          currentVec++;
          startTime = timestamp;
          if (currentVec >= vectors.length) {
            onAnimationEnd();
            return;
          }
        }
        animFrame = requestAnimationFrame(animate);
      } else {
        onAnimationEnd();
      }
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isAnimating, vectors]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));

    setMousePos({ x: xPct, y: yPct });

    // Dragging Player
    if (draggingPlayerId) {
      onUpdatePlayerPos(draggingPlayerId, Math.round(xPct), Math.round(yPct));
    }

    // Caliper measurement dragging
    if (currentTool === 'caliper' && caliperStart && !caliperEnd) {
      // live updating
    }
  };

  const handleMouseUp = () => {
    setDraggingPlayerId(null);
  };

  const handlePitchClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Caliper tool click
    if (currentTool === 'caliper') {
      if (!caliperStart) {
        setCaliperStart({ x: xPct, y: yPct });
        setCaliperEnd(null);
      } else if (!caliperEnd) {
        setCaliperEnd({ x: xPct, y: yPct });
      } else {
        setCaliperStart({ x: xPct, y: yPct });
        setCaliperEnd(null);
      }
      return;
    }

    // Cancel drawing line if clicked empty pitch
    if (drawingSourcePlayer) {
      setDrawingSourcePlayer(null);
    }
  };

  const handlePlayerMouseDown = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    onSelectPlayer(player.id);

    // If in move tool or select tool, initiate dragging
    if (currentTool === 'select' || !isDrawMode) {
      setDraggingPlayerId(player.id);
    }
  };

  const handlePlayerClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    onSelectPlayer(player.id);

    // Draw Vector Mode
    if (isDrawMode || currentTool === 'ground' || currentTool === 'aerial' || currentTool === 'through') {
      if (!drawingSourcePlayer) {
        setDrawingSourcePlayer(player);
      } else {
        if (drawingSourcePlayer.id !== player.id) {
          const vType =
            currentTool === 'aerial'
              ? 'aerial'
              : currentTool === 'through'
              ? 'through'
              : activeVectorType;
          onAddVector(drawingSourcePlayer.id, player.id, vType);
        }
        setDrawingSourcePlayer(null);
      }
    }
  };

  // Caliper distance calculation in meters (pitch is 105m x 68m)
  const caliperDistance = () => {
    if (!caliperStart) return null;
    const pEnd = caliperEnd || mousePos;
    if (!pEnd) return null;
    const dxMeters = ((pEnd.x - caliperStart.x) / 100) * 105;
    const dyMeters = ((pEnd.y - caliperStart.y) / 100) * 68;
    return Math.round(Math.hypot(dxMeters, dyMeters) * 10) / 10;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white shadow-xl p-2 select-none border border-[#eaedff]">
      {/* 105m x 68m Regulation Aspect Ratio container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handlePitchClick}
        className="relative w-full aspect-[16/9] md:aspect-[1.544] rounded-lg overflow-hidden bg-[#1b4332] shadow-inner cursor-crosshair"
      >
        {/* Realistic Turf Mowing Stripes (16 bands) */}
        <div className="absolute inset-0 flex flex-row pointer-events-none opacity-90">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-[#1b4332]' : 'bg-[#204e3b]'}`}
            />
          ))}
        </div>

        {/* 18-Zone Positional Play Spatial Grid Overlay */}
        {showSpatialGrid && (
          <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-6 grid-rows-3 border-2 border-white/20">
            {[...Array(18)].map((_, i) => {
              const zoneNum = i + 1;
              const isZone14 = zoneNum === 11;
              const isHalfSpace = zoneNum === 8 || zoneNum === 14;
              return (
                <div
                  key={i}
                  className={`border border-white/20 flex flex-col justify-between p-1.5 transition-colors ${
                    isZone14
                      ? 'bg-amber-400/15'
                      : isHalfSpace
                      ? 'bg-sky-400/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono-data text-[9px] text-white/70 font-bold">
                    Zone {zoneNum}
                    {isZone14 && ' (Zone 14)'}
                    {zoneNum === 8 && ' (L-HS)'}
                    {zoneNum === 14 && ' (R-HS)'}
                  </span>
                  <span className="font-mono-data text-[8px] text-white/40 self-end">
                    xT: +{(0.05 + ((zoneNum % 6) + 1) * 0.08).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Voronoi Territory Simulation */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 z-10 ${
            showVoronoi ? 'opacity-100' : 'opacity-0'
          }`}
          preserveAspectRatio="none"
          viewBox="0 0 1050 680"
        >
          {allPlayers.map((player) => {
            const isHome = player.id.startsWith('h');
            const cx = (player.x / 100) * 1050;
            const cy = (player.y / 100) * 680;
            return (
              <g key={`voronoi-${player.id}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="78"
                  fill={isHome ? 'rgba(2, 132, 199, 0.16)' : 'rgba(220, 38, 38, 0.14)'}
                  stroke={isHome ? 'rgba(2, 132, 199, 0.4)' : 'rgba(220, 38, 38, 0.4)'}
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
              </g>
            );
          })}
        </svg>

        {/* Official Regulation Pitch Markings Layer (1050 x 680 coordinate space) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
          viewBox="0 0 1050 680"
        >
          {/* Boundary Touchlines & Goal Lines */}
          <rect
            x="25"
            y="25"
            width="1000"
            height="630"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Halfway Line & Center Circle / Spot */}
          <line
            x1="525"
            y1="25"
            x2="525"
            y2="655"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          <circle
            cx="525"
            cy="340"
            r="91.5"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          <circle cx="525" cy="340" r="4.5" fill="rgba(255,255,255,0.9)" />

          {/* Left Penalty Area (18-yard box) */}
          <rect
            x="25"
            y="138.5"
            width="165"
            height="403"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Left Goal Area (6-yard box) */}
          <rect
            x="25"
            y="248.5"
            width="55"
            height="183"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Left Penalty Spot & Arc (D-box) */}
          <circle cx="135" cy="340" r="4.5" fill="rgba(255,255,255,0.9)" />
          <path
            d="M 190,268 A 91.5 91.5 0 0 1 190,412"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Left Goal Mouth */}
          <rect
            x="10"
            y="303.4"
            width="15"
            height="73.2"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
          />

          {/* Right Penalty Area */}
          <rect
            x="860"
            y="138.5"
            width="165"
            height="403"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Right Goal Area */}
          <rect
            x="970"
            y="248.5"
            width="55"
            height="183"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Right Penalty Spot & Arc */}
          <circle cx="915" cy="340" r="4.5" fill="rgba(255,255,255,0.9)" />
          <path
            d="M 860,268 A 91.5 91.5 0 0 0 860,412"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          {/* Right Goal Mouth */}
          <rect
            x="1025"
            y="303.4"
            width="15"
            height="73.2"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
          />

          {/* Corner Arcs */}
          <path
            d="M 25,35 A 10 10 0 0 0 35,25"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          <path
            d="M 25,645 A 10 10 0 0 1 35,655"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          <path
            d="M 1015,25 A 10 10 0 0 0 1025,35"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
          <path
            d="M 1015,655 A 10 10 0 0 1 1025,645"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
          />
        </svg>

        {/* Dynamic Pass Vectors Layer (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          preserveAspectRatio="none"
          viewBox="0 0 1050 680"
        >
          <defs>
            <marker
              id="arrow-ground"
              markerWidth="6"
              markerHeight="6"
              refX="8"
              refY="5"
              viewBox="0 0 10 10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
            </marker>
            <marker
              id="arrow-aerial"
              markerWidth="6"
              markerHeight="6"
              refX="8"
              refY="5"
              viewBox="0 0 10 10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#b4c5ff" />
            </marker>
            <marker
              id="arrow-through"
              markerWidth="6"
              markerHeight="6"
              refX="8"
              refY="5"
              viewBox="0 0 10 10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffb4ab" />
            </marker>
          </defs>

          {vectors.map((vec, idx) => {
            const pFrom = getPlayer(vec.from);
            const pTo = getPlayer(vec.to);
            if (!pFrom || !pTo) return null;

            const x1 = (pFrom.x / 100) * 1050;
            const y1 = (pFrom.y / 100) * 680;
            const x2 = (pTo.x / 100) * 1050;
            const y2 = (pTo.y / 100) * 680;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            let strokeColor = '#0284c7';
            let strokeDash = 'none';
            let markerEnd = 'url(#arrow-ground)';
            let pathD = `M ${x1} ${y1} L ${x2} ${y2}`;

            if (vec.type === 'aerial') {
              strokeColor = '#b4c5ff';
              strokeDash = '6,4';
              markerEnd = 'url(#arrow-aerial)';
              const dx = x2 - x1;
              const dy = y2 - y1;
              const arcDepth = -45;
              const dist = Math.hypot(dx, dy) || 1;
              const ctrlX = midX - (dy / dist) * arcDepth;
              const ctrlY = midY + (dx / dist) * arcDepth;
              pathD = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
            } else if (vec.type === 'through') {
              strokeColor = '#ffb4ab';
              markerEnd = 'url(#arrow-through)';
            }

            const isActiveInAnim = activeVectorIdx === idx;

            return (
              <g key={`vector-${vec.id || idx}`}>
                <path
                  d={pathD}
                  stroke={isActiveInAnim ? '#facc15' : strokeColor}
                  strokeWidth={isActiveInAnim ? 4 : 2.8}
                  strokeDasharray={strokeDash}
                  fill="none"
                  markerEnd={markerEnd}
                  className="transition-all duration-150"
                />

                {/* Vector Data Label Pill (Distance & xT) */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  className="cursor-pointer pointer-events-auto hover:opacity-100 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVector(idx);
                  }}
                >
                  <title>Click to remove vector</title>
                  <rect
                    x="-38"
                    y="-11"
                    width="76"
                    height="20"
                    rx="4"
                    fill="#0b1326"
                    stroke={strokeColor}
                    strokeWidth="1"
                    opacity="0.92"
                    className="group-hover:stroke-red-400 group-hover:fill-red-950 transition-colors"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#dae2fd"
                    fontFamily="JetBrains Mono"
                    fontSize="9.5px"
                    fontWeight="600"
                    textAnchor="middle"
                    className="group-hover:fill-red-200"
                  >
                    {vec.dist} • {vec.xt}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Draft Vector Preview Line when drawing */}
          {drawingSourcePlayer && mousePos && (
            <line
              x1={(drawingSourcePlayer.x / 100) * 1050}
              y1={(drawingSourcePlayer.y / 100) * 680}
              x2={(mousePos.x / 100) * 1050}
              y2={(mousePos.y / 100) * 680}
              stroke="#95d4b3"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}

          {/* Caliper Measuring Line */}
          {currentTool === 'caliper' && caliperStart && (
            <g>
              <line
                x1={(caliperStart.x / 100) * 1050}
                y1={(caliperStart.y / 100) * 680}
                x2={((caliperEnd?.x || mousePos?.x || caliperStart.x) / 100) * 1050}
                y2={((caliperEnd?.y || mousePos?.y || caliperStart.y) / 100) * 680}
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <circle
                cx={(caliperStart.x / 100) * 1050}
                cy={(caliperStart.y / 100) * 680}
                r="5"
                fill="#facc15"
              />
              {mousePos && (
                <circle
                  cx={((caliperEnd?.x || mousePos.x) / 100) * 1050}
                  cy={((caliperEnd?.y || mousePos.y) / 100) * 680}
                  r="5"
                  fill="#facc15"
                />
              )}
              {caliperDistance() !== null && (
                <g
                  transform={`translate(${
                    (((caliperStart.x + (caliperEnd?.x || mousePos?.x || caliperStart.x)) / 2) / 100) * 1050
                  }, ${
                    (((caliperStart.y + (caliperEnd?.y || mousePos?.y || caliperStart.y)) / 2) / 100) * 680 - 15
                  })`}
                >
                  <rect
                    x="-35"
                    y="-10"
                    width="70"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="#facc15"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#facc15"
                    fontFamily="JetBrains Mono"
                    fontSize="10px"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {caliperDistance()} m
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Animated Soccer Ball traversal */}
        {animatedBallPos && (
          <div
            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
            style={{ left: `${animatedBallPos.x}%`, top: `${animatedBallPos.y}%` }}
          >
            <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center animate-spin">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            </div>
          </div>
        )}

        {/* Interactive 22 Player Markers */}
        <div className="absolute inset-0 w-full h-full z-30 pointer-events-none">
          {allPlayers.map((player) => {
            const isHome = player.id.startsWith('h');
            const isSelected = player.id === selectedPlayerId;
            const isDrawingSource = drawingSourcePlayer?.id === player.id;
            const ringColor = isHome
              ? 'border-[#0284c7] text-[#0284c7]'
              : 'border-[#c00815] text-[#c00815]';

            return (
              <div
                key={player.id}
                onMouseDown={(e) => handlePlayerMouseDown(e, player)}
                onClick={(e) => handlePlayerClick(e, player)}
                style={{ left: `${player.x}%`, top: `${player.y}%` }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-75 flex flex-col items-center group z-30 select-none"
              >
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${ringColor} bg-[#0b1326] flex items-center justify-center shadow-lg transition-all ${
                    isSelected
                      ? 'ring-4 ring-[#2d6a4f] ring-offset-2 ring-offset-[#1b4332] scale-125 shadow-emerald-500/40'
                      : isDrawingSource
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 animate-bounce'
                      : 'hover:scale-110'
                  }`}
                >
                  <span className="font-mono-data text-[10px] text-white font-bold leading-none pointer-events-none">
                    {player.num}
                  </span>
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-mono-data font-extrabold px-1 rounded bg-[#dae2fd] text-[#131b2e] border border-[#eaedff] leading-tight">
                    {player.pos}
                  </span>
                </div>

                {/* Player Name Tooltip */}
                <div className="opacity-80 group-hover:opacity-100 transition-opacity mt-1 px-1.5 py-0.5 rounded bg-[#ffffff]/90 backdrop-blur pointer-events-none whitespace-nowrap shadow-sm border border-slate-200">
                  <span className="font-mono-data text-[9px] text-[#131b2e] font-semibold">
                    {player.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* In-Pitch Attacking Axis Legend */}
        <div className="absolute bottom-3 left-4 z-10 pointer-events-none flex items-center gap-2 bg-[#ffffff]/85 px-3 py-1 rounded-md backdrop-blur border border-[#dae2fd] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
          <span className="font-mono-data text-[10px] text-[#131b2e] font-bold">
            MANCHESTER BLUE (4-3-3)
          </span>
          <span className="font-mono-data text-[10px] text-[#404943] font-medium">
            ← ATTACKING AXIS →
          </span>
          <span className="font-mono-data text-[10px] text-[#c00815] font-bold">
            MADRID BLANCO (4-3-3)
          </span>
        </div>
      </div>

      {/* Vector Controller Mini-bar Below Pitch */}
      <div className="w-full mt-2 px-1 flex flex-wrap items-center justify-between text-[#404943] font-mono-data text-xs gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#0284c7]"></span>
            <span>Ground Vector (Solid)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-[#b4c5ff]"></span>
            <span>Aerial Arc (Dashed)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#ffb4ab]"></span>
            <span>Progressive Through Ball</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#0f5238] font-bold">{vectors.length} Vectors Drawn</span>
          <span>|</span>
          <span className="text-[#707973]">
            {isDrawMode
              ? 'Click source player, then target player to draw pass'
              : 'Drag player node to re-position · Click to focus'}
          </span>
        </div>
      </div>
    </div>
  );
};
