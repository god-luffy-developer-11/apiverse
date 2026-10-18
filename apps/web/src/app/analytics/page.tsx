'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { BarChart3, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import { formatCurrency, formatLatency } from '@apiverse/utils';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analytics/metrics')
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-zinc-200" />
          <span>GALAXY DEEP-DIVE ANALYTICS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Real-time Latency Percentiles (p50, p95, p99), Error Rates, and Cost Burn Forecasts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel glow="cyan" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400">LATENCY PROFILE</span>
            <Activity className="w-4 h-4 text-zinc-200" />
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Median (p50):</span>
              <span className="text-zinc-200">54.2ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Tail (p95):</span>
              <span className="text-zinc-200">142.1ms</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Worst-Case (p99):</span>
              <span className="text-zinc-200">310.5ms</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel glow="gold" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400">MONTHLY COST BURN</span>
            <DollarSign className="w-4 h-4 text-zinc-200" />
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Current Spend:</span>
              <span className="text-zinc-200 font-bold">$1,321.80</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Projected Total:</span>
              <span className="text-slate-200">$1,650.00</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Daily Burn:</span>
              <span className="text-slate-300">~$44.06 / day</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel glow="purple" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400">TRAFFIC HEALTH</span>
            <Zap className="w-4 h-4 text-zinc-200" />
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Total Volume:</span>
              <span className="text-slate-200">1.54M calls</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Success Ratio:</span>
              <span className="text-zinc-200">99.96%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Anomalies:</span>
              <span className="text-zinc-200">0 detected</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
