import React from 'react';

interface FooterProps {
  vectorCount: number;
  netXt: string;
}

export const Footer: React.FC<FooterProps> = ({ vectorCount, netXt }) => {
  return (
    <footer className="w-full bg-white py-3 px-6 flex flex-wrap items-center justify-between gap-4 shadow-[0_-1px_6px_rgba(0,0,0,0.06)] border-t border-[#eaedff]">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-data text-[10px] text-[#707973] uppercase tracking-wider">
            Tactical Ratio
          </span>
          <span className="font-mono-data text-xs text-[#0f5238] font-bold">
            105m × 68m (1:1.54)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono-data text-[10px] text-[#707973] uppercase tracking-wider">
            Active Vectors
          </span>
          <span className="font-mono-data text-xs text-[#131b2e] font-bold">
            {vectorCount} Connections
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono-data text-[10px] text-[#707973] uppercase tracking-wider">
            Passing Flow
          </span>
          <span className="font-mono-data text-xs text-[#0051d5] font-bold">
            88.6% Acc.
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono-data text-[10px] text-[#707973] uppercase tracking-wider">
            Expected Threat (xT)
          </span>
          <span className="font-mono-data text-xs text-[#c00815] font-bold">
            +{netXt} Net
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono-data text-[10px] text-[#707973]">
          © 2026 PASS INSIDER INTELLIGENCE SYSTEMS
        </span>
      </div>
    </footer>
  );
};
