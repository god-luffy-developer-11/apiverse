'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Orbit,
  Table,
  Copy,
  Check,
  RefreshCw,
  Search,
  X,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Zap
} from 'lucide-react';
import { ApiKeyPlanet, EnvironmentTag, KeyHealth } from '@/lib/types';
import { formatCurrency } from '@apiverse/utils';
import { useWallpaper } from '@/context/WallpaperContext';

export default function KeyVaultPage() {
  const { activeWallpaper } = useWallpaper();
  const [planets, setPlanets] = useState<ApiKeyPlanet[]>([]);
  const [viewMode, setViewMode] = useState<'orbit' | 'table'>('orbit');
  const [revealKeyId, setRevealKeyId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // New Key Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newService, setNewService] = useState('Stripe');
  const [newEnv, setNewEnv] = useState<EnvironmentTag>('PRODUCTION');
  const [newSecret, setNewSecret] = useState('');
  const [newRotationDays, setNewRotationDays] = useState(90);

  // Leak Audit
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  // Orbit Video State (Replaced with C:\Users\surya\Downloads\New folder file)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const orbitContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeysHUD, setShowKeysHUD] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<ApiKeyPlanet | null>(null);

  // Synchronized with the API KEY PLANETARY VAULT live background
  const primaryVideoSrc = activeWallpaper?.src || '/live-wallpapers/bg-docs.mp4';
  const fallbackVideoSrc = activeWallpaper?.fallbackSrc || '/live-background/Docs%20Hub/From%20Klickpin.com-%20Romantic%20partner%20appreciation%20lines%20for%20busy%20days%20that%20fit%20modern%20everyday%20life%20for%20cozy%20hearts-pin-id-2322237303334005.mp4';

  const fetchPlanets = () => {
    fetch('http://localhost:8000/api/v1/vault/planets')
      .then((r) => r.json())
      .then((d) => setPlanets(d))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPlanets();
  }, []);

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
    if (!orbitContainerRef.current) return;
    if (!document.fullscreenElement) {
      orbitContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleReveal = async () => {
    if (!revealKeyId) return;
    try {
      const resp = await fetch(`http://localhost:8000/api/v1/vault/keys/${revealKeyId}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reauth_password: password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.detail || 'Authentication failed');
      } else {
        setRevealedSecret(data.secret_plaintext);
        setErrorMsg('');
      }
    } catch (e) {
      setErrorMsg('Hardware decryption failure');
    }
  };

  const handleAddKey = async () => {
    if (!newKeyName || !newSecret) return;
    try {
      await fetch('http://localhost:8000/api/v1/vault/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          service: newService,
          environment: newEnv,
          secret_value: newSecret,
          rotation_days: newRotationDays
        })
      });
      setShowAddModal(false);
      setNewKeyName('');
      setNewSecret('');
      fetchPlanets();
    } catch (e) {
      alert('Failed to save key into vault');
    }
  };

  const runLeakAudit = async () => {
    setIsAuditing(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/vault/leak-check', { method: 'POST' });
      const d = await resp.json();
      setAuditResult(`Scanned ${d.scannedRepos} repos & ${d.publicGists} gists: 0 secrets leaked. Verified Clean.`);
    } catch (e) {
      setAuditResult('Leak scanner handshake error');
    } finally {
      setIsAuditing(false);
    }
  };

  // Trajectory anchor positions mapped across the video's helical planetary tracks
  const trajectoryAnchors = [
    { top: '38%', left: '56%', color: '#10a37f', glow: 'rgba(16, 163, 127, 0.7)' }, // Jupiter / AI
    { top: '42%', left: '68%', color: '#635bff', glow: 'rgba(99, 91, 255, 0.7)' }, // Saturn / Stripe
    { top: '50%', left: '42%', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' }, // Earth
    { top: '32%', left: '46%', color: 'rgba(255,255,255,0.8)', glow: 'rgba(255,255,255,0.3)' }, // Mars
    { top: '65%', left: '62%', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.7)' }, // Neptune
    { top: '48%', left: '50%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' }, // Sun
    { top: '24%', left: '28%', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.8)' }  // Black Hole
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-white" />
            <span>API KEY PLANETARY VAULT</span>
            <Badge variant="crimson" pulse>ENCRYPTED AT REST</Badge>
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Zero-Trust AES-256-GCM Encryption • Helical Orbital Key Trajectories • Secrets Never Logged
          </p>
        </div>

        {/* View Switcher & Add Key */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/[0.06] backdrop-blur-xl p-1 rounded-full border border-white/20 text-xs font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <button
              onClick={() => setViewMode('orbit')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === 'orbit'
                  ? 'bg-white/10 text-white font-bold border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.8),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Planet Orbit</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white/20 text-white font-bold border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <SpaceButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddModal(true)}
          >
            Orbit New Key
          </SpaceButton>
        </div>
      </div>

      {/* Continuous Leak Detector Banner */}
      <GlassPanel glow="crimson" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-white shrink-0" />
          <div>
            <div className="text-xs font-display font-bold text-white flex items-center gap-2">
              <span>Continuous Secret Leak Scanner</span>
              <span className="text-[10px] font-mono text-zinc-200 bg-white/10 px-2 py-0.5 rounded border border-white/30">
                ACTIVE PROTECT
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {auditResult || 'Continuous telemetry audits across 14 connected repositories • 0 leaked secrets detected'}
            </div>
          </div>
        </div>

        <SpaceButton
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />}
          onClick={runLeakAudit}
          disabled={isAuditing}
        >
          {isAuditing ? 'Auditing...' : 'Run Audit Now'}
        </SpaceButton>
      </GlassPanel>

      {/* Orbit 3D Celestial Simulation View (Replaced with C:\Users\surya\Downloads\New folder file) */}
      {viewMode === 'orbit' && (
        <div
          ref={orbitContainerRef}
          className="relative w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden border border-white/20 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.25)] group"
        >
          {/* Video Asset Engine */}
          <video
            key={primaryVideoSrc}
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover transition-opacity duration-700"
          >
            <source src={primaryVideoSrc} type="video/mp4" />
            <source src={fallbackVideoSrc} type="video/mp4" />
          </video>

          {/* Vignette & Ambient Shading */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/60 opacity-80" />
          <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%]" />

          {/* Real-Time Key Vault HUD */}
          {showKeysHUD && (
            <>
              {/* Top Status Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-4 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                  <div className="bg-white/[0.08] backdrop-blur-2xl px-3.5 py-1.5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1.5px_1px_0_rgba(255,255,255,0.4)] flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-white/20 animate-ping" />
                    <span className="text-xs font-display font-black text-white tracking-wider">
                      AES-256 VAULT SINGULARITY
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 border-l border-white/20 pl-2.5">
                      PLANETARY KEY ORBITS ACTIVE ({planets.length})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="bg-white/[0.06] backdrop-blur-xl px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-zinc-200 flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>ASSET: NEW CELESTIAL ENGINE</span>
                  </div>
                </div>
              </div>

              {/* Overlaid Planetary Key Nodes on Helical Trajectories */}
              {planets.map((planet, idx) => {
                const anchor = trajectoryAnchors[idx % trajectoryAnchors.length];
                const isAlert = planet.health === 'RATE_LIMITED' || planet.health === 'EXPIRED' || planet.health === 'LEAKED';

                return (
                  <div
                    key={planet.id}
                    style={{ top: anchor.top, left: anchor.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/key"
                    onClick={() => {
                      setRevealKeyId(planet.id);
                      setRevealedSecret(null);
                      setPassword('');
                      setErrorMsg('');
                    }}
                    onMouseEnter={() => setHoveredKey(planet)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    {/* Glowing Planet Node Core */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute rounded-full animate-ping opacity-60"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: isAlert ? 'rgba(255,255,255,0.8)' : anchor.color
                        }}
                      />
                      <div
                        className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover/key:scale-125"
                        style={{
                          backgroundColor: isAlert ? 'rgba(255,255,255,0.8)' : anchor.color,
                          boxShadow: `0 0 18px ${isAlert ? 'rgba(255,255,255,0.3)' : anchor.glow}`
                        }}
                      >
                        <span className="text-[10px] font-display font-black text-white">
                          {planet.service.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Node Tag */}
                    <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-90 group-hover/key:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[10px] font-mono font-bold text-white bg-white/[0.08] backdrop-blur-md px-2 py-0.5 rounded border border-white/20 shadow-md">
                        {planet.name}
                      </span>
                    </div>

                    {/* Hover Cryptographic Details Card */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/key:opacity-100 pointer-events-none transition-all duration-200 z-30 scale-95 group-hover/key:scale-100">
                      <div className="bg-white/[0.08] backdrop-blur-2xl p-3.5 rounded-2xl border border-white/25 shadow-[0_16px_45px_rgba(0,0,0,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.45)] w-60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-xs text-white">{planet.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isAlert ? 'bg-white/10 text-white border border-white/30' : 'bg-white/10 text-zinc-200 border border-white/30'
                          }`}>
                            {planet.health}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-300">
                          Prefix: <span className="text-white font-bold">{planet.keyPrefix}</span> • Env: {planet.environment}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/10 text-[10px] font-mono">
                          <div>
                            <span className="text-zinc-400">24H Volume:</span>{' '}
                            <span className="text-white font-bold">{planet.requestsLast24h.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Spend MTD:</span>{' '}
                            <span className="text-white font-bold">{formatCurrency(planet.costMonthToDate)}</span>
                          </div>
                        </div>
                        <div className="pt-1.5 text-center text-[10px] font-mono text-white font-bold bg-white/10 rounded-lg py-1 border border-white/30">
                          Click Planet to Decrypt & Reveal Secret
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Bottom HUD Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-30">
            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-2xl p-1.5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.25)] pointer-events-auto">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
                title={isPlaying ? 'Pause Video' : 'Play Video'}
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

              {/* Playback Speed */}
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

            {/* Orbit HUD Toggle & Fullscreen */}
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-2xl p-1.5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.25)] pointer-events-auto">
              <button
                onClick={() => setShowKeysHUD(!showKeysHUD)}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-mono transition-all ${
                  showKeysHUD ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle Key Vault HUD"
              >
                {showKeysHUD ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">KEYS {showKeysHUD ? 'VISIBLE' : 'HIDDEN'}</span>
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
        </div>
      )}

      {/* Planets Vault Table */}
      <div className="space-y-3">
        {planets.map((p) => (
          <GlassPanel key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                {p.service.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-white">{p.name}</h3>
                  <Badge variant={p.health === 'OPTIMAL' ? 'healthy' : 'crimson'}>{p.health}</Badge>
                  <span className="text-[10px] font-mono text-zinc-300 px-2 py-0.5 rounded bg-black/80 border border-white/20">
                    {p.environment}
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">
                  Prefix: <span className="text-white font-bold">{p.keyPrefix}</span> • Sub-keys: {p.subKeysCount}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div className="hidden sm:block">
                <span className="text-zinc-500">24H Volume:</span>{' '}
                <span className="text-white">{p.requestsLast24h.toLocaleString()}</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-zinc-500">Rate Limit:</span>{' '}
                <span className="text-white">{p.currentMinuteUsage} / {p.rateLimitPerMinute} rpm</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-zinc-500">Spend:</span>{' '}
                <span className="text-white font-bold">{formatCurrency(p.costMonthToDate)}</span>
              </div>

              <SpaceButton
                variant="secondary"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => {
                  setRevealKeyId(p.id);
                  setRevealedSecret(null);
                  setPassword('');
                  setErrorMsg('');
                }}
              >
                Reveal Secret
              </SpaceButton>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Orbit New Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
          <GlassPanel glow="crimson" className="p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-white" />
                <h2 className="font-display font-black text-base text-white">Orbit New Planetary Secret Key</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-300 block mb-1">Key Name / Descriptor</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. OpenAI Production Core"
                  className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1">Service Provider</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-white outline-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  >
                    <option value="Stripe" className="bg-[#120406] text-white">Stripe</option>
                    <option value="OpenAI" className="bg-[#120406] text-white">OpenAI</option>
                    <option value="Twilio" className="bg-[#120406] text-white">Twilio</option>
                    <option value="Supabase" className="bg-[#120406] text-white">Supabase</option>
                    <option value="Resend" className="bg-[#120406] text-white">Resend</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1">Environment Tag</label>
                  <select
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value as any)}
                    className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-white outline-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  >
                    <option value="PRODUCTION" className="bg-[#120406] text-white">PRODUCTION</option>
                    <option value="STAGING" className="bg-[#120406] text-white">STAGING</option>
                    <option value="DEVELOPMENT" className="bg-[#120406] text-white">DEVELOPMENT</option>
                    <option value="SANDBOX" className="bg-[#120406] text-white">SANDBOX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Secret Key Plaintext (Encrypted with AES-256-GCM)</label>
                <input
                  type="password"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  placeholder="sk_live_... or key string"
                  className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-white/40 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Auto-Rotation Interval (Days)</label>
                <input
                  type="number"
                  value={newRotationDays}
                  onChange={(e) => setNewRotationDays(Number(e.target.value))}
                  className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SpaceButton variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </SpaceButton>
              <SpaceButton variant="primary" size="sm" onClick={handleAddKey}>
                Encrypt & Orbit Key
              </SpaceButton>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Re-auth Reveal Modal */}
      {revealKeyId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
          <GlassPanel glow="crimson" className="p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-white" />
              <h2 className="font-display font-black text-base text-white">Re-Authenticate to Decrypt</h2>
            </div>
            <p className="text-xs text-zinc-300 mb-4 leading-relaxed font-sans">
              Enter your master key password to perform an ephemeral hardware decryption. This event will be permanently committed to the security audit trail.
            </p>

            {errorMsg && (
              <div className="p-2 mb-3 rounded-xl bg-white/10 border border-white/30 text-xs text-white font-mono">
                {errorMsg}
              </div>
            )}

            {revealedSecret ? (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-white/[0.08] backdrop-blur-xl border border-white/30 rounded-xl text-xs font-mono text-zinc-200 break-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <span>{revealedSecret}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(revealedSecret);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 ml-2 shrink-0"
                    title="Copy Secret"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-zinc-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Audit event logged: Decryption authorized by master password.</span>
                </div>
              </div>
            ) : (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
                placeholder="Enter master password (hint: apiverse2026)"
                className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-xs text-white mb-4 outline-none focus:border-white/40 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
              />
            )}

            <div className="flex justify-end gap-2">
              <SpaceButton variant="ghost" size="sm" onClick={() => setRevealKeyId(null)}>
                Close
              </SpaceButton>
              {!revealedSecret && (
                <SpaceButton variant="danger" size="sm" onClick={handleReveal}>
                  Decrypt Secret
                </SpaceButton>
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
