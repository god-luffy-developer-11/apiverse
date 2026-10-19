'use client';

import React, { useState } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';
import {
  Sparkles,
  Send,
  Boxes,
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
  Gauge,
  Sliders,
  Share2,
  Code2,
  Lock,
  ChevronRight,
  RefreshCw,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

interface StackService {
  service: string;
  category: string;
  role: string;
  freeTier: string;
  why: string;
  docsUrl: string;
  latencyEstimate: string;
  codeSnippet: string;
}

interface CostBreakdown {
  devTier: string;
  scale10kUsers: string;
  scale100kUsers: string;
}

interface RecommendationResult {
  idea: string;
  architectureOverview: string;
  pipelineFlow: string[];
  recommendedStack: StackService[];
  costBreakdown: CostBreakdown;
  tradeoffs: string;
  alternatives: string;
  starterCommand: string;
}

const PRESETS = [
  {
    label: 'B2B SaaS with Subscriptions',
    desc: 'B2B SaaS with recurring Stripe subscription billing & automated invoice emails via Resend',
    scale: 'STARTUP' as const,
    budget: 'FREE_FIRST' as const
  },
  {
    label: 'Autonomous AI Agent',
    desc: 'Multi-modal autonomous AI developer agent that parses GitHub pull requests and generates unit tests',
    scale: 'SCALE' as const,
    budget: 'BALANCED' as const
  },
  {
    label: 'Realtime WebSockets Canvas',
    desc: 'Real-time collaborative whiteboarding canvas with zero-latency presence & WebSockets via Supabase',
    scale: 'STARTUP' as const,
    budget: 'FREE_FIRST' as const
  },
  {
    label: 'Fintech Escrow Platform',
    desc: 'Global financial marketplace with escrow payouts, fraud detection, and SMS order alerts',
    scale: 'ENTERPRISE' as const,
    budget: 'MAX_PERFORMANCE' as const
  },
  {
    label: 'Mobile E-Commerce + WhatsApp',
    desc: 'Mobile-first e-commerce app with Algolia instant search, Twilio WhatsApp updates, and Stripe checkout',
    scale: 'SCALE' as const,
    budget: 'BALANCED' as const
  }
];

const DEFAULT_RESULT: RecommendationResult = {
  idea: 'B2B SaaS with recurring Stripe subscription billing & automated invoice emails via Resend',
  architectureOverview:
    'Client requests terminate at Cloudflare Edge before routing to a Next.js 14 serverless compute layer. User authentication and relational data reside in a serverless Supabase PostgreSQL cluster fronted by PgBouncer. Stripe handles checkout sessions and webhook dispatch, while Resend handles transactional notification emails with React Email templates.',
  pipelineFlow: [
    'Global Edge Ingress (Cloudflare DNS & CDN)',
    'Identity & Access (Clerk / Supabase Auth)',
    'Compute & Edge API (Next.js 14 App Router)',
    'Transactional Database (Supabase PostgreSQL + PgBouncer)',
    'Async Event Dispatch (Stripe Webhooks & Resend Delivery)'
  ],
  recommendedStack: [
    {
      service: 'Next.js 14 App Router + Supabase',
      category: 'Databases & Storage',
      role: 'Fullstack Framework, Edge API & Managed PostgreSQL',
      freeTier: '500MB DB, 50,000 MAU, 2 projects forever free',
      why: 'Delivers zero cold-start edge routing, instant PostgreSQL with Row-Level Security, and built-in real-time subscriptions.',
      docsUrl: 'https://supabase.com/docs',
      latencyEstimate: '~32ms',
      codeSnippet: 'npx create-next-app@latest --tailwind --typescript'
    },
    {
      service: 'Google Gemini 3.8 Flash',
      category: 'AI & Machine Learning',
      role: 'Cognitive Synthesis & Multimodal Reasoning Core',
      freeTier: '15 RPM / 1,500 RPD completely free (Zero credit card needed)',
      why: 'Sub-250ms time-to-first-token with 1M context window and native multi-modal audio/image reasoning.',
      docsUrl: 'https://ai.google.dev/gemini-api/docs',
      latencyEstimate: '~165ms',
      codeSnippet: "curl 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=...'"
    },
    {
      service: 'Stripe Payments & Subscriptions',
      category: 'Fintech & Billing',
      role: 'Global Payment Ingress, Customer Portal & Invoicing',
      freeTier: 'No upfront or monthly fee (Standard 2.9% + 30¢ per transaction)',
      why: 'Gold standard for developer billing, automatic EU tax calculations, and battle-tested webhook signature verification.',
      docsUrl: 'https://stripe.com/docs/api',
      latencyEstimate: '~85ms',
      codeSnippet: 'pnpm add stripe @stripe/stripe-js'
    },
    {
      service: 'Resend Transactional Email',
      category: 'Messaging & Communications',
      role: 'Transactional Notifications, Magic Links & Invoices',
      freeTier: '3,000 emails/month free, 100 emails/day',
      why: 'Native React Email support, high-deliverability dedicated IPs, and sub-100ms API dispatch time.',
      docsUrl: 'https://resend.com/docs',
      latencyEstimate: '~65ms',
      codeSnippet: 'pnpm add resend react-email'
    }
  ],
  costBreakdown: {
    devTier: '$0.00 / month (100% covered by developer free tiers)',
    scale10kUsers: '$15.00 - $35.00 / month (Supabase Pro tier + Gemini token overage)',
    scale100kUsers: '$120.00 - $260.00 / month (With Redis caching and read replicas)'
  },
  tradeoffs:
    '1. Database connection limits: Always route Next.js serverless functions through PgBouncer connection pooler.\n2. Stripe Webhooks: Must store idempotency keys in Redis/Postgres to prevent duplicate charges on network retries.\n3. AI Rate limits: Implement an Upstash Redis token bucket to throttle concurrent client prompts.',
  alternatives:
    'For zero-cost self-hosting, replace Supabase with Dockerized PostgreSQL + PostgREST, and replace Gemini with local Ollama Llama 3.',
  starterCommand: 'npx create-apiverse-app --template modern-saas --stack supabase,gemini,stripe,resend'
};

export default function RecommenderPage() {
  const [idea, setIdea] = useState(PRESETS[0].desc);
  const [targetScale, setTargetScale] = useState<'STARTUP' | 'SCALE' | 'ENTERPRISE'>('STARTUP');
  const [budgetPriority, setBudgetPriority] = useState<'FREE_FIRST' | 'BALANCED' | 'MAX_PERFORMANCE'>('FREE_FIRST');
  const [ecosystem, setEcosystem] = useState<'NEXTJS' | 'PYTHON' | 'GO_RUST'>('NEXTJS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult>(DEFAULT_RESULT);
  const [activeTab, setActiveTab] = useState<'TOPOLOGY' | 'STACK' | 'COSTS' | 'RISKS' | 'CLI'>('TOPOLOGY');
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  const handleRecommend = async (customIdea?: string) => {
    const textToRun = customIdea || idea;
    if (!textToRun.trim() || loading) return;

    setLoading(true);
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

      if (resp.ok) {
        const data = await resp.json();
        // Ensure default structure
        setResult({
          idea: data.idea || textToRun,
          architectureOverview: data.architectureOverview || DEFAULT_RESULT.architectureOverview,
          pipelineFlow: data.pipelineFlow || DEFAULT_RESULT.pipelineFlow,
          recommendedStack: data.recommendedStack || DEFAULT_RESULT.recommendedStack,
          costBreakdown: data.costBreakdown || DEFAULT_RESULT.costBreakdown,
          tradeoffs: data.tradeoffs || DEFAULT_RESULT.tradeoffs,
          alternatives: data.alternatives || DEFAULT_RESULT.alternatives,
          starterCommand: data.starterCommand || `npx create-apiverse-app --stack ${targetScale.toLowerCase()}`
        });
      }
    } catch (e) {
      console.error('Recommender error:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, onSuccess: () => void) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onSuccess();
    }
  };

  const copyFullBlueprint = () => {
    const md = `# Architecture Blueprint: ${result.idea}
## System Overview
${result.architectureOverview}

## Data Pipeline
${result.pipelineFlow.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Recommended Stack
${result.recommendedStack.map((s) => `- **${s.service}** (${s.category}) - ${s.role}\n  * Free Tier: ${s.freeTier}\n  * Why: ${s.why}\n  * Latency: ${s.latencyEstimate}`).join('\n\n')}

## Cost Projections
- Dev / Prototype: ${result.costBreakdown.devTier}
- 10k Users: ${result.costBreakdown.scale10kUsers}
- 100k Users: ${result.costBreakdown.scale100kUsers}

## Engineering Tradeoffs
${result.tradeoffs}

## Starter Command
\`\`\`bash
${result.starterCommand}
\`\`\`
`;
    copyToClipboard(md, () => {
      setCopiedBlueprint(true);
      setTimeout(() => setCopiedBlueprint(false), 2500);
    });
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Badge variant="healthy" pulse>
              AUTONOMOUS SYSTEM ARCHITECT 2.0
            </Badge>
            <Badge variant="neutral">3,692 APIs Indexed</Badge>
            <Badge variant="healthy">Gemini Flash Live</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            AI Project Stack Synthesizer
          </h1>
          <p className="text-sm text-zinc-300 max-w-3xl mt-1.5 leading-relaxed font-sans">
            Describe your software vision in plain natural language. APIverse analyzes real API latency curves,
            free-tier boundaries, database connection thresholds, and synthesizes a production-grade blueprint in seconds.
          </p>
        </div>

        {/* Global Action Header */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={copyFullBlueprint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/15 text-xs font-mono transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
          >
            {copiedBlueprint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedBlueprint ? 'Blueprint Copied!' : 'Export Architecture'}</span>
          </button>

          <Link
            href={`/ultron?prompt=${encodeURIComponent(`Implement the core backend API integrations for: ${result.idea}`)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Code in Ultron</span>
          </Link>
        </div>
      </div>

      {/* Top Studio Grid: Input on Left, Video Hologram on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Natural Language Studio Form */}
        <div className="lg:col-span-8 space-y-5">
          <GlassPanel glow="cyan" className="p-6 space-y-5 bg-black/60 backdrop-blur-2xl border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  System Parameter Studio
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Zero-Config AI Synthesis</span>
            </div>

            {/* Quick Prompt Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-300 font-medium">Quick Architect Blueprints:</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIdea(p.desc);
                      setTargetScale(p.scale);
                      setBudgetPriority(p.budget);
                      handleRecommend(p.desc);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                      idea === p.desc
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-white/[0.04] text-zinc-300 hover:text-white border-white/10 hover:border-white/25'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Idea Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-zinc-300 font-medium">Describe What You Want to Build:</label>
                <span className="text-[10px] font-mono text-zinc-500">{idea.length} characters</span>
              </div>
              <div className="relative">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  placeholder="e.g. Real-time fleet management IoT dashboard with Mapbox GPS tracking, Supabase timeseries telemetry, and Twilio emergency SMS..."
                  className="w-full bg-black/80 border border-white/20 rounded-2xl p-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-all font-mono leading-relaxed resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

            {/* Filter Pills: Scale, Budget, Ecosystem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              {/* Target Scale */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Target Scale
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/70 rounded-xl border border-white/10 text-[11px] font-mono">
                  {(['STARTUP', 'SCALE', 'ENTERPRISE'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTargetScale(s)}
                      className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                        targetScale === s ? 'bg-cyan-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s === 'STARTUP' ? 'MVP' : s === 'SCALE' ? 'Scale' : 'Enterprise'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Priority */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Budget Strategy
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/70 rounded-xl border border-white/10 text-[11px] font-mono">
                  {(['FREE_FIRST', 'BALANCED', 'MAX_PERFORMANCE'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetPriority(b)}
                      className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                        budgetPriority === b ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b === 'FREE_FIRST' ? '$0 Free' : b === 'BALANCED' ? 'Balanced' : 'High-Perf'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Tech Stack */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  Runtime Ecosystem
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/70 rounded-xl border border-white/10 text-[11px] font-mono">
                  {(['NEXTJS', 'PYTHON', 'GO_RUST'] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEcosystem(e)}
                      className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                        ecosystem === e ? 'bg-purple-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {e === 'NEXTJS' ? 'Next.js' : e === 'PYTHON' ? 'FastAPI' : 'Go/Rust'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synthesize CTA Button */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                Instant synthesis using Google Gemini Flash + APIverse 3.6k registry
              </span>

              <button
                onClick={() => handleRecommend()}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-black tracking-wider uppercase transition-all duration-300 shadow-[0_0_24px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Topology...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Architecture</span>
                  </>
                )}
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Video Hologram Card Showcase */}
        <div className="lg:col-span-4">
          <LiquidGlassVideoCard
            src={UIUX_MEDIA.recommenderStream}
            title="Neural Architecture Radar"
            category="SYSTEM ARCHITECT"
            badge="LIVE RADAR"
            description="Continuous telemetry scan matching 3,692+ APIs against edge ingress and DB pooling limits."
            glow="cyan"
            aspectRatio="portrait"
          />
        </div>
      </div>

      {/* Synthesized Architecture Blueprint Showcase */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'TOPOLOGY', label: 'System Topology', icon: Workflow, count: result.pipelineFlow.length },
              { id: 'STACK', label: 'Recommended Stack', icon: Layers, count: result.recommendedStack.length },
              { id: 'COSTS', label: 'Cost Curves ($0 to Scale)', icon: DollarSign },
              { id: 'RISKS', label: 'Tradeoffs & Safeguards', icon: Shield },
              { id: 'CLI', label: 'Instant Starter Scaffold', icon: Terminal }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Dev Tier:</span>
            <span className="text-emerald-400 font-bold">$0/mo (Free First)</span>
          </div>
        </div>

        {/* Architecture Overview Banner */}
        <GlassPanel glow="white" className="p-5 bg-black/60 border-white/15">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Synthesized Architectural Overview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {targetScale} TIER
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{result.architectureOverview}</p>
            </div>
          </div>
        </GlassPanel>

        {/* TAB 1: SYSTEM TOPOLOGY (Visual Pipeline) */}
        {activeTab === 'TOPOLOGY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>End-to-End Pipeline & Latency Routing Flow</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">5-Tier Distributed Topology</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {result.pipelineFlow.map((step, idx) => {
                const colors = [
                  { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/40', text: 'text-blue-300', icon: GlobeIcon },
                  { bg: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/40', text: 'text-cyan-300', icon: Shield },
                  { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/40', text: 'text-purple-300', icon: Server },
                  { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: Database },
                  { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/40', text: 'text-amber-300', icon: Zap }
                ];
                const c = colors[idx % colors.length];
                const IconComponent = c.icon;

                return (
                  <div key={idx} className="relative group">
                    <div
                      className={`h-full p-4 rounded-2xl bg-gradient-to-b ${c.bg} border ${c.border} backdrop-blur-xl flex flex-col justify-between space-y-3 transition-all duration-300 group-hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black text-white/50 px-2 py-0.5 rounded-full bg-white/10">
                          STAGE 0{idx + 1}
                        </span>
                        <IconComponent className={`w-4 h-4 ${c.text}`} />
                      </div>

                      <div className="space-y-1">
                        <div className={`text-xs font-mono font-bold ${c.text} leading-tight`}>{step}</div>
                        <div className="text-[10px] text-zinc-400 font-sans">
                          {idx === 0 && 'DNS Anycast resolution with SSL termination'}
                          {idx === 1 && 'Cryptographic JWT verification & RBAC rules'}
                          {idx === 2 && 'Serverless function execution & AI orchestration'}
                          {idx === 3 && 'ACID transactional persistence with read replicas'}
                          {idx === 4 && 'Durable message dispatch with replay safety'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Hop Latency:</span>
                        <span className="text-white font-bold">{idx === 0 ? '~12ms' : idx === 1 ? '~8ms' : idx === 2 ? '~45ms' : idx === 3 ? '~18ms' : '~60ms'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RECOMMENDED STACK (Layered Cards) */}
        {activeTab === 'STACK' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Selected Architectural APIs ({result.recommendedStack.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Vetted by APIverse Protocol</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendedStack.map((svc, idx) => (
                <GlassPanel
                  key={idx}
                  glow="obsidian"
                  className="p-5 bg-black/65 border-white/15 space-y-4 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category + Name + Latency */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                          {svc.category}
                        </span>
                        <h4 className="text-base font-display font-black text-white">{svc.service}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                          {svc.latencyEstimate}
                        </span>
                        {svc.docsUrl && (
                          <a
                            href={svc.docsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Open Documentation"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Role & Justification */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-zinc-200 font-sans font-medium">
                        <span className="text-zinc-500 font-mono text-[11px]">Role: </span>
                        {svc.role}
                      </div>
                      <div className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                        <span className="text-zinc-500 font-mono">Why Chosen: </span>
                        {svc.why}
                      </div>
                    </div>

                    {/* Free Tier Details */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono flex items-center justify-between text-zinc-300">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Free Tier Quota:
                      </span>
                      <span className="truncate max-w-[240px] text-right">{svc.freeTier}</span>
                    </div>
                  </div>

                  {/* Quick Code Snippet Box */}
                  {svc.codeSnippet && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-zinc-500">Quick Integration Command:</span>
                        <button
                          onClick={() => {
                            copyToClipboard(svc.codeSnippet, () => {
                              setCopiedSnippet(idx);
                              setTimeout(() => setCopiedSnippet(null), 2000);
                            });
                          }}
                          className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {copiedSnippet === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippet === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-xl bg-black/90 border border-white/10 text-[11px] font-mono text-zinc-300 overflow-x-auto select-all">
                        <code>{svc.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COST CURVES */}
        {activeTab === 'COSTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tier Cloud Cost Projections</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Zero Dollar Dev to Global Scale</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dev / MVP Tier */}
              <GlassPanel glow="cyan" className="p-6 bg-black/60 border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="healthy">DEV / PROTOTYPE</Badge>
                  <span className="text-xs font-mono text-zinc-400">0 - 1,000 MAU</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-display font-black text-emerald-400">$0.00</div>
                  <div className="text-[11px] font-mono text-zinc-400">Per Month Total</div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{result.costBreakdown.devTier}</p>
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-white">Free (500MB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Tokens:</span>
                    <span className="text-white">Free (15 RPM)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth:</span>
                    <span className="text-white">Free (50k MAU)</span>
                  </div>
                </div>
              </GlassPanel>

              {/* Growth Tier (10k Users) */}
              <GlassPanel glow="white" className="p-6 bg-black/60 border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">GROWTH SCALE</Badge>
                  <span className="text-xs font-mono text-zinc-400">10,000 MAU</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-display font-black text-white">$15 - $35</div>
                  <div className="text-[11px] font-mono text-zinc-400">Estimated Monthly Cloud Bill</div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{result.costBreakdown.scale10kUsers}</p>
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Compute:</span>
                    <span className="text-white">Vercel/Cloudflare $0-$20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-white">Supabase Pro $25/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emails:</span>
                    <span className="text-white">Resend $0-$20</span>
                  </div>
                </div>
              </GlassPanel>

              {/* High Throughput (100k Users) */}
              <GlassPanel glow="crimson" className="p-6 bg-black/60 border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="crimson">ENTERPRISE SCALE</Badge>
                  <span className="text-xs font-mono text-zinc-400">100,000+ MAU</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-display font-black text-rose-400">$120 - $260</div>
                  <div className="text-[11px] font-mono text-zinc-400">With Redis Caching</div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{result.costBreakdown.scale100kUsers}</p>
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Redis/Upstash:</span>
                    <span className="text-white">$10 - $30/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Postgres Replicas:</span>
                    <span className="text-white">$50 - $120/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Inference:</span>
                    <span className="text-white">Cached (~$40/mo)</span>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {/* TAB 4: RISKS & TRADEOFFS */}
        {activeTab === 'RISKS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Production Tradeoffs, Bottlenecks & Self-Hosted Alternatives</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassPanel glow="crimson" className="p-5 bg-black/60 border-white/15 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Critical Architecture Safeguards</span>
                </div>
                <div className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                  {result.tradeoffs}
                </div>
              </GlassPanel>

              <GlassPanel glow="cyan" className="p-5 bg-black/60 border-white/15 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Boxes className="w-4 h-4" />
                  <span>Open-Source & Self-Hosted Fallbacks</span>
                </div>
                <div className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                  {result.alternatives}
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {/* TAB 5: CLI SCAFFOLD */}
        {activeTab === 'CLI' && (
          <GlassPanel glow="cyan" className="p-6 bg-black/70 border-white/15 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Deploy Starter Codebase via APIverse CLI
                </span>
              </div>
              <Badge variant="nebula">Instant Scaffold</Badge>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-black/90 border border-white/20 font-mono text-xs text-cyan-300 overflow-x-auto select-all shadow-inner">
                <code>{result.starterCommand}</code>
              </pre>
              <button
                onClick={() => {
                  copyToClipboard(result.starterCommand, () => {
                    setCopiedCommand(true);
                    setTimeout(() => setCopiedCommand(false), 2000);
                  });
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] flex items-center gap-1.5 transition-all border border-white/10"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-mono text-zinc-300">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-cyan-400 font-bold">1. Bootstrap Project</span>
                <p className="text-[11px] text-zinc-400">Runs automated monorepo generation with Next.js, Tailwind & TypeScript.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-emerald-400 font-bold">2. Inject Vault Secrets</span>
                <p className="text-[11px] text-zinc-400">Syncs credentials from your encrypted APIverse Key Vault with one click.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-purple-400 font-bold">3. Launch Ultron Agent</span>
                <p className="text-[11px] text-zinc-400">Ultron synthesizes boilerplate webhooks, DB models, and API clients.</p>
              </div>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

// Inline fallback icon
function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
