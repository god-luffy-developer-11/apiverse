'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SpaceButton, GlassPanel, Badge } from '@apiverse/ui';
import { Orbit, Sparkles, Shield, Zap, Globe, KeyRound, PlaySquare, Atom, ArrowRight, Flame } from 'lucide-react';
import { UltronBlackHole } from '@/components/3d/UltronBlackHole';
import { UltronState } from '@/lib/types';

export default function LandingPage() {
  const [blackHoleState, setBlackHoleState] = useState<UltronState>('idle');

  const cycleState = () => {
    const states: UltronState[] = ['idle', 'listening', 'thinking', 'streaming'];
    const next = states[(states.indexOf(blackHoleState) + 1) % states.length];
    setBlackHoleState(next);
  };

  return (
    <div className="relative min-h-screen py-8 flex flex-col items-center select-none">
      {/* Background Relativistic Energy Void */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-red-600/15 via-black to-red-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Badge in Mineralistic Liquid Glass */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-white/20 text-white text-xs font-mono mb-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_0_20px_rgba(255,255,255,0.3)]">
        <span className="w-2 h-2 rounded-full bg-white/20 animate-ping shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <span className="font-bold tracking-widest uppercase">APIVERSE OPERATING SYSTEM</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-300">MINERALISTIC 2026</span>
      </div>

      {/* Hero Title: Crisp Pure White */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-center tracking-tight max-w-5xl leading-[1.1] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
        The Developer Operating System for Working with APIs
      </h1>

      <p className="mt-5 text-base sm:text-lg text-zinc-300 text-center max-w-2xl font-sans font-light leading-relaxed">
        Experience your APIs as a living universe. Watch keys orbit as celestial planets, stream live telemetry, and command <span className="text-white font-semibold underline decoration-red-500 decoration-2">Ultron</span>—the fractured singularity core.
      </p>

      {/* Action Buttons: Liquid Glass Pill Controls */}
      <div className="mt-8 flex items-center gap-4 flex-wrap justify-center z-10">
        <Link href="/galaxy">
          <SpaceButton size="lg" variant="primary" icon={<Globe className="w-4 h-4 text-white" />}>
            Enter The Galaxy
          </SpaceButton>
        </Link>
        <Link href="/ultron">
          <SpaceButton size="lg" variant="ultron" icon={<Atom className="w-4 h-4 text-white" />}>
            Command Ultron Core
          </SpaceButton>
        </Link>
      </div>

      {/* Center 3D Realistic Black Hole with Cursor Gravitational Lensing */}
      <div className="my-10 relative flex flex-col items-center cursor-pointer group" onClick={cycleState}>
        <div className="absolute -top-3 text-[10px] font-mono tracking-widest text-zinc-400 group-hover:text-white uppercase transition-colors">
          [Click Singularity To Shift State: {blackHoleState.toUpperCase()}]
        </div>
        <UltronBlackHole state={blackHoleState} size={420} />
      </div>

      {/* 3 Pillars Grid: Mineralistic Liquid Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-4 z-10">
        <GlassPanel glow="crimson" className="p-6 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2a0409] to-black border border-white/30 flex items-center justify-center mb-4 shadow-[0_0_16px_rgba(255,255,255,0.3)]">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-black text-lg text-white mb-2">Live Celestial Galaxy</h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Every API key orbits as an astronomical body. Size represents real request volume, color reflects live SLA health, and traffic comets fly in real time.
          </p>
        </GlassPanel>

        <GlassPanel glow="white" className="p-6 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/10 to-black border border-white/40 flex items-center justify-center mb-4 shadow-[0_0_16px_rgba(255,255,255,0.3)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-black text-lg text-white mb-2">AES-256-GCM Vault</h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Cryptographic hardware-grade key isolation. Secrets never touch frontend state, with automatic rotation countdowns and live leak audits.
          </p>
        </GlassPanel>

        <GlassPanel glow="crimson" className="p-6 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#3b060d] to-black border border-white/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-black text-lg text-white mb-2">Ultron Singularity</h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Sentient shattered singularity backed by Google Gemini. Streamline code generation, diagnose failing HTTP payloads, and architect distributed topologies.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
