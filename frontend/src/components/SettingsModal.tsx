import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'meters' | 'yards'>('meters');
  const [fps, setFps] = useState<'120' | '60'>('120');
  const [autoSnap, setAutoSnap] = useState(true);
  const [pitchSize, setPitchSize] = useState('105x68');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#404943] text-xl">settings</span>
            <h3 className="font-display text-base font-bold text-[#131b2e]">
              Telemetry &amp; Pitch Calibration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#707973] hover:text-[#131b2e] p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Pitch Dimensions */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-[#131b2e]">
              Pitch Coordinate System
            </label>
            <select
              value={pitchSize}
              onChange={(e) => setPitchSize(e.target.value)}
              className="p-2 rounded-lg bg-[#f2f3ff] border border-[#dae2fd] text-xs font-sans text-[#131b2e]"
            >
              <option value="105x68">105m × 68m (UEFA Champions League / Premier League)</option>
              <option value="100x64">100m × 64m (Compact Continental Regulation)</option>
              <option value="110x70">110m × 70m (Wide Experimental Dimension)</option>
            </select>
          </div>

          {/* Metric Units */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-[#131b2e]">
              Distance Unit of Measure
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnit('meters')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  unit === 'meters'
                    ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                    : 'bg-[#f2f3ff] text-[#404943] border-[#dae2fd]'
                }`}
              >
                Meters (Metric)
              </button>
              <button
                type="button"
                onClick={() => setUnit('yards')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  unit === 'yards'
                    ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                    : 'bg-[#f2f3ff] text-[#404943] border-[#dae2fd]'
                }`}
              >
                Yards (Imperial)
              </button>
            </div>
          </div>

          {/* Auto-Snap */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            <div>
              <span className="font-sans text-xs font-semibold text-[#131b2e] block">
                Magnetic Node Snapping
              </span>
              <span className="font-mono-data text-[10px] text-[#707973]">
                Snap vector endpoints automatically to nearest player
              </span>
            </div>
            <button
              onClick={() => setAutoSnap(!autoSnap)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                autoSnap ? 'bg-[#0f5238]' : 'bg-[#bfc9c1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSnap ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Sync Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-[#131b2e]">
              Telemetry Stream Frequency
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFps('120')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  fps === '120'
                    ? 'bg-[#0051d5] text-white border-[#0051d5]'
                    : 'bg-[#f2f3ff] text-[#404943] border-[#dae2fd]'
                }`}
              >
                120 FPS High Cadence
              </button>
              <button
                type="button"
                onClick={() => setFps('60')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  fps === '60'
                    ? 'bg-[#0051d5] text-white border-[#0051d5]'
                    : 'bg-[#f2f3ff] text-[#404943] border-[#dae2fd]'
                }`}
              >
                60 FPS Standard
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#eaedff]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0f5238] text-white text-xs font-bold hover:bg-[#2d6a4f] transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
