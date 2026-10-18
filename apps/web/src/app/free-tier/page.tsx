'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';
import {
  HelpCircle,
  CreditCard,
  Code2,
  Search,
  Zap,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface FreeTierItem {
  id: string;
  service: string;
  category: string;
  freeLimit: string;
  currentUsage: number;
  maxQuota: number;
  unit: string;
  percentUsed: number;
  requiresCreditCard: boolean;
  isOpenSource: boolean;
  overagePolicy: string;
}

export default function FreeTierPage() {
  const [gauges, setGauges] = useState<FreeTierItem[]>([]);
  const [noCardOnly, setNoCardOnly] = useState(false);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'percent' | 'name' | 'quota'>('percent');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/free-tier/gauges')
      .then((r) => r.json())
      .then((d) => setGauges(d))
      .catch(() => {});
  }, []);

  const simulateConsumption = (id: string) => {
    setGauges((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const added = Math.max(1, Math.round(g.maxQuota * 0.05));
          const newUsage = Math.min(g.maxQuota, g.currentUsage + added);
          const newPercent = Math.round((newUsage / g.maxQuota) * 1000) / 10;
          return {
            ...g,
            currentUsage: newUsage,
            percentUsed: newPercent
          };
        }
        return g;
      })
    );
  };

  const filtered = gauges
    .filter((g) => {
      if (noCardOnly && g.requiresCreditCard) return false;
      if (openSourceOnly && !g.isOpenSource) return false;
      if (search && !g.service.toLowerCase().includes(search.toLowerCase()) && !g.category.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'percent') return b.percentUsed - a.percentUsed;
      if (sortBy === 'name') return a.service.localeCompare(b.service);
      if (sortBy === 'quota') return b.maxQuota - a.maxQuota;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-zinc-200" />
            <span>FREE TIER FINDER & LIVE FUEL GAUGES</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time planetary fuel consumption vs. provider zero-dollar allowances • Never exceed free quotas
          </p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.06] backdrop-blur-xl p-3 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by service name or category (e.g. Supabase, Redis, Email)..."
            className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-white/30"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNoCardOnly(!noCardOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              noCardOnly
                ? 'bg-white/10 border-emerald-400 text-zinc-200'
                : 'bg-white/[0.08] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>No Card Required</span>
          </button>

          <button
            onClick={() => setOpenSourceOnly(!openSourceOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              openSourceOnly
                ? 'bg-white/10 border-purple-400 text-zinc-200'
                : 'bg-white/[0.08] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Source</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-xs font-mono text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-200" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer"
            >
              <option value="percent" className="bg-white/[0.06] backdrop-blur-xl">Highest Fuel %</option>
              <option value="name" className="bg-white/[0.06] backdrop-blur-xl">Service Name</option>
              <option value="quota" className="bg-white/[0.06] backdrop-blur-xl">Max Quota</option>
            </select>
          </div>
        </div>
      </div>

      {/* Planetary Fuel Reserve Monitor (UIUX Asset 12) */}
      <div className="w-full">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.freeTierStream}
          title="PLANETARY FUEL RESERVE MONITOR"
          badge="ZERO DOLLAR QUOTA STREAM"
          description="Live telemetry of free tier allocation ceilings and real-time consumption limits across all connected API galaxies."
        />
      </div>

      {/* Fuel Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((g) => {
          const isCritical = g.percentUsed >= 80;
          return (
            <GlassPanel
              key={g.id}
              glow={isCritical ? 'danger' : 'cyan'}
              className="p-5 space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-white">{g.service}</h3>
                    {g.isOpenSource && <Badge variant="neutral">Open Source</Badge>}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-200">{g.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={isCritical ? 'error' : 'healthy'} pulse={isCritical}>
                    {g.percentUsed}% FUEL USED
                  </Badge>
                </div>
              </div>

              {/* Fuel Level Info */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Free Allowance:</span>
                  <span className="text-slate-200 text-right">{g.freeLimit}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Burn:</span>
                  <span className="text-zinc-200 font-bold">
                    {g.currentUsage.toLocaleString()} / {g.maxQuota.toLocaleString()} {g.unit}
                  </span>
                </div>
              </div>

              {/* Liquid Fuel Gauge Bar */}
              <div className="relative w-full bg-white/[0.06] backdrop-blur-xl h-3 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-400 shadow-[0_0_12px_#ef4444]'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-400 to-emerald-400 shadow-[0_0_8px_#06b6d4]'
                  }`}
                  style={{ width: `${Math.min(100, g.percentUsed)}%` }}
                />
              </div>

              {/* Overage Policy Banner */}
              <div className="p-2.5 bg-white/[0.06] backdrop-blur-xl/70 rounded-lg border border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate max-w-[280px]">{g.overagePolicy}</span>
                </div>

                {/* Simulated Consumption Trigger */}
                <button
                  onClick={() => simulateConsumption(g.id)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-[10px] shrink-0"
                  title="Simulate Request"
                >
                  + Burn 5%
                </button>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
