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
  Cpu
} from 'lucide-react';
import Link from 'next/link';

interface StackService {
  service: string;
  role: string;
  freeTier: string;
  why: string;
}

interface RecommendationResult {
  idea: string;
  architectureOverview: string;
  recommendedStack: StackService[];
  estimatedMonthlyCost: string;
  tradeoffs: string;
  alternatives: string;
}

const PRESETS = [
  'B2B SaaS with recurring subscription billing & automated invoice emails',
  'Multi-modal AI developer agent that searches repositories and generates tests',
  'Real-time collaborative canvas with zero-latency presence & WebSockets',
  'Global e-commerce marketplace with escrow payments and SMS order updates'
];

export default function RecommenderPage() {
  const [idea, setIdea] = useState(PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [saved, setSaved] = useState(false);

  const handleRecommend = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setSaved(false);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/recommender/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-400" />
          <span>AI PROJECT RECOMMENDER</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Describe any software concept • Ultron synthesizes optimal API architectures, cost estimates, and tradeoffs
        </p>
      </div>

      {/* Input Console */}
      <GlassPanel glow="purple" className="p-5 space-y-4">
        <label className="text-xs font-mono text-pink-200 block">Describe Your Project Idea or Architecture Goal</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
            placeholder="e.g. Build an AI agent system with Stripe billing, Supabase auth, and Resend notifications..."
            className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500/60"
          />
          <SpaceButton
            variant="ultron"
            size="md"
            icon={<Send className="w-4 h-4" />}
            onClick={handleRecommend}
            disabled={loading}
          >
            {loading ? 'Synthesizing...' : 'Analyze Stack'}
          </SpaceButton>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-slate-500">Quick Starters:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setIdea(p)}
              className="text-[11px] font-mono text-slate-400 hover:text-zinc-200 bg-white/[0.06] backdrop-blur-xl px-2.5 py-1 rounded-md border border-white/5 hover:border-white/30 transition-all truncate max-w-xs"
            >
              {p.slice(0, 38)}...
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Neural Architecture Synthesis Stream (UIUX Asset 13) - Clear Liquid Glass Transparent Panel */}
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
          <GlassPanel glow="cyan" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-zinc-200" />
                <h3 className="font-display font-bold text-sm text-white">Synthesized Architectural Topology</h3>
              </div>
              <Badge variant="healthy">SUB-SECOND LATENCY</Badge>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">{result.architectureOverview}</p>
          </GlassPanel>

          {/* Service Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Recommended Planetary API Stack ({result.recommendedStack.length} Services)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-200 bg-white/10 border border-white/30 px-3 py-1 rounded-full">
                  Estimated Cost: {result.estimatedMonthlyCost}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendedStack.map((item, idx) => (
                <GlassPanel key={idx} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm text-zinc-200">{item.service}</h4>
                    <span className="text-[10px] font-mono text-zinc-200 px-2 py-0.5 rounded bg-white/10 border border-white/30">
                      {item.role}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500">Free Tier: </span>
                    <span className="text-zinc-200">{item.freeTier}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.why}</p>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* Tradeoffs & Alternatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel glow="gold" className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 font-display font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Engineering Tradeoffs & Bottlenecks</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.tradeoffs}</p>
            </GlassPanel>

            <GlassPanel className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 font-display font-bold text-xs uppercase">
                <Layers className="w-4 h-4" />
                <span>Cheaper & Self-Hosted Alternatives</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.alternatives}</p>
            </GlassPanel>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <SpaceButton
              variant="secondary"
              size="md"
              icon={saved ? <Check className="w-4 h-4 text-zinc-200" /> : <BookmarkCheck className="w-4 h-4" />}
              onClick={handleSaveWorkspace}
            >
              {saved ? 'Saved to Solar System!' : 'Save Stack to Workspace'}
            </SpaceButton>

            <Link href="/starter-kits">
              <SpaceButton variant="primary" size="md" icon={<Boxes className="w-4 h-4" />}>
                Export to Starter Kit
              </SpaceButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
