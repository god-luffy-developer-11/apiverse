'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  KeyRound,
  PlaySquare,
  BarChart3,
  BellRing,
  BookOpen,
  Atom,
  Boxes,
  HelpCircle,
  GraduationCap,
  Users,
  Compass,
  Rocket,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Film,
  Play,
  Pause,
  ChevronDown,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  Zap
} from 'lucide-react';
import { useWallpaper, ALL_WALLPAPERS, WallpaperConfig } from '@/context/WallpaperContext';

const NAV_ITEMS = [
  { href: '/galaxy', label: 'Galaxy Dashboard', icon: Globe },
  { href: '/explorer', label: 'API Explorer', icon: Compass },
  { href: '/vault', label: 'API Key Vault', icon: KeyRound },
  { href: '/playground', label: 'Playground', icon: PlaySquare },
  { href: '/analytics', label: 'Galaxy Metrics', icon: BarChart3 },
  { href: '/alerts', label: 'Smart Alerts', icon: BellRing, badge: '1' },
  { href: '/ultron', label: 'Ultron Singularity', icon: Atom, highlight: 'ultron' },
  { href: '/docs', label: 'Docs Hub', icon: BookOpen },
  { href: '/setup', label: 'Setup Assistant', icon: Rocket },
  { href: '/free-tier', label: 'Free Tier Finder', icon: HelpCircle },
  { href: '/recommender', label: 'AI Recommender', icon: Sparkles },
  { href: '/starter-kits', label: 'Starter Kits', icon: Boxes },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/learning', label: 'Mission Map', icon: GraduationCap },
  { href: '/settings', label: 'Settings & RBAC', icon: Settings }
];

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isAutoExpand?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const pathname = usePathname();
  const [showWpSelector, setShowWpSelector] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isNearLeft, setIsNearLeft] = React.useState(false);

  const {
    activeWallpaper,
    setActiveWallpaper,
    isPlaying,
    togglePlay,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    quality,
    setQuality
  } = useWallpaper();

  const [showSettings, setShowSettings] = React.useState(false);

  const isHome = pathname === '/';

  // Proximity detection for left edge
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 24) {
        setIsNearLeft(true);
      } else if (e.clientX > 260 && !isHovered) {
        setIsNearLeft(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  // If user explicitly uncollapsed it, it stays open.
  // If it's collapsed, hovering over it or coming near left edge auto-expands it!
  const effectiveCollapsed = collapsed && !isHovered && !isNearLeft;

  return (
    <>
      {/* Edge trigger zone on the left extending full height */}
      {collapsed && (
        <div
          onMouseEnter={() => setIsNearLeft(true)}
          className="fixed top-0 bottom-0 left-0 w-3 z-30 pointer-events-auto"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsNearLeft(false);
        }}
        className={`h-full shrink-0 hidden lg:flex flex-col justify-between select-none relative transition-all duration-300 ease-in-out z-20 ${
          effectiveCollapsed ? 'w-20 p-2.5' : 'w-64 p-3'
        }`}
      >
        {/* Floating Windows 11 Taskbar Dock Container */}
        <div className="h-full w-full rounded-2xl bg-[#14161d]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col justify-between p-2 overflow-hidden relative">
          {/* Subtle top acrylic lighting */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-2xl" />

          <div className="space-y-2 relative z-10 flex-1 flex flex-col min-h-0">
            {/* Windows 11 Start Tile Button (Header & Toggle) */}
            <div className="flex items-center justify-between px-1 py-0.5 shrink-0 border-b border-white/[0.08] pb-2">
              <button
                onClick={onToggle}
                title={effectiveCollapsed ? 'Open Start / Expand Taskbar' : 'Collapse Taskbar'}
                className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.08] transition-all group/start"
              >
                {/* 4-Square Windows Start Logo with electric cyan illumination */}
                <div className="w-8 h-8 rounded-lg bg-[#0078d4]/20 border border-[#00a4ef]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,164,239,0.35)] group-hover/start:shadow-[0_0_16px_rgba(0,164,239,0.6)] group-hover/start:border-[#00a4ef]/80 transition-all">
                  <div className="grid grid-cols-2 gap-0.5">
                    <span className="w-2 h-2 rounded-[2px] bg-[#00a4ef] shadow-[0_0_4px_#00a4ef]" />
                    <span className="w-2 h-2 rounded-[2px] bg-[#00a4ef] shadow-[0_0_4px_#00a4ef]" />
                    <span className="w-2 h-2 rounded-[2px] bg-[#00a4ef] shadow-[0_0_4px_#00a4ef]" />
                    <span className="w-2 h-2 rounded-[2px] bg-[#00a4ef] shadow-[0_0_4px_#00a4ef]" />
                  </div>
                </div>

                {!effectiveCollapsed && (
                  <div className="flex-1 text-left truncate flex items-center justify-between">
                    <span className="text-xs font-semibold text-white tracking-wide">Start Menu</span>
                    <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400 group-hover/start:text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Taskbar App Icons List */}
            <div className="space-y-1 overflow-y-auto flex-1 pr-0.5 custom-scrollbar py-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center ${
                      effectiveCollapsed ? 'justify-center py-1' : 'justify-between px-2.5 py-1.5'
                    } rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-white/[0.12] text-white'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`flex items-center ${effectiveCollapsed ? 'justify-center relative' : 'gap-3'} w-full`}>
                      {/* Windows 11 App Tile Container */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 relative shrink-0">
                        <Icon
                          className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${
                            isActive
                              ? 'text-[#00a4ef] drop-shadow-[0_0_8px_rgba(0,164,239,0.8)]'
                              : 'text-zinc-300 group-hover:text-white'
                          }`}
                        />

                        {/* Windows Taskbar Notification Pip */}
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
                        )}

                        {/* Windows 11 Active App Line Indicator: Cyan Pill directly beneath the icon */}
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-[#00a4ef] shadow-[0_0_8px_#00a4ef]" />
                        )}
                      </div>

                      {!effectiveCollapsed && (
                        <span className={`truncate ${isActive ? 'font-semibold text-white' : 'text-zinc-300'}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

      {/* Live Background Control Panel In Sidebar with Sound & Quality */}
      {!effectiveCollapsed ? (
        <div className="pt-2 mt-1 border-t border-white/10 shrink-0 space-y-2 relative z-10">
          <div className="p-2.5 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/20 text-xs shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),0_6px_20px_rgba(0,0,0,0.3)]">
            {/* Header controls: Title, Play/Pause, Mute/Sound, Settings/Quality */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-white" />
                <span className="font-mono text-[10px] text-zinc-300 tracking-wider">LIVE BACKGROUND</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause background' : 'Play background'}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                </button>

                {/* Sound / Volume Toggle */}
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  {isMuted ? <VolumeX className="w-3 h-3 text-zinc-400" /> : <Volume2 className="w-3 h-3 text-white" />}
                </button>

                {/* Sound & Quality Menu Toggle */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  title="Audio & Quality Settings"
                  className={`p-1 rounded-md transition-all ${
                    showSettings ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quality & Audio Slider Overlay Drawer */}
            {showSettings && (
              <div className="mb-2 p-2 rounded-lg bg-black/80 border border-white/15 space-y-2 animate-in fade-in duration-150">
                {/* Audio Volume Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                    <span>AUDIO SOUND</span>
                    <span className="text-white font-bold">{isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) toggleMute();
                    }}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* Quality Mode Selector */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                    <span>VIDEO QUALITY</span>
                    <span className="text-white font-bold uppercase">{quality}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['4k', '1080p', 'eco'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`py-1 text-[10px] font-mono rounded transition-all uppercase ${
                          quality === q
                            ? 'bg-white text-black font-bold shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                            : 'bg-white/10 text-zinc-300 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Current Active Wallpaper Info / Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowWpSelector(!showWpSelector)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 text-left text-[11px] font-mono transition-all text-white"
              >
                <div className="truncate mr-1">
                  <span className="font-bold text-white block truncate">{activeWallpaper.folder}</span>
                  <span className="text-[9px] text-zinc-400 block truncate">
                    {activeWallpaper.name}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${showWpSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu for all 16 Backgrounds */}
              {showWpSelector && (
                <div className="absolute bottom-full left-0 right-0 mb-2 max-h-56 overflow-y-auto rounded-xl p-1 bg-black/95 backdrop-blur-2xl border border-white/25 shadow-2xl z-50 custom-scrollbar">
                  <div className="px-2 py-1 text-[9px] font-mono text-zinc-400 uppercase tracking-wider border-b border-white/10 mb-1">
                    Select Live Background
                  </div>
                  {ALL_WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => {
                        setActiveWallpaper(wp);
                        setShowWpSelector(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-[11px] font-mono transition-all ${
                        activeWallpaper.id === wp.id
                          ? 'bg-white/20 text-white font-bold border border-white/30'
                          : 'text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate">{wp.folder}</span>
                      {activeWallpaper.id === wp.id && (
                        <Check className="w-3 h-3 text-white shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-2 mt-1 border-t border-white/10 flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause live background' : 'Play live background'}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-white border border-white/20 shadow-sm"
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-white border border-white/20 shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
      )}
        </div>
      </aside>
    </>
  );
};
