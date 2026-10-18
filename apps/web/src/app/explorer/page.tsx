'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Compass,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  GitCompare,
  Plus,
  Check,
  CheckCircle2,
  X,
  Shield,
  Activity,
  Zap,
  LayoutGrid,
  List,
  KeyRound,
  PlaySquare,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface ApiItem {
  id: string;
  name: string;
  category: string;
  constellation: string;
  description: string;
  authType: string;
  pricing: string;
  latencyMs: number;
  uptime99: number;
  freeTierLimit: string;
  icon: string;
  endpointsCount: number;
  popularityRank: number;
  apiKeyUrl?: string;
  docsUrl?: string;
  portalUrl?: string;
  quickSetupSnippet?: string;
}

const DEFAULT_APIS: ApiItem[] = [
  {
    id: "stripe",
    name: "Stripe Payments",
    category: "Fintech & Billing",
    constellation: "Cygnus",
    description: "Financial infrastructure for the internet. Payments, billing, subscriptions, invoicing and identity verification.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 85,
    uptime99: 99.99,
    freeTierLimit: "Sandbox unlimited, 2.9% + $0.30 per live charge",
    icon: "💳",
    endpointsCount: 182,
    popularityRank: 98,
    apiKeyUrl: "https://dashboard.stripe.com/apikeys",
    docsUrl: "https://stripe.com/docs/api",
    portalUrl: "https://dashboard.stripe.com"
  },
  {
    id: "openai",
    name: "OpenAI Platform",
    category: "AI & Machine Learning",
    constellation: "Orion",
    description: "State-of-the-art LLMs (GPT-4o, GPT-4o-mini, text embeddings, DALL-E, Whisper speech-to-text).",
    authType: "BEARER",
    pricing: "PAID",
    latencyMs: 240,
    uptime99: 99.85,
    freeTierLimit: "$5 initial grant for new accounts",
    icon: "🧠",
    endpointsCount: 45,
    popularityRank: 99,
    apiKeyUrl: "https://platform.openai.com/api-keys",
    docsUrl: "https://platform.openai.com/docs",
    portalUrl: "https://platform.openai.com"
  },
  {
    id: "gemini",
    name: "Google Gemini (AI Studio)",
    category: "AI & Machine Learning",
    constellation: "Centaurus",
    description: "Google's multimodal flagship AI models (Gemini 2.5/3.8 Flash, Pro, Vision, Audio, Computer Use) with generous free tier.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 140,
    uptime99: 99.94,
    freeTierLimit: "15 RPM / 1,500 RPD free with no credit card required",
    icon: "✨",
    endpointsCount: 38,
    popularityRank: 99,
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    portalUrl: "https://aistudio.google.com"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    category: "AI & Machine Learning",
    constellation: "Andromeda",
    description: "Next-generation intelligence with Claude 3.5 Sonnet & Haiku. Premier reasoning, coding, and large context windows.",
    authType: "API_KEY",
    pricing: "PAID",
    latencyMs: 210,
    uptime99: 99.88,
    freeTierLimit: "$5 initial credit on organization activation",
    icon: "🎭",
    endpointsCount: 26,
    popularityRank: 97,
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    docsUrl: "https://docs.anthropic.com",
    portalUrl: "https://console.anthropic.com"
  },
  {
    id: "twilio",
    name: "Twilio Communications",
    category: "Messaging & Voice",
    constellation: "Pegasus",
    description: "Global communications cloud: programmable SMS, voice, WhatsApp, Two-Factor Verify, and SIP trunking.",
    authType: "BASIC",
    pricing: "FREEMIUM",
    latencyMs: 110,
    uptime99: 99.95,
    freeTierLimit: "$15 free sandbox trial balance",
    icon: "📱",
    endpointsCount: 94,
    popularityRank: 92,
    apiKeyUrl: "https://console.twilio.com/",
    docsUrl: "https://www.twilio.com/docs",
    portalUrl: "https://console.twilio.com"
  },
  {
    id: "github",
    name: "GitHub REST & GraphQL",
    category: "Developer Tools",
    constellation: "Cassiopeia",
    description: "Automate repositories, issues, PRs, actions, git trees, security advisories, and webhooks.",
    authType: "BEARER",
    pricing: "OPEN_SOURCE",
    latencyMs: 62,
    uptime99: 99.92,
    freeTierLimit: "5,000 req/hr authenticated free across all personal accounts",
    icon: "🐙",
    endpointsCount: 320,
    popularityRank: 97,
    apiKeyUrl: "https://github.com/settings/tokens",
    docsUrl: "https://docs.github.com/en/rest",
    portalUrl: "https://github.com/settings/developers"
  },
  {
    id: "supabase",
    name: "Supabase Platform",
    category: "Databases & Storage",
    constellation: "Lyra",
    description: "The open-source Firebase alternative: Postgres DB, pgvector, row-level security, Auth, Realtime, and Edge Functions.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 48,
    uptime99: 99.97,
    freeTierLimit: "2 free active projects, 500MB DB, 50,000 monthly active users",
    icon: "⚡",
    endpointsCount: 78,
    popularityRank: 95,
    apiKeyUrl: "https://supabase.com/dashboard/project/_/settings/api",
    docsUrl: "https://supabase.com/docs",
    portalUrl: "https://supabase.com/dashboard"
  },
  {
    id: "resend",
    name: "Resend Email",
    category: "Messaging & Voice",
    constellation: "Pegasus",
    description: "Modern developer-first transactional email API with React Email components, domain verification, and high deliverability.",
    authType: "BEARER",
    pricing: "FREEMIUM",
    latencyMs: 55,
    uptime99: 99.99,
    freeTierLimit: "3,000 emails / month free with custom domain",
    icon: "✉️",
    endpointsCount: 24,
    popularityRank: 94,
    apiKeyUrl: "https://resend.com/api-keys",
    docsUrl: "https://resend.com/docs",
    portalUrl: "https://resend.com"
  },
  {
    id: "groq",
    name: "Groq LPU Inference",
    category: "AI & Machine Learning",
    constellation: "Aquila",
    description: "Ultra-low latency Language Processing Unit (LPU) inference running open-weights models (Llama 3.3, Mixtral) at 500+ tokens/sec.",
    authType: "BEARER",
    pricing: "FREEMIUM",
    latencyMs: 28,
    uptime99: 99.91,
    freeTierLimit: "Generous free rate limits during public preview",
    icon: "⚡",
    endpointsCount: 18,
    popularityRank: 96,
    apiKeyUrl: "https://console.groq.com/keys",
    docsUrl: "https://console.groq.com/docs",
    portalUrl: "https://console.groq.com"
  },
  {
    id: "clerk",
    name: "Clerk Authentication",
    category: "Security & Identity",
    constellation: "Ursa Major",
    description: "Complete user management, MFA, passwordless sign-in, session tokens, organization RBAC, and webhooks.",
    authType: "BEARER",
    pricing: "FREEMIUM",
    latencyMs: 42,
    uptime99: 99.98,
    freeTierLimit: "10,000 monthly active users 100% free with unlimited logins",
    icon: "🔐",
    endpointsCount: 64,
    popularityRank: 95,
    apiKeyUrl: "https://dashboard.clerk.com/",
    docsUrl: "https://clerk.com/docs",
    portalUrl: "https://dashboard.clerk.com"
  },
  {
    id: "pinecone",
    name: "Pinecone Vector DB",
    category: "Databases & Storage",
    constellation: "Vela",
    description: "Managed cloud vector database built for high-throughput similarity search, dense retrieval, and AI RAG pipelines.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 35,
    uptime99: 99.95,
    freeTierLimit: "Free Starter index with 100,000 vectors & 2GB storage",
    icon: "🌲",
    endpointsCount: 32,
    popularityRank: 93,
    apiKeyUrl: "https://app.pinecone.io/",
    docsUrl: "https://docs.pinecone.io",
    portalUrl: "https://app.pinecone.io"
  },
  {
    id: "cloudinary",
    name: "Cloudinary Media Cloud",
    category: "Media & Storage",
    constellation: "Columba",
    description: "End-to-end image and video upload, AI background removal, dynamic URL transformations, and global CDN delivery.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 52,
    uptime99: 99.96,
    freeTierLimit: "25 Monthly Credits (25,000 transformations or 25GB storage)",
    icon: "☁️",
    endpointsCount: 86,
    popularityRank: 91,
    apiKeyUrl: "https://console.cloudinary.com/settings/api-keys",
    docsUrl: "https://cloudinary.com/documentation",
    portalUrl: "https://console.cloudinary.com"
  },
  {
    id: "algolia",
    name: "Algolia Search & Discovery",
    category: "Developer Tools",
    constellation: "Serpens",
    description: "Sub-millisecond typo-tolerant search, facet filtering, neural re-ranking, and recommendation APIs.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 18,
    uptime99: 99.99,
    freeTierLimit: "10,000 search requests / month free forever",
    icon: "🔍",
    endpointsCount: 54,
    popularityRank: 92,
    apiKeyUrl: "https://dashboard.algolia.com/account/api-keys",
    docsUrl: "https://www.algolia.com/doc/",
    portalUrl: "https://dashboard.algolia.com"
  },
  {
    id: "mapbox",
    name: "Mapbox Navigation & Maps",
    category: "Location & GIS",
    constellation: "Crux",
    description: "High-performance vector tiles, global forward/reverse geocoding, turn-by-turn routing, and 3D terrain rendering.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 45,
    uptime99: 99.93,
    freeTierLimit: "50,000 map loads & 100,000 geocoding requests / month free",
    icon: "🗺️",
    endpointsCount: 42,
    popularityRank: 90,
    apiKeyUrl: "https://account.mapbox.com/access-tokens/",
    docsUrl: "https://docs.mapbox.com/api/",
    portalUrl: "https://account.mapbox.com"
  },
  {
    id: "deepgram",
    name: "Deepgram Speech AI",
    category: "AI & Machine Learning",
    constellation: "Fornax",
    description: "Real-time speech-to-text, audio intelligence, diarization, and human-like text-to-speech with sub-300ms latency.",
    authType: "API_KEY",
    pricing: "FREEMIUM",
    latencyMs: 68,
    uptime99: 99.94,
    freeTierLimit: "$200 free credit on signup (over 12,000 minutes)",
    icon: "🎙️",
    endpointsCount: 28,
    popularityRank: 91,
    apiKeyUrl: "https://console.deepgram.com/",
    docsUrl: "https://developers.deepgram.com/",
    portalUrl: "https://console.deepgram.com"
  },
  {
    id: "huggingface",
    name: "Hugging Face Inference",
    category: "AI & Machine Learning",
    constellation: "Centaurus",
    description: "Serverless inference for 100,000+ open-source AI models across computer vision, NLP, text generation, and audio.",
    authType: "BEARER",
    pricing: "FREEMIUM",
    latencyMs: 190,
    uptime99: 99.82,
    freeTierLimit: "Free community rate-limited inference API",
    icon: "🤗",
    endpointsCount: 110,
    popularityRank: 94,
    apiKeyUrl: "https://huggingface.co/settings/tokens",
    docsUrl: "https://huggingface.co/docs/api-inference",
    portalUrl: "https://huggingface.co"
  }
];

export default function ApiExplorerPage() {
  const [apis, setApis] = useState<ApiItem[]>(DEFAULT_APIS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPricing, setSelectedPricing] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'constellation'>('grid');
  const [compareList, setCompareList] = useState<ApiItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/explorer/apis')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setApis(d);
        }
      })
      .catch(() => {});
  }, []);

  const toggleCompare = (api: ApiItem) => {
    if (compareList.find((a) => a.id === api.id)) {
      setCompareList(compareList.filter((a) => a.id !== api.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 APIs simultaneously.');
        return;
      }
      setCompareList([...compareList, api]);
    }
  };

  const toggleCollection = (apiId: string) => {
    if (collections.includes(apiId)) {
      setCollections(collections.filter((id) => id !== apiId));
    } else {
      setCollections([...collections, apiId]);
    }
  };

  const categories = ['ALL', 'AI & Machine Learning', 'Fintech & Billing', 'Messaging & Voice', 'Databases & Storage', 'Developer Tools', 'Security & Identity', 'Location & GIS', 'Media & Storage'];

  const filtered = apis.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.constellation.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPricing = selectedPricing === 'ALL' || a.pricing === selectedPricing;
    return matchesSearch && matchesCat && matchesPricing;
  });

  // 3D Constellation Canvas Simulation
  useEffect(() => {
    if (viewMode !== 'constellation') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep space grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Constellation nodes and vector beam lines
      const coords = filtered.slice(0, 12).map((api, i) => {
        const count = Math.min(filtered.length, 12);
        const angle = (i * (Math.PI * 2)) / Math.max(count, 1) + time * 0.2;
        const radius = 150 + Math.sin(time * 1.5 + i) * 25;
        return {
          api,
          x: w / 2 + Math.cos(angle) * radius,
          y: h / 2 + Math.sin(angle) * (radius * 0.65)
        };
      });

      // Connecting laser vectors
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      coords.forEach((c, idx) => {
        const next = coords[(idx + 1) % coords.length];
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(next.x, next.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Stars/Nodes
      coords.forEach((c) => {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(c.api.name, c.x + 10, c.y + 4);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [viewMode, filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-200 uppercase">
              ORBITAL API CATALOG • REAL-WORLD PROVIDERS
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2.5 mt-1">
            <Compass className="w-6 h-6 text-zinc-200" />
            <span>API EXPLORER & STAR SYSTEMS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Direct access to official developer portals & real API key generators for world-class infrastructure
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          {compareList.length > 0 && (
            <SpaceButton
              size="sm"
              variant="primary"
              icon={<GitCompare className="w-3.5 h-3.5" />}
              onClick={() => setShowCompareModal(true)}
            >
              Compare ({compareList.length}/3)
            </SpaceButton>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/[0.06] backdrop-blur-xl p-1 rounded-xl border border-white/20 text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('constellation')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'constellation' ? 'bg-white/10 text-zinc-200' : 'text-slate-400 hover:text-white'}`}
              title="3D Constellation Map"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search API by provider name, constellation, category (e.g. Stripe, OpenAI, Gemini, Twilio)..."
            className="w-full bg-white/[0.08] backdrop-blur-xl/90 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-white/30"
          />
        </div>

        {/* Pricing Filter */}
        <select
          value={selectedPricing}
          onChange={(e) => setSelectedPricing(e.target.value)}
          className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-200 outline-none w-full md:w-auto"
        >
          <option value="ALL">All Pricing Tiers</option>
          <option value="FREEMIUM">Freemium</option>
          <option value="FREE">Free</option>
          <option value="PAID">Paid Only</option>
          <option value="OPEN_SOURCE">Open Source</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-white/10 text-zinc-200 border border-white/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Constellation 3D View */}
      {viewMode === 'constellation' && (
        <GlassPanel glow="purple" className="relative p-4 h-[450px] flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width={800} height={420} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-mono text-zinc-200 bg-white/[0.06] backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              3D STAR MAP: {filtered.length} ACTIVE CELESTIAL NODES
            </span>
          </div>
        </GlassPanel>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((api) => {
            const isComparing = !!compareList.find((a) => a.id === api.id);
            const inCollection = collections.includes(api.id);
            const apiKeyUrl = api.apiKeyUrl || `https://www.google.com/search?q=${encodeURIComponent(api.name + ' api key console')}`;
            const docsUrl = api.docsUrl || `https://www.google.com/search?q=${encodeURIComponent(api.name + ' api documentation')}`;

            return (
              <GlassPanel key={api.id} glow="cyan" className="p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
                        {api.icon}
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-base text-white group-hover:text-white transition-colors">
                          {api.name}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-300">
                          Constellation: {api.constellation} • {api.category}
                        </span>
                      </div>
                    </div>
                    <Badge variant={api.pricing === 'FREE' || api.pricing === 'OPEN_SOURCE' || api.pricing === 'FREEMIUM' ? 'healthy' : 'neutral'}>
                      {api.pricing}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
                    {api.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Free Quota:</span>
                    <span className="text-white text-right font-sans text-[11px] truncate max-w-[200px]" title={api.freeTierLimit}>
                      {api.freeTierLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Uptime / Latency:</span>
                    <span className="text-zinc-200 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-zinc-200" />
                      {api.uptime99}% / {api.latencyMs}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Auth:</span>
                    <span className="text-zinc-200">{api.authType}</span>
                  </div>

                  {/* Primary Action: Direct Real API Key Page - Transparent Glass Capsule */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={apiKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-full bg-white/10 hover:bg-white/10 backdrop-blur-xl text-white border border-white/30 hover:border-white shadow-[0_8px_20px_rgba(255,255,255,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.7)] flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-white" />
                      <span>Get Real API Key</span>
                      <ArrowUpRight className="w-3 h-3 text-white" />
                    </a>

                    {/* Secondary Navigation Tools */}
                    <div className="flex items-center gap-2">
                      <a
                        href={docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-[11px] font-mono text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      >
                        <BookOpen className="w-3 h-3 text-zinc-400" />
                        <span>Docs</span>
                      </a>

                      <Link
                        href={`/playground?service=${encodeURIComponent(api.name)}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-[11px] font-mono text-white hover:text-white flex items-center justify-center gap-1.5 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      >
                        <PlaySquare className="w-3 h-3 text-white" />
                        <span>Playground</span>
                      </Link>

                      <button
                        onClick={() => toggleCompare(api)}
                        className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-1 transition-all backdrop-blur-md ${
                          isComparing
                            ? 'bg-white/10 border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                            : 'bg-white/[0.06] border-white/20 text-zinc-300 hover:text-white hover:bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                        }`}
                        title={isComparing ? 'Remove from Compare' : 'Add to Compare'}
                      >
                        <GitCompare className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => toggleCollection(api.id)}
                        className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-1 transition-all backdrop-blur-md ${
                          inCollection
                            ? 'bg-white/10 border-amber-400 text-zinc-200 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-white/[0.06] border-white/20 text-zinc-300 hover:text-white hover:bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                        }`}
                        title={inCollection ? 'Saved to Collection' : 'Save to Collection'}
                      >
                        {inCollection ? <Check className="w-3 h-3 text-zinc-200" /> : <Plus className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.map((api) => {
            const isComparing = !!compareList.find((a) => a.id === api.id);
            const apiKeyUrl = api.apiKeyUrl || `https://www.google.com/search?q=${encodeURIComponent(api.name + ' api key console')}`;

            return (
              <GlassPanel key={api.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">{api.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-white">{api.name}</h3>
                      <Badge variant="neutral">{api.constellation}</Badge>
                      <Badge variant={api.pricing === 'FREE' ? 'healthy' : 'neutral'}>{api.pricing}</Badge>
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">{api.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="text-zinc-400 hidden lg:block">
                    <span>Latency:</span> <span className="text-zinc-200">{api.latencyMs}ms</span>
                  </div>
                  <div className="text-zinc-400 hidden lg:block">
                    <span>Uptime:</span> <span className="text-zinc-200">{api.uptime99}%</span>
                  </div>

                  <a
                    href={apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/10 backdrop-blur-xl text-white border border-white/30 flex items-center gap-1.5 transition-all font-mono text-xs font-bold shadow-[0_6px_16px_rgba(255,255,255,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.7)]"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-white" />
                    <span>Get Key</span>
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </a>

                  <button
                    onClick={() => toggleCompare(api)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md ${
                      isComparing ? 'bg-white/10 border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-white/[0.06] border-white/20 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isComparing ? 'Comparing' : 'Compare'}
                  </button>

                  <Link href={`/playground?service=${encodeURIComponent(api.name)}`}>
                    <SpaceButton size="sm" variant="secondary">
                      Playground
                    </SpaceButton>
                  </Link>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
          <GlassPanel glow="crimson" className="p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-white" />
                <h2 className="font-display font-bold text-lg text-white">Constellation API Comparison Matrix</h2>
              </div>
              <button onClick={() => setShowCompareModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {compareList.map((c) => (
                <div key={c.id} className="p-4 bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/20 space-y-3 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.35)]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-white/[0.08] border border-white/10">{c.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{c.name}</h3>
                      <span className="text-[10px] text-white">{c.constellation}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-2">
                    <div>
                      <span className="text-slate-500 block">Category</span>
                      <span className="text-slate-200">{c.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pricing Model</span>
                      <span className="text-zinc-200">{c.pricing}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Auth Mechanism</span>
                      <span className="text-slate-200">{c.authType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">p95 Latency</span>
                      <span className="text-zinc-200">{c.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Free Tier Limits</span>
                      <span className="text-slate-300">{c.freeTierLimit}</span>
                    </div>
                  </div>

                  <a
                    href={c.apiKeyUrl || `https://www.google.com/search?q=${encodeURIComponent(c.name + ' api key console')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/10 text-zinc-200 border border-white/30 flex items-center justify-center gap-1.5 transition-colors font-mono text-xs font-semibold"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Get Key ({c.name})</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <SpaceButton variant="secondary" size="sm" onClick={() => setShowCompareModal(false)}>
                Close Comparison
              </SpaceButton>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
