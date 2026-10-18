'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface LiquidGlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Mineralistic Liquid Glass Input Capsule: Black, Crimson Red & Stark White
 */
export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  icon = <Search className="w-4 h-4 text-white" />,
  containerClassName = '',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative rounded-full p-1 bg-gradient-to-b from-white/20 via-white/[0.05] to-transparent border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.85),inset_0_1.5px_0_0_rgba(255,255,255,0.7)] backdrop-blur-2xl transition-all duration-300 focus-within:border-white/30 focus-within:shadow-[0_8px_32px_rgba(255,255,255,0.3)] ${containerClassName}`}
    >
      {/* Upper glass rim sheen */}
      <div className="absolute inset-x-4 top-0.5 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent rounded-t-full pointer-events-none" />

      {/* Dark Inner Capsule in Pitch Obsidian */}
      <div className="relative flex items-center bg-black/90 rounded-full px-4 py-2 border border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
        <span className="shrink-0 mr-2.5 text-white">{icon}</span>
        <input
          className={`w-full bg-transparent text-xs font-sans text-white placeholder-zinc-500 outline-none ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
