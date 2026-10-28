import React from 'react';
import { FORMATION_PRESETS } from '../data/mockData';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (presetId: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0051d5] text-xl">grid_view</span>
            <h3 className="font-display text-base font-bold text-[#131b2e]">
              Tactical Formation &amp; Shape Presets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#707973] hover:text-[#131b2e] p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p className="font-sans text-xs text-[#707973]">
          Select a tactical shape to instantly re-position team nodes across the 105m × 68m pitch coordinates:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FORMATION_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#dae2fd] transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => {
                onApplyPreset(preset.id);
                onClose();
              }}
            >
              <div>
                <span className="font-display text-sm font-bold text-[#131b2e] group-hover:text-[#0051d5] transition-colors">
                  {preset.name}
                </span>
                <span className="font-mono-data text-[10px] text-[#707973] block mt-1">
                  11 Calibrated Coordinates
                </span>
              </div>
              <button className="mt-3 w-full py-1.5 rounded-md bg-white border border-[#dae2fd] text-xs font-semibold text-[#131b2e] group-hover:bg-[#2d6a4f] group-hover:text-white transition-all shadow-2xs">
                Apply Formation
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#eaedff]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#404943] hover:bg-[#f2f3ff] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
