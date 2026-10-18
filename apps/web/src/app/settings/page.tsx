'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Settings,
  Shield,
  CreditCard,
  Webhook,
  Users,
  Check,
  RefreshCw,
  ExternalLink,
  Activity,
  Lock,
  Zap,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Role } from '@/lib/types';

interface WebhookDelivery {
  id: string;
  event: string;
  service: string;
  destinationUrl: string;
  status: number;
  payloadPreview: string;
  latencyMs: number;
  attempts: number;
  timestamp: string;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  intervalSeconds: number;
  status: string;
  uptimePercent: number;
  lastChecked: string;
  lastLatencyMs: number;
}

const ROSTER = [
  {
    id: 'usr_01',
    name: 'Commander Shepard',
    email: 'shepard@apiverse.io',
    role: 'OWNER' as Role,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    activeSince: 'Jan 2026'
  },
  {
    id: 'usr_02',
    name: 'Liara T\'Soni',
    email: 'liara@apiverse.io',
    role: 'ADMIN' as Role,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    activeSince: 'Feb 2026'
  },
  {
    id: 'usr_03',
    name: 'Garrus Vakarian',
    email: 'garrus@apiverse.io',
    role: 'DEVELOPER' as Role,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    activeSince: 'Mar 2026'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'billing' | 'rbac' | 'webhooks' | 'monitors'>('billing');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'team'>('team');
  const [webhooks, setWebhooks] = useState<WebhookDelivery[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/webhooks/deliveries')
      .then((r) => r.json())
      .then((d) => setWebhooks(d))
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/webhooks/monitors')
      .then((r) => r.json())
      .then((d) => setMonitors(d))
      .catch(() => {});
  }, []);

  const handleRetryWebhook = async (id: string) => {
    setReplayingId(id);
    try {
      const resp = await fetch(`http://localhost:8000/api/v1/webhooks/deliveries/${id}/retry`, {
        method: 'POST'
      });
      const data = await resp.json();
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 200, attempts: w.attempts + 1 } : w))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setReplayingId(null);
    }
  };

  const handlePingMonitor = async (id: string) => {
    try {
      const resp = await fetch(`http://localhost:8000/api/v1/webhooks/monitors/${id}/ping`, {
        method: 'POST'
      });
      const data = await resp.json();
      setMonitors((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lastLatencyMs: data.latencyMs, lastChecked: 'Just now' } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-zinc-200" />
          <span>WORKSPACE SETTINGS & ARMADA MANAGEMENT</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Manage SaaS billing tiers, Role-Based Access Control (RBAC), webhook delivery retries, and scheduled uptime monitors
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        {[
          { id: 'billing', label: 'SaaS Billing Tiers', icon: CreditCard },
          { id: 'rbac', label: 'Astronaut Roster & RBAC', icon: Users },
          { id: 'webhooks', label: 'Webhooks & Replays', icon: Webhook },
          { id: 'monitors', label: 'Uptime Health Monitors', icon: Activity }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-white/10 text-zinc-200 font-bold border border-white/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.06] backdrop-blur-xl border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SAAS BILLING TIERS */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <GlassPanel className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Free Astronaut</h3>
                  <p className="text-xs text-slate-400 mt-1">For indie hackers and hobbyists</p>
                </div>
                <span className="text-2xl font-display font-bold text-zinc-200">$0</span>
              </div>

              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2">✓ Up to 3 Key Vault Planets</li>
                <li className="flex items-center gap-2">✓ 5,000 Playground proxy requests/mo</li>
                <li className="flex items-center gap-2">✓ 10 Ultron AI queries / day</li>
                <li className="flex items-center gap-2">✓ In-app alert notifications</li>
              </ul>

              <button
                onClick={() => setSelectedTier('free')}
                className={`w-full py-2 rounded-lg text-xs font-mono border transition-all ${
                  selectedTier === 'free'
                    ? 'bg-white/20 text-black font-bold'
                    : 'bg-white/[0.06] backdrop-blur-xl text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {selectedTier === 'free' ? 'Current Tier' : 'Downgrade to Free'}
              </button>
            </GlassPanel>

            {/* Pro */}
            <GlassPanel glow="cyan" className="p-6 space-y-4 border-white/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Pro Commander</h3>
                  <p className="text-xs text-slate-400 mt-1">For professional developers</p>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold text-zinc-200">$29</span>
                  <span className="text-[10px] text-slate-400">/mo</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2">✓ 15 Key Vault Planets</li>
                <li className="flex items-center gap-2">✓ 100,000 Playground proxy requests</li>
                <li className="flex items-center gap-2">✓ Unlimited Ultron AI streaming</li>
                <li className="flex items-center gap-2">✓ Slack & Discord Webhooks</li>
              </ul>

              <button
                onClick={() => setSelectedTier('pro')}
                className={`w-full py-2 rounded-lg text-xs font-mono border transition-all ${
                  selectedTier === 'pro'
                    ? 'bg-white/20 text-black font-bold'
                    : 'bg-white/[0.06] backdrop-blur-xl text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {selectedTier === 'pro' ? 'Current Tier' : 'Upgrade to Pro'}
              </button>
            </GlassPanel>

            {/* Team Armada */}
            <GlassPanel glow="gold" className="p-6 space-y-4 border-white/30 bg-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">Team Armada</h3>
                    <Badge variant="healthy">ACTIVE</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">For high-throughput SaaS companies</p>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold text-zinc-200">$149</span>
                  <span className="text-[10px] text-slate-400">/mo</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2">✓ Unlimited Key Vault Planets</li>
                <li className="flex items-center gap-2">✓ Multi-user WebSocket collaboration</li>
                <li className="flex items-center gap-2">✓ Multi-model Gemini & GPT-4o Ultron</li>
                <li className="flex items-center gap-2">✓ Custom SSRF proxy egress IPs</li>
                <li className="flex items-center gap-2">✓ 99.99% SLA Uptime Guarantee</li>
              </ul>

              <button
                onClick={() => setSelectedTier('team')}
                className="w-full py-2 rounded-lg text-xs font-mono bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                Active Subscription (Manage Stripe)
              </button>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* TAB 2: ASTRONAUT ROSTER & RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <GlassPanel className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-sm text-white">Astronaut Crew Roster (3 Members)</h3>
              <SpaceButton variant="primary" size="sm">Invite Astronaut</SpaceButton>
            </div>

            <div className="space-y-3">
              {ROSTER.map((usr) => (
                <div key={usr.id} className="p-3 bg-white/[0.06] backdrop-blur-xl rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={usr.avatar} alt={usr.name} className="w-10 h-10 rounded-full border border-cyan-400 object-cover" />
                    <div>
                      <div className="font-display font-bold text-sm text-white">{usr.name}</div>
                      <div className="text-xs font-mono text-slate-400">{usr.email} • Joined {usr.activeSince}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={usr.role}
                      className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 outline-none"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Granular RBAC Permissions Matrix */}
          <GlassPanel glow="cyan" className="p-5 space-y-3 font-mono text-xs">
            <h3 className="font-display font-bold text-sm text-white mb-2">Role Permissions Matrix</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                  <th className="py-2">Capability</th>
                  <th className="py-2">Owner</th>
                  <th className="py-2">Admin</th>
                  <th className="py-2">Developer</th>
                  <th className="py-2">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2.5">Hardware AES-256-GCM Secret Decryption</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-zinc-200">Re-Auth Required</td>
                  <td className="text-white">✗ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5">Execute SSRF-Protected Playground Requests</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-slate-400">Read-Only</td>
                </tr>
                <tr>
                  <td className="py-2.5">Trigger Live Supernova Solar Flare Alerts</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-white">✗ Denied</td>
                  <td className="text-white">✗ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5">Stripe Billing & Workspace Configuration</td>
                  <td className="text-zinc-200">✓ Full</td>
                  <td className="text-white">✗ Denied</td>
                  <td className="text-white">✗ Denied</td>
                  <td className="text-white">✗ Denied</td>
                </tr>
              </tbody>
            </table>
          </GlassPanel>
        </div>
      )}

      {/* TAB 3: WEBHOOKS & REPLAYS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Inbound Webhook Delivery Logs ({webhooks.length} Deliveries)
            </div>
            <Badge variant="healthy">SIGNATURE VERIFIED</Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {webhooks.map((wh) => (
              <GlassPanel key={wh.id} glow={wh.status === 200 ? 'none' : 'danger'} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={wh.status === 200 ? 'healthy' : 'error'}>
                      HTTP {wh.status}
                    </Badge>
                    <span className="text-white font-bold">{wh.event}</span>
                    <span className="text-slate-400 text-[10px]">({wh.service})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-zinc-200">{wh.latencyMs} ms</span>
                    <span className="text-slate-500">Attempt {wh.attempts}</span>
                    <SpaceButton
                      size="sm"
                      variant="secondary"
                      icon={<RefreshCw className={`w-3 h-3 ${replayingId === wh.id ? 'animate-spin' : ''}`} />}
                      onClick={() => handleRetryWebhook(wh.id)}
                      disabled={replayingId === wh.id}
                    >
                      {replayingId === wh.id ? 'Replaying...' : 'Replay Delivery'}
                    </SpaceButton>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Target: {wh.destinationUrl}</span>
                  <span>{wh.timestamp}</span>
                </div>

                <pre className="p-2.5 bg-white/[0.06] backdrop-blur-xl rounded-lg border border-white/5 text-[11px] text-slate-300 overflow-x-auto">
                  <code>{wh.payloadPreview}</code>
                </pre>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: UPTIME MONITORS */}
      {activeTab === 'monitors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Scheduled Uptime Monitors ({monitors.length} Monitors)
            </div>
            <SpaceButton variant="primary" size="sm">Add Monitor</SpaceButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monitors.map((m) => (
              <GlassPanel key={m.id} glow={m.status === 'UP' ? 'cyan' : 'danger'} className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-white">{m.name}</h4>
                  <Badge variant={m.status === 'UP' ? 'healthy' : 'error'}>{m.status}</Badge>
                </div>

                <div className="text-[11px] text-slate-400 truncate">{m.url}</div>

                <div className="space-y-1 text-slate-300 border-t border-white/5 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uptime SLA:</span>
                    <span className="text-zinc-200 font-bold">{m.uptimePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="text-zinc-200">{m.lastLatencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interval:</span>
                    <span>Every {m.intervalSeconds}s</span>
                  </div>
                </div>

                <div className="pt-2">
                  <SpaceButton
                    size="sm"
                    variant="secondary"
                    className="w-full text-[11px]"
                    icon={<Activity className="w-3 h-3" />}
                    onClick={() => handlePingMonitor(m.id)}
                  >
                    Ping Health Now
                  </SpaceButton>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
