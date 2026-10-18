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
 * Mineralistic Liquid Glass Sliding Switch: Black, Crimson Red & Stark White
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
    <div
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
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
            ? 'bg-gradient-to-r from-red-900/90 via-[#2a0409]/95 to-black border-white/30 shadow-[0_4px_20px_rgba(255,255,255,0.3),inset_0_1.5px_0_0_rgba(255,255,255,0.7),inset_0_-1.5px_0_0_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-r from-[#18181f]/90 via-[#0d0d12]/95 to-black border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.85),inset_0_1.5px_0_0_rgba(255,255,255,0.6),inset_0_-1.5px_0_0_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Upper optical specular sheen */}
        <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none" />

        {/* Floating 3D Optical Glass Thumb in Stark White */}
        <div
          className={`w-6 h-6 rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-300 shadow-[0_3px_12px_rgba(0,0,0,0.7),inset_0_2px_0_0_#ffffff,inset_0_-2px_0_0_rgba(0,0,0,0.3)] transform transition-transform duration-300 flex items-center justify-center relative ${
            checked ? 'translate-x-8' : 'translate-x-0'
          }`}
        >
          {/* Internal optical lens reflection */}
          <div className="w-2.5 h-2.5 rounded-full bg-white/80 absolute top-0.5 left-1 shadow-sm" />
          <div className="relative z-10 text-[10px]">
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
    </div>
  );
};
