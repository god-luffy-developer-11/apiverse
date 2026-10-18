'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  BellRing,
  Flame,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  Plus,
  X,
  Mail,
  MessageSquare
} from 'lucide-react';
import { SolarFlareAlert } from '@/lib/types';
import { realtimeGateway } from '@/lib/realtime-client';

interface Rule {
  id: string;
  ruleName: string;
  service: string;
  condition: string;
  threshold: number;
  channels: string[];
}

export default function SmartAlertsPage() {
  const [alerts, setAlerts] = useState<SolarFlareAlert[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [isFiringFlare, setIsFiringFlare] = useState(false);

  // New Rule State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleService, setNewRuleService] = useState('Stripe');
  const [newRuleCondition, setNewRuleCondition] = useState('LATENCY_P95');
  const [newRuleThreshold, setNewRuleThreshold] = useState(250);

  const loadData = () => {
    fetch('http://localhost:8000/api/v1/alerts/')
      .then((r) => r.json())
      .then((d) => setAlerts(d))
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/alerts/rules')
      .then((r) => r.json())
      .then((d) => setRules(d))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    // Subscribe to live solar flare bursts
    const unsubscribe = realtimeGateway.subscribe((envelope) => {
      if (envelope.type === 'SOLAR_FLARE_ALERT') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const acknowledge = async (id: string) => {
    await fetch(`http://localhost:8000/api/v1/alerts/${id}/acknowledge`, { method: 'POST' });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const snooze = async (id: string, hours: number) => {
    await fetch(`http://localhost:8000/api/v1/alerts/${id}/snooze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours })
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const triggerTestSolarFlare = async () => {
    setIsFiringFlare(true);
    try {
      await fetch('http://localhost:8000/api/v1/alerts/trigger-flare?service=Stripe&planet_id=key_01', {
        method: 'POST'
      });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFiringFlare(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRuleName) return;
    try {
      await fetch('http://localhost:8000/api/v1/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleName: newRuleName,
          service: newRuleService,
          planetId: 'key_01',
          condition: newRuleCondition,
          threshold: Number(newRuleThreshold),
          channels: ['in-app', 'slack']
        })
      });
      setShowCreateRule(false);
      setNewRuleName('');
      loadData();
    } catch (e) {
      alert('Failed to create rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-white" />
            <span>SMART ALERTS & SOLAR FLARE SUPERNOVAS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time planetary incident pulses • Multi-channel dispatch (Slack, Discord, Webhooks) • AI root cause analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SpaceButton
            variant="danger"
            size="sm"
            icon={<Flame className={`w-3.5 h-3.5 ${isFiringFlare ? 'animate-bounce' : ''}`} />}
            onClick={triggerTestSolarFlare}
            disabled={isFiringFlare}
          >
            {isFiringFlare ? 'Erupting...' : 'Trigger Test Solar Flare'}
          </SpaceButton>

          <SpaceButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowCreateRule(true)}
          >
            New Alert Rule
          </SpaceButton>
        </div>
      </div>

      {/* Active Solar Flare Incidents */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Active Celestial Flare Incidents ({alerts.filter((a) => !a.acknowledged).length} Unacknowledged)
        </div>

        {alerts.map((a: any) => (
          <GlassPanel key={a.id} glow={a.severity === 'CRITICAL' ? 'danger' : 'gold'} className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Flame className={`w-5 h-5 ${a.severity === 'CRITICAL' ? 'text-white animate-pulse' : 'text-zinc-200'}`} />
                <div>
                  <h3 className="font-display font-bold text-sm text-white">{a.ruleName}</h3>
                  <span className="text-[10px] font-mono text-zinc-200">
                    Target Planet: {a.service} • Triggered: {a.triggeredAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.06] backdrop-blur-xl border border-white/10">
                  Dedupe: {a.dedupeCount || 1}x
                </span>

                <Badge variant={a.severity === 'CRITICAL' ? 'error' : 'warning'}>
                  {a.severity}
                </Badge>

                {a.acknowledged ? (
                  <Badge variant="healthy">ACKNOWLEDGED</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => snooze(a.id, 1)}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 border border-white/10"
                    >
                      Snooze 1h
                    </button>
                    <SpaceButton size="sm" variant="danger" onClick={() => acknowledge(a.id)}>
                      Acknowledge
                    </SpaceButton>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">{a.message}</p>

            {/* AI Incident Summary */}
            {a.aiIncidentSummary && (
              <div className="p-3 bg-white/[0.06] backdrop-blur-xl rounded-lg border border-pink-500/20 text-xs font-mono text-pink-200">
                <div className="flex items-center gap-1.5 text-pink-400 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ULTRON INCIDENT ROOT-CAUSE SYNTHESIS:</span>
                </div>
                {a.aiIncidentSummary}
              </div>
            )}
          </GlassPanel>
        ))}
      </div>

      {/* Alert Rules & Delivery Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Rules Table */}
        <GlassPanel className="p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-200" />
              <span>Configured Detection Rules</span>
            </h3>
            <span className="text-[11px] font-mono text-zinc-200">{rules.length} Rules Active</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {rules.map((r) => (
              <div key={r.id} className="p-2.5 bg-white/[0.06] backdrop-blur-xl rounded-lg border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">{r.ruleName}</div>
                  <div className="text-[10px] text-slate-400">Target: {r.service} • Threshold: {r.threshold}</div>
                </div>
                <div className="flex gap-1">
                  {r.channels?.map((ch) => (
                    <span key={ch} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-300 uppercase">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Multi-Channel Dispatch Center */}
        <GlassPanel glow="cyan" className="p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-200" />
              <span>Multi-Channel Dispatch Posture</span>
            </h3>
            <Badge variant="healthy">ALL CONNECTED</Badge>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { name: 'In-App Solar Flare Glow', status: 'ACTIVE', desc: 'Realtime WebSockets event pulse on 3D Galaxy' },
              { name: 'Slack Integration', status: 'CONNECTED', desc: '#alerts-production channel webhook' },
              { name: 'Discord Webhook', status: 'CONNECTED', desc: 'APIVerse incident bot webhook' },
              { name: 'Email Delivery (Resend)', status: 'ACTIVE', desc: 'Instant incident briefing to team astronauts' }
            ].map((ch, idx) => (
              <div key={idx} className="p-2.5 bg-white/[0.06] backdrop-blur-xl rounded-lg border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{ch.name}</div>
                  <div className="text-[10px] text-slate-400">{ch.desc}</div>
                </div>
                <span className="text-[10px] text-zinc-200 font-bold">{ch.status}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassPanel glow="cyan" className="p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="font-display font-bold text-base text-white">Create New Smart Alert Rule</h2>
              <button onClick={() => setShowCreateRule(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. OpenAI Response Latency > 500ms"
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Service Planet</label>
                <select
                  value={newRuleService}
                  onChange={(e) => setNewRuleService(e.target.value)}
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none"
                >
                  <option value="Stripe">Stripe</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Twilio">Twilio</option>
                  <option value="All Planets">All Planets</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Condition Trigger</label>
                <select
                  value={newRuleCondition}
                  onChange={(e) => setNewRuleCondition(e.target.value)}
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none"
                >
                  <option value="LATENCY_P95">Latency p95 Threshold (ms)</option>
                  <option value="ERROR_RATE">Error Rate (%)</option>
                  <option value="QUOTA_80">Quota Reached 80%</option>
                  <option value="KEY_EXPIRY">Key Expiry Warning</option>
                  <option value="KEY_LEAK">Key Leak Detected</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Threshold Value</label>
                <input
                  type="number"
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                  className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SpaceButton variant="ghost" size="sm" onClick={() => setShowCreateRule(false)}>
                Cancel
              </SpaceButton>
              <SpaceButton variant="primary" size="sm" onClick={handleCreateRule}>
                Create Detection Rule
              </SpaceButton>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
