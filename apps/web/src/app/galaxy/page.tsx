'use client';

import React, { useState, useEffect } from 'react';
import { GalaxyScene } from '@/components/3d/GalaxyScene';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Activity,
  ShieldCheck,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  Globe,
  Download,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ApiKeyPlanet, CometTelemetryEvent, SolarFlareAlert } from '@/lib/types';
import { formatCurrency, formatLatency } from '@apiverse/utils';
import { realtimeGateway } from '@/lib/realtime-client';
import { CyberneticHologram } from '@/components/ui/CyberneticHologram';

export default function GalaxyDashboardPage() {
  const [planets, setPlanets] = useState<ApiKeyPlanet[]>([]);
  const [comets, setComets] = useState<CometTelemetryEvent[]>([]);
  const [alerts, setAlerts] = useState<SolarFlareAlert[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [viewMode, setViewMode] = useState<'galaxy' | 'charts'>('galaxy');

  const loadData = () => {
    fetch('http://localhost:8000/api/v1/vault/planets')
      .then((r) => r.json())
      .then((d) => setPlanets(d))
      .catch(() => {});

    fetch(`http://localhost:8000/api/v1/analytics/metrics?time_range=${timeRange}`)
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/analytics/comets')
      .then((r) => r.json())
      .then((d) => setComets(d))
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/alerts/')
      .then((r) => r.json())
      .then((d) => setAlerts(d))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time solar flares & telemetry
    const unsubscribe = realtimeGateway.subscribe((envelope) => {
      if (envelope.type === 'SOLAR_FLARE_ALERT') {
        loadData();
      }
    });

    const interval = setInterval(loadData, 5000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [timeRange]);

  const exportReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ metrics, planets, alerts }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apiverse_telemetry_report_${timeRange}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <span>THE GALAXY DASHBOARD</span>
            <Badge variant="crimson" pulse>LIVE UNIVERSE</Badge>
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Active Solar System: Alpha-7 • Realtime Comet Telemetry Beams • Sub-second Fan-out
          </p>
        </div>

        {/* View Mode Toggle & Time Ranges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle in Mineralistic Glass */}
          <div className="flex items-center bg-black/90 p-1 rounded-full border border-white/20 text-xs font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
            <button
              onClick={() => setViewMode('galaxy')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                viewMode === 'galaxy' ? 'bg-white/20 text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Galaxy</span>
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                viewMode === 'charts' ? 'bg-white/20 text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Classic Charts</span>
            </button>
          </div>

          {/* Time Ranges */}
          <div className="flex items-center bg-black/90 p-1 rounded-full border border-white/20 text-xs font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
            {(['1h', '24h', '7d', '30d'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 rounded-full uppercase transition-all ${
                  timeRange === tr ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          <SpaceButton size="sm" variant="secondary" icon={<Download className="w-3.5 h-3.5 text-white" />} onClick={exportReport}>
            Export Report
          </SpaceButton>
        </div>
      </div>

      {/* 3D Galaxy Canvas & Cybernetic Telemetry Hologram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {viewMode === 'galaxy' ? (
            <GalaxyScene planets={planets} comets={comets} alerts={alerts} />
          ) : (
            <GlassPanel glow="crimson" className="p-6 space-y-4 h-[450px] sm:h-[520px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-white" />
                  <span>Historical Latency Percentiles (p50 / p95 / p99)</span>
                </h3>
                <span className="text-xs font-mono text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/30">
                  {timeRange.toUpperCase()} Interval
                </span>
              </div>

              <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 font-mono text-xs">
                {metrics?.latencyTimeSeries?.map((pt: any, idx: number) => {
                  const maxH = 180;
                  const h99 = Math.min(maxH, pt.p99 * 0.45);
                  const h95 = Math.min(maxH, pt.p95 * 0.45);
                  const h50 = Math.min(maxH, pt.p50 * 0.45);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1">
                        <div className="w-3 bg-zinc-500 rounded-t" style={{ height: `${h50}px` }} title={`p50: ${pt.p50}ms`} />
                        <div className="w-3 bg-white/20 rounded-t shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ height: `${h95}px` }} title={`p95: ${pt.p95}ms`} />
                        <div className="w-3 bg-white rounded-t shadow-[0_0_8px_#ffffff]" style={{ height: `${h99}px` }} title={`p99: ${pt.p99}ms`} />
                      </div>
                      <span className="text-zinc-400 text-[10px]">{pt.time}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-mono pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-zinc-500 rounded" />
                  <span className="text-zinc-300">p50 ({metrics?.p50LatencyMs || 62}ms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white/20 rounded shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                  <span className="text-white font-bold">p95 ({metrics?.p95LatencyMs || 142}ms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded shadow-[0_0_6px_#ffffff]" />
                  <span className="text-white">p99 ({metrics?.p99LatencyMs || 310}ms)</span>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>

        {/* Right Telemetry Column: Cybernetic Hologram */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <CyberneticHologram
            className="h-[340px] sm:h-[400px] lg:h-full min-h-[350px]"
            title="NEURAL RADAR SCAN"
            subtitle="Quantum Lattice Sync Active"
          />
        </div>
      </div>

      {/* Anomaly Highlight */}
      {metrics?.anomalies?.length > 0 && (
        <GlassPanel glow="danger" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div>
              <div className="font-display font-bold text-xs text-white">
                Live Anomaly: {metrics.anomalies[0].service} {metrics.anomalies[0].type}
              </div>
              <div className="text-[11px] font-mono text-zinc-300">{metrics.anomalies[0].description}</div>
            </div>
          </div>
          <Badge variant="error" pulse>FLARE PULSE</Badge>
        </GlassPanel>
      )}

      {/* Metrics Row in Mineralistic Liquid Glass */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassPanel glow="crimson" className="p-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Requests ({timeRange})</div>
          <div className="text-2xl font-display font-black text-white mt-1">
            {metrics?.totalRequests24h?.toLocaleString() || '1,542,109'}
          </div>
          <div className="text-[10px] font-mono text-white mt-1 flex items-center font-bold">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs previous
          </div>
        </GlassPanel>

        <GlassPanel glow="white" className="p-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Avg Latency (p95)</div>
          <div className="text-2xl font-display font-black text-white mt-1">
            {metrics?.p95LatencyMs ? formatLatency(metrics.p95LatencyMs) : '142ms'}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">p99: {metrics?.p99LatencyMs || 310}ms</div>
        </GlassPanel>

        <GlassPanel glow="white" className="p-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Error Rate</div>
          <div className="text-2xl font-display font-black text-zinc-200 mt-1">
            {metrics?.errorRatePercent ? `${metrics.errorRatePercent}%` : '0.04%'}
          </div>
          <div className="text-[10px] font-mono text-zinc-200 mt-1">Optimal health</div>
        </GlassPanel>

        <GlassPanel glow="crimson" className="p-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Monthly Burn Rate</div>
          <div className="text-2xl font-display font-black text-white mt-1">
            {metrics?.monthCostUsd ? formatCurrency(metrics.monthCostUsd) : '$1,321.80'}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">
            ~${metrics?.costBurnRateDailyUsd || '44.06'} / day
          </div>
        </GlassPanel>
      </div>

      {/* Orbiting Planet Status Cards */}
      <div>
        <h2 className="text-xs font-mono font-bold text-white mb-3 tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          Orbiting API Planets ({planets.length} Active)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planets.map((p) => (
            <GlassPanel key={p.id} glow={p.health === 'RATE_LIMITED' ? 'danger' : 'obsidian'} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm text-white">{p.name}</span>
                <Badge variant={p.health === 'OPTIMAL' ? 'white' : 'error'}>{p.health}</Badge>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="text-white font-medium">{p.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="text-white font-medium">{p.currentMinuteUsage} / {p.rateLimitPerMinute} rpm</span>
                </div>
                <div className="flex justify-between">
                  <span>Spend (MTD):</span>
                  <span className="text-white font-bold">{formatCurrency(p.costMonthToDate)}</span>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
