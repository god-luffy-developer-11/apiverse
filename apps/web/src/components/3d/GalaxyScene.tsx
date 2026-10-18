'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApiKeyPlanet, CometTelemetryEvent, SolarFlareAlert } from '@/lib/types';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Activity,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Info,
  X,
  Compass,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatLatency } from '@apiverse/utils';

interface GalaxySceneProps {
  planets: ApiKeyPlanet[];
  comets: CometTelemetryEvent[];
  alerts: SolarFlareAlert[];
  onSelectPlanet?: (planet: ApiKeyPlanet) => void;
}

export const GalaxyScene: React.FC<GalaxySceneProps> = ({
  planets,
  comets,
  alerts,
  onSelectPlanet
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<ApiKeyPlanet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<ApiKeyPlanet | null>(null);
  const [currentTime, setCurrentTime] = useState('468.2 yr');

  // Video source paths from C:\Users\surya\Downloads\apiverse\UIUX\live background\Galaxy Dashboard
  const primaryVideoSrc = '/live-wallpapers/bg-galaxy.mp4';
  const fallbackVideoSrc = '/live-background/Galaxy%20Dashboard/From%20Klickpin.com-%20Classic%20Meal%20Prep%20Ideas%20to%20Refresh%20Your%20Routine-pin-id-47498971066218091.mp4';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Celestial Nodes mapped across the helical planetary trajectories in the video
  const celestialNodes = [
    {
      id: 'sun-core',
      name: 'Sun (Gateway Singularity)',
      sub: 'Central Ingestion Core',
      top: '48%',
      left: '50%',
      color: '#ffaa00',
      glow: 'rgba(255, 170, 0, 0.6)',
      service: 'Gateway',
      health: 'OPTIMAL' as const,
      reqSec: '1,420 rps',
      latency: '24ms',
      size: 'w-6 h-6'
    },
    {
      id: 'jupiter-openai',
      name: 'Jupiter (OpenAI GPT-4o)',
      sub: 'Massive Gas Giant',
      top: '38%',
      left: '58%',
      color: '#10a37f',
      glow: 'rgba(16, 163, 127, 0.6)',
      service: 'OpenAI',
      health: (planets.find(p => p.service === 'OpenAI')?.health || 'OPTIMAL') as any,
      reqSec: '342 rps',
      latency: '310ms',
      size: 'w-5 h-5'
    },
    {
      id: 'saturn-stripe',
      name: 'Saturn (Stripe Payments)',
      sub: 'Cassini Ring System',
      top: '42%',
      left: '70%',
      color: '#635bff',
      glow: 'rgba(99, 91, 255, 0.6)',
      service: 'Stripe',
      health: (planets.find(p => p.service === 'Stripe')?.health || 'OPTIMAL') as any,
      reqSec: '185 rps',
      latency: '85ms',
      size: 'w-5 h-5'
    },
    {
      id: 'earth-github',
      name: 'Earth (GitHub & CI/CD)',
      sub: 'Living Biosphere',
      top: '52%',
      left: '42%',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.6)',
      service: 'GitHub',
      health: 'OPTIMAL' as const,
      reqSec: '92 rps',
      latency: '45ms',
      size: 'w-4 h-4'
    },
    {
      id: 'mars-anthropic',
      name: 'Mars (Anthropic Claude)',
      sub: 'Basalt Magma Basin',
      top: '32%',
      left: '46%',
      color: 'rgba(255,255,255,0.8)',
      glow: 'rgba(255,255,255,0.3)',
      service: 'Anthropic',
      health: 'OPTIMAL' as const,
      reqSec: '128 rps',
      latency: '420ms',
      size: 'w-4 h-4'
    },
    {
      id: 'neptune-supabase',
      name: 'Neptune (Supabase DB)',
      sub: 'Outer Ice Giant',
      top: '68%',
      left: '64%',
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.6)',
      service: 'Supabase',
      health: 'OPTIMAL' as const,
      reqSec: '540 rps',
      latency: '18ms',
      size: 'w-4 h-4'
    },
    {
      id: 'gargantua-blackhole',
      name: 'Gargantua Singularity',
      sub: 'Galactic Center Black Hole',
      top: '22%',
      left: '26%',
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.7)',
      service: 'ULTRON Core',
      health: 'OPTIMAL' as any,
      reqSec: '∞ ops',
      latency: '0.01ms',
      size: 'w-7 h-7'
    }
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-white/20 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.25)] group"
    >
      {/* 1. Celestial Video Simulation Engine (Replaced with C:\Users\surya\Downloads\New folder file) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-opacity duration-700"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) {
            const yr = (460 + (v.currentTime / v.duration) * 30).toFixed(1);
            setCurrentTime(`${yr} yr`);
          }
        }}
      >
        <source src={primaryVideoSrc} type="video/mp4" />
        <source src={fallbackVideoSrc} type="video/mp4" />
      </video>

      {/* 2. Cinematic Vignette & Liquid Glass Scanline Shading */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/60 opacity-80" />
      <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%]" />

      {/* 3. Real-Time HUD Overlay */}
      {showHUD && (
        <>
          {/* Top Flight Telemetry Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-4 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="bg-black/85 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.3)] flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-white/20 animate-ping" />
                <span className="text-xs font-display font-black text-white tracking-wider">
                  PLANETARY TRAJECTORIES
                </span>
                <span className="text-[10px] font-mono text-zinc-400 border-l border-white/20 pl-2.5">
                  HELICAL VORTEX SIMULATION
                </span>
              </div>

              <div className="hidden md:flex items-center bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-zinc-300">
                <span className="text-white font-bold mr-1.5">ELAPSED:</span>
                <span>{currentTime}</span>
                <span className="mx-2 text-white/20">|</span>
                <span className="text-zinc-400">SUN FORWARD SPEED:</span>
                <span className="text-white ml-1 font-bold">19.34 AU</span>
              </div>
            </div>

            {/* Asset Status Badge */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
                <span>NEW CELESTIAL ASSET ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Interactive Celestial Nodes Hotspots */}
          {celestialNodes.map((node) => {
            const isAlert = node.health === 'RATE_LIMITED' || node.health === 'EXPIRED';
            const matchedPlanet: ApiKeyPlanet = planets.find(p => p.service.toLowerCase() === node.service.toLowerCase()) || {
              id: node.id,
              name: node.name,
              service: node.service,
              health: node.health as any,
              keyPrefix: 'sk_live_...',
              requestsLast24h: 18420,
              rateLimitPerMinute: 1000,
              currentMinuteUsage: 450,
              costMonthToDate: 124.5,
              subKeysCount: 3,
              expiresAt: null,
              lastUsedAt: 'Just now',
              coordinates: [0, 0, 0],
              environment: 'PRODUCTION'
            };

            return (
              <div
                key={node.id}
                style={{ top: node.top, left: node.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/node"
                onClick={() => {
                  setSelectedPlanet(matchedPlanet as ApiKeyPlanet);
                  if (onSelectPlanet) onSelectPlanet(matchedPlanet as ApiKeyPlanet);
                }}
                onMouseEnter={() => setHoveredPlanet(matchedPlanet as ApiKeyPlanet)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                {/* Glowing Orbital Node Core */}
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute rounded-full animate-ping opacity-60"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: node.color
                    }}
                  />
                  <div
                    className={`${node.size} rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover/node:scale-125`}
                    style={{
                      backgroundColor: node.color,
                      boxShadow: `0 0 16px ${node.glow}`
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Floating Label */}
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-85 group-hover/node:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] font-mono font-bold text-white bg-black/80 px-2 py-0.5 rounded border border-white/20 shadow-md">
                    {node.service}
                  </span>
                </div>

                {/* Hover Preview Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-200 z-30 scale-95 group-hover/node:scale-100">
                  <div className="bg-black/95 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.3)] w-56 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-white">{node.name}</span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: `${node.color}25`,
                          color: node.color,
                          border: `1px solid ${node.color}50`
                        }}
                      >
                        {node.health}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">{node.sub}</div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10 text-[10px] font-mono">
                      <div>
                        <span className="text-zinc-500">Latency:</span>{' '}
                        <span className="text-white font-bold">{node.latency}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Throughput:</span>{' '}
                        <span className="text-white font-bold">{node.reqSec}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* 4. Controls HUD Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-30">
        {/* Left: Playback & Speed Controls */}
        <div className="flex items-center gap-2 bg-black/85 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.25)] pointer-events-auto">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
            title={isPlaying ? 'Pause Video Simulation' : 'Play Video Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-white" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>

          <div className="h-4 w-[1px] bg-white/20 mx-1" />

          {/* Speed Selectors */}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            {([0.5, 1.0, 1.5, 2.0] as const).map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  playbackRate === rate
                    ? 'bg-white/20 text-white font-bold shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: HUD Toggle & Fullscreen */}
        <div className="flex items-center gap-2 bg-black/85 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.25)] pointer-events-auto">
          <button
            onClick={() => setShowHUD(!showHUD)}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-mono transition-all ${
              showHUD ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Toggle Developer Telemetry HUD"
          >
            {showHUD ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">HUD {showHUD ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 5. Selected Planet Telemetry Drawer */}
      {selectedPlanet && (
        <div className="absolute top-16 right-4 w-80 bg-black/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.3)] z-40 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                PLANETARY TELEMETRY
              </span>
              <h3 className="font-display font-black text-lg text-white">
                {selectedPlanet.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Status:</span>
              <Badge variant={selectedPlanet.health === 'OPTIMAL' ? 'healthy' : 'crimson'}>
                {selectedPlanet.health}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Service Gateway:</span>
              <span className="text-white font-bold">{selectedPlanet.service}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">24H Volume:</span>
              <span className="text-white font-bold">{selectedPlanet.requestsLast24h.toLocaleString()} reqs</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Rate Limit Quota:</span>
              <span className="text-white">
                {selectedPlanet.currentMinuteUsage} / {selectedPlanet.rateLimitPerMinute} rpm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Environment:</span>
              <span className="text-white font-bold">{selectedPlanet.environment || 'PRODUCTION'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Sub-Keys / Moons:</span>
              <span className="text-white">{selectedPlanet.subKeysCount || 2} Active Moons</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <a
              href="/playground"
              className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-lg text-center shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all"
            >
              Test in Playground
            </a>
            <a
              href="/vault"
              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-lg transition-all"
            >
              Vault
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
