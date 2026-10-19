'use client';

import React, { useState } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';
import {
  Sparkles,
  Send,
  Boxes,
  BookmarkCheck,
  Check,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowRight,
  Cpu,
  Terminal,
  ExternalLink,
  Copy,
  Zap,
  Activity,
  Workflow,
  Server,
  Database,
  Shield,
  Gauge
} from 'lucide-react';
import Link from 'next/link';

interface StackService {
  service: string;
  category?: string;
  role: string;
  freeTier: string;
  why: string;
  docsUrl?: string;
  latencyEstimate?: string;
  codeSnippet?: string;
}

interface CostBreakdown {
  devTier: string;
  scale10kUsers: string;
  scale100kUsers: string;
}

interface RecommendationResult {
  idea: string;
  architectureOverview: string;
  pipelineFlow?: string[];
  recommendedStack: StackService[];
  costBreakdown?: CostBreakdown;
  estimatedMonthlyCost?: string;
  tradeoffs: string;
  alternatives: string;
  starterCommand?: string;
}

const PRESETS = [
  'B2B SaaS with recurring Stripe subscription billing & automated invoice emails via Resend',
  'Multi-modal autonomous AI developer agent that parses GitHub pull requests and generates unit tests',
  'Real-time collaborative whiteboarding canvas with zero-latency presence & WebSockets via Supabase',
  'High-throughput global financial marketplace with escrow payouts, fraud detection, and SMS order alerts'
];

export default function RecommenderPage() {
  const [idea, setIdea] = useState(PRESETS[0]);
  const [targetScale, setTargetScale] = useState<'STARTUP' | 'SCALE' | 'ENTERPRISE'>('STARTUP');
  const [budgetPriority, setBudgetPriority] = useState<'FREE_FIRST' | 'BALANCED' | 'MAX_PERFORMANCE'>('FREE_FIRST');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);

  const handleRecommend = async (customIdea?: string) => {
    const textToRun = customIdea || idea;
    if (!textToRun.trim()) return;

    setLoading(true);
    setSaved(false);

    try {
      const resp = await fetch('http://localhost:8000/api/v1/recommender/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: textToRun,
          target_scale: targetScale,
          budget_priority: budgetPriority
        })
      });

      const data = await resp.json();
      setResult(data);
    } catch (e) {
      console.error('Recommender error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySnippet = (snippet: string, idx: number) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(idx);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleSaveWorkspace = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.35),0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-pink-300 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-pink-400" />
              ULTRON ARCHITECTURAL INTELLIGENCE • LIVE GEMINI SYNTHESIS
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <span>AI ARCHITECTURE & API RECOMMENDER</span>
          </h1>
          <p className="text-xs text-zinc-300 font-mono mt-0.5">
            Describe any software vision • Ultron designs production-grade topologies, optimal free-tier API stacks, and realistic cost models
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="healthy" pulse>
            READY TO SYNTHESIZE
          </Badge>
        </div>
      </div>

      {/* Input Console */}
      <GlassPanel glow="purple" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-mono text-zinc-200 font-bold block flex items-center gap-2">
            <Cpu className="w-4 h-4 text-pink-400" />
            <span>Describe Your Application Architecture or Project Vision:</span>
          </label>

          {/* Configuration Parameters */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <select
              value={targetScale}
              onChange={(e) => setTargetScale(e.target.value as any)}
              className="bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-zinc-200 outline-none focus:border-white text-[11px]"
            >
              <option value="STARTUP">Startup / Pilot ($0 Dev Tier)</option>
              <option value="SCALE">Scaling (10k - 50k Users)</option>
              <option value="ENTERPRISE">Enterprise Scale (100k+ Users)</option>
            </select>

            <select
              value={budgetPriority}
              onChange={(e) => setBudgetPriority(e.target.value as any)}
              className="bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-zinc-200 outline-none focus:border-white text-[11px]"
            >
              <option value="FREE_FIRST">100% Free-Tier Priority</option>
              <option value="BALANCED">Balanced Performance</option>
              <option value="MAX_PERFORMANCE">Maximum Throughput</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
            placeholder="e.g. Build an AI agent system with Stripe billing, Supabase auth, and Resend notifications..."
            className="flex-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-pink-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] font-sans"
          />
          <SpaceButton
            variant="ultron"
            size="md"
            icon={<Send className="w-4 h-4 text-white" />}
            onClick={() => handleRecommend()}
            disabled={loading}
          >
            {loading ? 'Synthesizing...' : 'Synthesize Stack'}
          </SpaceButton>
        </div>

        {/* Preset Starters */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Blueprints:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIdea(p);
                handleRecommend(p);
              }}
              className="text-[11px] font-mono text-zinc-300 hover:text-white bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/30 transition-all truncate max-w-sm"
            >
              {p.slice(0, 46)}...
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Neural Architecture Telemetry Banner */}
      <div className="w-full rounded-3xl p-1 bg-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-[0_16px_45px_rgba(0,0,0,0.5),inset_0_1.5px_1px_0_rgba(255,255,255,0.35)]">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.recommenderStream}
          title="NEURAL ARCHITECTURE SYNTHESIS TELEMETRY"
          badge="ULTRON COGNITIVE STREAM"
          description="Real-time multi-dimensional evaluation of system topologies, caching layers, and distributed API cost curves."
        />
      </div>

      {/* Recommended Stack Results */}
      {result && (
        <div className="space-y-6">
          {/* Architecture Overview Banner */}
          <GlassPanel glow="cyan" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Workflow className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">Synthesized Architectural Topology</h3>
              </div>
              <Badge variant="healthy">SUB-SECOND LATENCY BUDGET</Badge>
            </div>
            <p className="text-xs text-zinc-200 font-sans leading-relaxed">{result.architectureOverview}</p>

            {/* Pipeline Flow Stages */}
            {result.pipelineFlow && result.pipelineFlow.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-bold block mb-2">
                  Request Execution Ingress Pipeline:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {result.pipelineFlow.map((stage, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/20 text-white font-mono text-xs flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>{stage}</span>
                      </div>
                      {idx < result.pipelineFlow!.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Service Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs tracking-widest text-zinc-400 uppercase font-bold">
                Recommended API Ecosystem ({result.recommendedStack.length} Planetary Nodes)
              </span>
              <span className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                Zero Cost Dev Tier Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.recommendedStack.map((item, idx) => (
                <GlassPanel key={idx} className="p-5 flex flex-col justify-between space-y-3 group hover:border-white/40 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h4 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {item.service}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">{item.role}</span>
                      </div>
                      {item.category && (
                        <span className="text-[10px] font-mono text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 py-2 font-mono text-xs border-y border-white/10 my-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Free Tier Allowance:</span>
                        <span className="text-emerald-300 font-sans text-right max-w-[220px] truncate" title={item.freeTier}>
                          {item.freeTier}
                        </span>
                      </div>
                      {item.latencyEstimate && (
                        <div className="flex justify-between text-zinc-400">
                          <span>p95 Latency:</span>
                          <span className="text-zinc-200 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            {item.latencyEstimate}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.why}</p>
                  </div>

                  {/* Actions / Snippets */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    {item.codeSnippet && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/80 border border-white/15 text-[11px] font-mono text-zinc-300">
                        <span className="truncate max-w-[280px] text-zinc-200">{item.codeSnippet}</span>
                        <button
                          onClick={() => handleCopySnippet(item.codeSnippet!, idx)}
                          className="ml-2 text-zinc-400 hover:text-white"
                          title="Copy command"
                        >
                          {copiedSnippet === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      {item.docsUrl && (
                        <a
                          href={item.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Official Portal & Docs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        href={`/playground?service=${encodeURIComponent(item.service)}`}
                        className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Test in Playground</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* Three-Tier Realistic Cost Scaling Curve */}
          {result.costBreakdown && (
            <GlassPanel glow="gold" className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-display font-bold text-sm uppercase">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tier Realistic Infrastructure Cost Model</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Stage 1: Dev & Pilot (0 - 1k MAU)</span>
                  <div className="text-lg font-display font-bold text-emerald-400">{result.costBreakdown.devTier}</div>
                  <p className="text-[11px] text-zinc-300">100% within free tiers of verified providers</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Stage 2: Growth (10,000 MAU)</span>
                  <div className="text-lg font-display font-bold text-cyan-300">{result.costBreakdown.scale10kUsers}</div>
                  <p className="text-[11px] text-zinc-300">Basic database scaling & serverless executions</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Stage 3: Scale (100,000 MAU)</span>
                  <div className="text-lg font-display font-bold text-purple-300">{result.costBreakdown.scale100kUsers}</div>
                  <p className="text-[11px] text-zinc-300">With edge caching & connection pooling active</p>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Tradeoffs & Alternatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel glow="crimson" className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-display font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Engineering Tradeoffs & Failure Modes</span>
              </div>
              <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">{result.tradeoffs}</div>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-display font-bold text-xs uppercase">
                <Layers className="w-4 h-4" />
                <span>Open-Source & Self-Hosted Alternatives</span>
              </div>
              <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">{result.alternatives}</div>
            </GlassPanel>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs font-mono text-zinc-400">
              {result.starterCommand && (
                <span>Starter CLI: <code className="text-cyan-300 bg-black/60 px-2 py-1 rounded border border-white/15">{result.starterCommand}</code></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <SpaceButton
                variant="secondary"
                size="md"
                icon={saved ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkCheck className="w-4 h-4" />}
                onClick={handleSaveWorkspace}
              >
                {saved ? 'Saved to Orbit!' : 'Save Architecture Blueprint'}
              </SpaceButton>

              <Link href="/starter-kits">
                <SpaceButton variant="primary" size="md" icon={<Boxes className="w-4 h-4 text-white" />}>
                  Generate Starter Codebase
                </SpaceButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
