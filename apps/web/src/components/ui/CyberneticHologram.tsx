'use client';

import React, { useRef, useState } from 'react';
import { Activity, Shield, Cpu, Maximize2 } from 'lucide-react';

interface CyberneticHologramProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Mineralistic Cybernetic Hologram: Black, Crimson Red & Stark White
 * Powered by UIUX video asset (/uiux/cybernetic-telemetry-hologram.mp4).
 */
export const CyberneticHologram: React.FC<CyberneticHologramProps> = ({
  className = '',
  title = 'SINGULARITY RADAR TELEMETRY',
  subtitle = 'Telemetry Vector Node #572919'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-black border border-white/30 shadow-[0_14px_44px_rgba(255,255,255,0.3),inset_0_1.5px_0_0_rgba(255,255,255,0.75)] backdrop-blur-2xl ${className}`}
    >
      {/* Real Cybernetic Point-Cloud Hologram Video */}
      <video
        ref={videoRef}
        src="/uiux/cybernetic-telemetry-hologram.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-90 contrast-125 filter hue-rotate-[-35deg]"
      />

      {/* Hologram Scanline & Red Laser Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.05] to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

      {/* Aerospace HUD Telemetry Overlays */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.3)]">
          <span className="w-2 h-2 rounded-full bg-white/20 animate-ping shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="text-[10px] font-mono text-white font-bold tracking-widest uppercase">
            {title}
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-300 bg-black/80 px-2.5 py-1 rounded-full border border-white/20">
          60 FPS • LIVE STREAM
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="text-[11px] font-mono text-white bg-black/85 backdrop-blur-md px-3.5 py-1 rounded-xl border border-white/20">
          <span className="text-white font-bold">{subtitle}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white bg-black/85 px-3 py-1 rounded-xl border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          <Activity className="w-3 h-3 text-white" />
          <span className="font-bold">LATTICE: 100%</span>
        </div>
      </div>
    </div>
  );
};
