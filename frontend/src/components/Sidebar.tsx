import React from 'react';
import { TacticalTool } from '../types';

interface SidebarProps {
  currentTool: TacticalTool;
  onSelectTool: (tool: TacticalTool) => void;
  showSpatialGrid: boolean;
  onToggleSpatialGrid: () => void;
  onOpenSettings: () => void;
  onToggleLayerMenu: () => void;
  isAiInsightsOpen?: boolean;
  onToggleAiInsights?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTool,
  onSelectTool,
  showSpatialGrid,
  onToggleSpatialGrid,
  onOpenSettings,
  onToggleLayerMenu,
  isAiInsightsOpen,
  onToggleAiInsights
}) => {
  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-16 shrink-0 bg-[#ffffff] z-30 flex flex-col items-center py-4 justify-between shadow-[1px_0_12px_rgba(0,0,0,0.08)] border-r border-[#eaedff]">
      {/* Top Tactical Tools */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          onClick={() => onSelectTool('select')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'select'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Select &amp; Drag Pointer"
        >
          <span className="material-symbols-outlined text-lg">near_me</span>
        </button>

        <button
          onClick={() => onSelectTool('ground')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'ground'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Ground Pass Vector"
        >
          <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
        </button>

        <button
          onClick={() => onSelectTool('aerial')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'aerial'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Curved Aerial / Cross Vector"
        >
          <span className="material-symbols-outlined text-lg">turn_right</span>
        </button>

        <button
          onClick={() => onSelectTool('through')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'through'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Through Run Vector"
        >
          <span className="material-symbols-outlined text-lg">arrow_outward</span>
        </button>

        <button
          onClick={() => onSelectTool('polygon')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'polygon'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Pressing Corridor &amp; Polygon Zone"
        >
          <span className="material-symbols-outlined text-lg">polyline</span>
        </button>

        <button
          onClick={onToggleSpatialGrid}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            showSpatialGrid
              ? 'bg-[#0051d5] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title={showSpatialGrid ? 'Hide Positional Grid' : 'Show 18-Zone Positional Grid'}
        >
          <span className="material-symbols-outlined text-lg">grid_4x4</span>
        </button>

        <button
          onClick={() => onSelectTool('caliper')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
            currentTool === 'caliper'
              ? 'bg-[#2d6a4f] text-white shadow-sm'
              : 'text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
          }`}
          title="Distance Caliper (Meters/Yards)"
        >
          <span className="material-symbols-outlined text-lg">straighten</span>
        </button>
      </div>

      {/* Bottom Auxiliary Tools */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {onToggleAiInsights && (
          <button
            onClick={onToggleAiInsights}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              isAiInsightsOpen
                ? 'bg-[#0f5238] text-white shadow-sm'
                : 'text-[#0f5238] hover:bg-[#b1f0ce]/40 hover:text-[#002114]'
            }`}
            title="Toggle Tactical AI Insights"
          >
            <span className="material-symbols-outlined text-lg">psychology</span>
          </button>
        )}

        <button
          onClick={onToggleLayerMenu}
          className="w-11 h-11 rounded-lg flex items-center justify-center text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
          title="Tactical Whiteboard Layer Toggle"
        >
          <span className="material-symbols-outlined text-lg">layers</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-lg flex items-center justify-center text-[#404943] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
          title="Telemetry Settings"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>
      </div>
    </aside>
  );
};
