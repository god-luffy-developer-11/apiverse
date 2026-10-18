'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { realtimeGateway } from '@/lib/realtime-client';
import { Orbit, Radio, Zap, Shield, Search, Moon, Sun, PanelLeft } from 'lucide-react';
import { LiquidGlassSwitch } from '@/components/ui/LiquidGlassSwitch';

export const Header: React.FC<{
  onOpenWarp: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}> = ({
  onOpenWarp,
  onToggleSidebar,
  sidebarCollapsed = false
}) => {
  const [realtimeStatus, setRealtimeStatus] = useState<'LIVE' | 'RECONNECTING' | 'OFFLINE'>('LIVE');
  const [deepSpaceMode, setDeepSpaceMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    realtimeGateway.connect();
    realtimeGateway.onStatusChange = (st) => setRealtimeStatus(st);
  }, []);

  // Proximity detection: if cursor approaches within 28px of top window edge, reveal header
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 32) {
        setIsNearTop(true);
      } else if (e.clientY > 72 && !isHovered) {
        setIsNearTop(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  const isVisible = isPinned || isHovered || isNearTop;

  return (
    <>
      {/* Invisible top hover trigger zone so moving mouse to top screen edge auto-reveals the tab */}
      <div
        onMouseEnter={() => setIsNearTop(true)}
        className="fixed top-0 left-0 right-0 h-3 z-50 pointer-events-auto"
      />

      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsNearTop(false);
        }}
        className={`fixed top-2.5 left-4 right-4 z-40 h-13 rounded-2xl bg-[#14161d]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between px-4 py-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        {/* Subtle top acrylic lighting */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-2xl" />

        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3 relative z-10">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? 'Expand Taskbar' : 'Collapse Taskbar'}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 text-zinc-300 hover:text-white transition-all flex items-center justify-center"
            >
              <PanelLeft className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#0078d4]/20 border border-[#00a4ef]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,164,239,0.35)] group-hover:border-[#00a4ef]/80 transition-all">
              <Orbit className="w-4 h-4 text-[#00a4ef] group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <span className="font-display font-black text-sm tracking-widest text-white">
              APIVERSE
            </span>
          </Link>

          {/* System Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#00a4ef] shadow-[0_0_8px_#00a4ef]" />
            <span>Solar System: Alpha-7</span>
          </div>
        </div>

        {/* Center: Windows 11 Taskbar-Style Search Pill */}
        <button
          onClick={onOpenWarp}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-[#00a4ef]/50 text-xs text-zinc-300 hover:text-white transition-all w-72 justify-between shadow-inner relative z-10 group"
        >
          <span className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#00a4ef] transition-colors" />
            <span className="text-zinc-400 group-hover:text-zinc-200">Search APIs, tools & planets...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-zinc-300 border border-white/10">Cmd+K</kbd>
        </button>

        {/* Right: Windows 11 Action Center Tray */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden lg:block">
            <LiquidGlassSwitch
              checked={deepSpaceMode}
              onChange={setDeepSpaceMode}
              leftIcon={<Orbit className="w-3 h-3 text-white" />}
              rightIcon={<Moon className="w-3 h-3 text-white" />}
            />
          </div>

          {/* Live Telemetry Ping */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.05] border border-white/15 text-xs font-mono shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'LIVE'
                  ? 'bg-[#00a4ef] shadow-[0_0_8px_#00a4ef]'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="text-[11px] text-white font-bold tracking-wider">{realtimeStatus}</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop"
              alt="Shepard"
              className="w-7 h-7 rounded-full border border-white/80 object-cover shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              title="Shepard (Owner)"
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop"
              alt="Liara"
              className="w-7 h-7 rounded-full border border-white/40 object-cover shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              title="Liara (Admin)"
            />
          </div>
        </div>
      </header>
    </>
  );
};
