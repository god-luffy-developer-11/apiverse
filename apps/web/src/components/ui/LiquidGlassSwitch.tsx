'use client';

import React from 'react';

interface LiquidGlassSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

/**
 * Mineralistic Liquid Glass Sliding Switch: Dynamic Solar Light & Deep Space Dark
 */
export const LiquidGlassSwitch: React.FC<LiquidGlassSwitchProps> = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  className = ''
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0 outline-none transition-transform active:scale-95 ${className}`}
    >
      {leftLabel && (
        <span
          className={`text-xs font-mono transition-colors ${
            !checked ? 'text-white font-bold' : 'text-zinc-500'
          }`}
        >
          {leftLabel}
        </span>
      )}

      {/* Mineralistic Pill Track */}
      <div
        className={`relative w-16 h-8 rounded-full p-1 transition-all duration-300 border ${
          checked
            ? 'bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-white/40 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.35),inset_0_1.5px_0_0_rgba(255,255,255,0.9),inset_0_-1.5px_0_0_rgba(0,0,0,0.2)]'
            : 'bg-gradient-to-r from-[#18181f]/90 via-[#0d0d12]/95 to-black border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.85),inset_0_1.5px_0_0_rgba(255,255,255,0.6),inset_0_-1.5px_0_0_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Upper optical specular sheen */}
        <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none" />

        {/* Floating 3D Optical Glass Thumb in Stark White */}
        <div
          className={`w-6 h-6 rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_3px_12px_rgba(0,0,0,0.7),inset_0_2px_0_0_#ffffff,inset_0_-2px_0_0_rgba(0,0,0,0.2)] transform transition-transform duration-300 flex items-center justify-center relative ${
            checked ? 'translate-x-8' : 'translate-x-0'
          }`}
        >
          {/* Internal optical lens reflection */}
          <div className="w-2 rounded-full bg-white/90 absolute top-0.5 left-1 shadow-sm h-1" />
          <div className="relative z-10 flex items-center justify-center">
            {checked ? rightIcon : leftIcon}
          </div>
        </div>
      </div>

      {rightLabel && (
        <span
          className={`text-xs font-mono transition-colors ${
            checked ? 'text-white font-bold' : 'text-zinc-500'
          }`}
        >
          {rightLabel}
        </span>
      )}
    </button>
  );
};
