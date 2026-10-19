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
  ArrowUpRight,
  Lock,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import Link from 'next/link';

interface ApiItem {
  id: string;
  name: string;
  category: string;
  constellation: string;
  description: string;
  authType: string;
  authRaw?: string;
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
  url?: string;
  https?: boolean;
  cors?: string;
  quickSetupSnippet?: string;
}

interface CategoryInfo {
  name: string;
  icon: string;
  count: number;
}

export default function ApiExplorerPage() {
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPricing, setSelectedPricing] = useState<string>('ALL');
  const [selectedAuth, setSelectedAuth] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'constellation'>('grid');
  const [compareList, setCompareList] = useState<ApiItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApis, setTotalApis] = useState(0);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch from unified /api/explorer route
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedPricing !== 'ALL') params.set('pricing', selectedPricing);
    if (selectedAuth !== 'ALL') params.set('auth_type', selectedAuth);
    if (search.trim()) params.set('search', search.trim());
    params.set('page', page.toString());
    params.set('limit', '36');

    fetch(`/api/explorer?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isCancelled && data && Array.isArray(data.apis)) {
          setApis(data.apis);
          setTotalPages(data.totalPages || 1);
          setTotalApis(data.total || 0);
          if (data.categoriesSummary && Array.isArray(data.categoriesSummary.categories) && categoriesList.length === 0) {
            setCategoriesList(data.categoriesSummary.categories);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch explorer APIs:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [search, selectedCategory, selectedPricing, selectedAuth, page, categoriesList.length]);

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

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

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
      const coords = apis.slice(0, 16).map((api, i) => {
        const count = Math.min(apis.length, 16);
        const angle = (i * (Math.PI * 2)) / Math.max(count, 1) + time * 0.2;
        const radius = 150 + Math.sin(time * 1.5 + i) * 25;
        return {
          api,
          x: w / 2 + Math.cos(angle) * radius,
          y: h / 2 + Math.sin(angle) * (radius * 0.65)
        };
      });

      // Connecting laser vectors
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
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
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
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
  }, [viewMode, apis]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase font-bold flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              PUBLIC-APIS CANONICAL DATABASE INJECTED • {totalApis.toLocaleString()} APIS • 53 CATEGORIES
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2.5 mt-1">
            <Compass className="w-6 h-6 text-zinc-200" />
            <span>API EXPLORER & GLOBAL REPOSITORIES</span>
          </h1>
          <p className="text-xs text-slate-300 font-mono mt-1">
            Complete real-world public APIs catalog parsed from public-apis with real documentation, direct endpoints, CORS & HTTPS validation
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
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'constellation' ? 'bg-white/10 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'}`}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search across 2,190+ APIs (e.g. OpenAI, Stripe, Weather, GitHub, Currency, Anime, Blockchain)..."
            className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
          />
        </div>

        {/* Pricing Filter */}
        <select
          value={selectedPricing}
          onChange={(e) => {
            setSelectedPricing(e.target.value);
            setPage(1);
          }}
          className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-200 outline-none w-full md:w-auto"
        >
          <option value="ALL">All Pricing Tiers</option>
          <option value="FREE">Free (No Card)</option>
          <option value="FREEMIUM">Freemium Tier</option>
          <option value="PAID">Paid Only</option>
        </select>

        {/* Auth Type Filter */}
        <select
          value={selectedAuth}
          onChange={(e) => {
            setSelectedAuth(e.target.value);
            setPage(1);
          }}
          className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-200 outline-none w-full md:w-auto"
        >
          <option value="ALL">All Auth Models</option>
          <option value="NONE">No Auth (Public)</option>
          <option value="API_KEY">API Key</option>
          <option value="OAUTH">OAuth 2.0</option>
        </select>
      </div>

      {/* Category Pills (Dynamic from public-apis 53 Categories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => handleCategorySelect('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
            selectedCategory === 'ALL'
              ? 'bg-white/15 text-white border border-white/40 shadow-[0_4px_16px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)]'
              : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:bg-white/[0.08]'
          }`}
        >
          <span>✨</span>
          <span>ALL CATEGORIES</span>
          <span className="text-[10px] opacity-75 font-bold">({totalApis})</span>
        </button>

        {categoriesList.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategorySelect(cat.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? 'bg-white/15 text-white border border-white/40 shadow-[0_4px_16px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:bg-white/[0.08]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="text-[10px] opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Constellation 3D View */}
      {viewMode === 'constellation' && (
        <GlassPanel glow="purple" className="relative p-4 h-[450px] flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width={800} height={420} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-mono text-zinc-200 bg-white/[0.06] backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              3D STAR MAP: {apis.length} ACTIVE NODES VISUALIZED
            </span>
          </div>
        </GlassPanel>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center font-mono text-sm text-zinc-400 animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span>Searching public-apis database catalog...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && apis.length === 0 && (
        <div className="py-20 text-center font-mono text-sm text-zinc-400 bg-white/[0.03] rounded-3xl border border-white/10 p-8">
          <p className="text-white font-bold text-base mb-1">No APIs found matching query</p>
          <p className="text-xs text-zinc-400">Try adjusting your category filter, pricing tier, or search keyword.</p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedPricing('ALL');
              setSelectedAuth('ALL');
              setSearch('');
              setPage(1);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apis.map((api) => {
            const isComparing = !!compareList.find((a) => a.id === api.id);
            const inCollection = collections.includes(api.id);
            const targetUrl = api.docsUrl || api.url || `https://www.google.com/search?q=${encodeURIComponent(api.name + ' api')}`;

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
                          {api.category} • {api.constellation}
                        </span>
                      </div>
                    </div>
                    <Badge variant={api.pricing === 'FREE' ? 'healthy' : 'neutral'}>
                      {api.pricing}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
                    {api.description}
                  </p>

                  {/* Badges for HTTPS, CORS, Auth */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {api.https ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> HTTPS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        HTTP Only
                      </span>
                    )}

                    {api.cors && api.cors !== 'Unknown' && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${api.cors.toLowerCase() === 'yes' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                        CORS: {api.cors}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/[0.08] text-zinc-200 border border-white/20">
                      {api.authRaw && api.authRaw !== 'No' ? `Auth: ${api.authRaw}` : 'Open (No Auth)'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Access Tier:</span>
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

                  {/* Primary Action: Direct Provider Link */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:border-white shadow-[0_8px_20px_rgba(255,255,255,0.2),inset_0_1.5px_1px_rgba(255,255,255,0.7)] flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-white" />
                      <span>Visit Provider & Docs</span>
                      <ArrowUpRight className="w-3 h-3 text-white" />
                    </a>

                    {/* Secondary Navigation Tools */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/playground?service=${encodeURIComponent(api.name)}&endpoint=${encodeURIComponent(api.url || '')}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-[11px] font-mono text-white flex items-center justify-center gap-1.5 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      >
                        <PlaySquare className="w-3 h-3 text-white" />
                        <span>Playground</span>
                      </Link>

                      <button
                        onClick={() => toggleCompare(api)}
                        className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-1 transition-all backdrop-blur-md ${
                          isComparing
                            ? 'bg-white/20 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
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
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-white/[0.06] border-white/20 text-zinc-300 hover:text-white hover:bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                        }`}
                        title={inCollection ? 'Saved to Collection' : 'Save to Collection'}
                      >
                        {inCollection ? <Check className="w-3 h-3 text-amber-300" /> : <Plus className="w-3 h-3" />}
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
      {!loading && viewMode === 'list' && (
        <div className="space-y-3">
          {apis.map((api) => {
            const isComparing = !!compareList.find((a) => a.id === api.id);
            const targetUrl = api.docsUrl || api.url || `https://www.google.com/search?q=${encodeURIComponent(api.name + ' api')}`;

            return (
              <GlassPanel key={api.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">{api.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-white">{api.name}</h3>
                      <Badge variant="neutral">{api.category}</Badge>
                      <Badge variant={api.pricing === 'FREE' ? 'healthy' : 'neutral'}>{api.pricing}</Badge>
                      {api.https && <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">HTTPS</span>}
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">{api.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  <div className="text-zinc-400 hidden lg:block">
                    <span>Latency:</span> <span className="text-zinc-200">{api.latencyMs}ms</span>
                  </div>
                  <div className="text-zinc-400 hidden lg:block">
                    <span>Uptime:</span> <span className="text-zinc-200">{api.uptime99}%</span>
                  </div>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/30 flex items-center gap-1.5 transition-all font-mono text-xs font-bold shadow-[0_6px_16px_rgba(255,255,255,0.2),inset_0_1.5px_1px_rgba(255,255,255,0.7)]"
                  >
                    <Globe2 className="w-3.5 h-3.5 text-white" />
                    <span>Visit</span>
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </a>

                  <button
                    onClick={() => toggleCompare(api)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md ${
                      isComparing ? 'bg-white/20 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-white/[0.06] border-white/20 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isComparing ? 'Comparing' : 'Compare'}
                  </button>

                  <Link href={`/playground?service=${encodeURIComponent(api.name)}&endpoint=${encodeURIComponent(api.url || '')}`}>
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

      {/* Pagination Controls */}
      {!loading && totalApis > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 font-mono text-xs">
          <div className="text-zinc-400">
            Showing <span className="text-white font-bold">{(page - 1) * 36 + 1}</span> to <span className="text-white font-bold">{Math.min(page * 36, totalApis)}</span> of <span className="text-white font-bold">{totalApis.toLocaleString()}</span> Public APIs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 text-white flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-zinc-300 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 text-white flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
                      <span className="text-[10px] text-zinc-300">{c.category}</span>
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
                      <span className="text-slate-200">{c.authRaw || c.authType}</span>
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
                    href={c.docsUrl || c.url || `https://www.google.com/search?q=${encodeURIComponent(c.name + ' api')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 flex items-center justify-center gap-1.5 transition-all font-mono text-xs font-semibold"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Open Provider</span>
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
