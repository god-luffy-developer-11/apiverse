'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Maximize2, Radio } from 'lucide-react';

interface LiquidGlassVideoCardProps {
  src: string;
  title: string;
  badge?: string;
  category?: string;
  description?: string;
  className?: string;
  aspectRatio?: 'video' | 'portrait' | 'square';
  glow?: 'crimson' | 'white' | 'obsidian' | 'cyan' | 'purple' | 'gold' | 'emerald';
}

export const LiquidGlassVideoCard: React.FC<LiquidGlassVideoCardProps> = ({
  src,
  title,
  badge = 'LIVE TELEMETRY',
  category = 'MISSION BROADCAST',
  description,
  className = '',
  aspectRatio = 'video',
  glow = 'crimson'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const glowShadow = {
    crimson: 'shadow-[0_14px_40px_-6px_rgba(255,255,255,0.3)] border-white/30',
    white: 'shadow-[0_14px_40px_-6px_rgba(255,255,255,0.3)] border-white/40',
    obsidian: 'shadow-[0_18px_48px_rgba(0,0,0,0.95)] border-white/15',
    cyan: 'shadow-[0_14px_36px_-6px_rgba(6,182,212,0.35)] border-white/30',
    purple: 'shadow-[0_14px_36px_-6px_rgba(236,72,153,0.35)] border-pink-400/40',
    gold: 'shadow-[0_14px_36px_-6px_rgba(245,158,11,0.35)] border-white/30',
    emerald: 'shadow-[0_14px_36px_-6px_rgba(16,185,129,0.35)] border-white/30'
  }[glow];

  const aspectClass = {
    video: 'aspect-video',
    portrait: 'aspect-[9/16]',
    square: 'aspect-square'
  }[aspectRatio];

  return (
    <div
      className={`group relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/20 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.01] shadow-[0_16px_45px_rgba(0,0,0,0.5),inset_0_1.5px_1px_0_rgba(255,255,255,0.35)] ${className}`}
    >
      {/* Upper mineralistic liquid glass specular rim sheen */}
      <div className="absolute inset-x-4 top-0.5 h-1/3 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-3xl pointer-events-none z-20" />

      {/* Video Container (Pure transparent frame) */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-transparent`}>
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Subtle optical glass sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/25 text-[10px] font-mono text-white shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <span className="w-2 h-2 rounded-full bg-white/20 animate-ping shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="font-bold tracking-wider">{badge}</span>
          </div>

          <div className="text-[10px] font-mono text-zinc-200 bg-white/[0.06] backdrop-blur-xl px-3 py-1 rounded-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            {category}
          </div>
        </div>

        {/* Play / Pause Interactive Trigger */}
        <button
          onClick={togglePlay}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur-xl border border-white/30 text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]"
          title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
        </button>
      </div>

      {/* Bottom Information Glass Bar */}
      <div className="p-4 border-t border-white/15 bg-white/[0.04] backdrop-blur-2xl">
        <h4 className="font-display font-black text-xs text-white tracking-wider truncate">{title}</h4>
        {description && (
          <p className="text-[11px] font-mono text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono text-zinc-400">
          <span>Stream Node: 60 FPS</span>
          <span className="text-white font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
            LIVE TELEMETRY
          </span>
        </div>
      </div>
    </div>
  );
};
