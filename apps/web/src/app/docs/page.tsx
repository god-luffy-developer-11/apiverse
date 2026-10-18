'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  BookOpen,
  Sparkles,
  PlaySquare,
  Search,
  Bookmark,
  Check,
  History,
  FileCode,
  Tag,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';

interface DocItem {
  id: string;
  api: string;
  version: string;
  method: string;
  path: string;
  endpoint: string;
  summary: string;
  parameters: Array<{ name: string; type: string; required: boolean; desc: string }>;
  defaultBody?: string;
  aiExplanation: string;
  changelog: Array<{ version: string; note: string }>;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApi, setSelectedApi] = useState<string>('ALL');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [expandedChangelog, setExpandedChangelog] = useState<string | null>(null);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [dynamicExplanations, setDynamicExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/docs/')
      .then((r) => r.json())
      .then((d) => setDocs(d))
      .catch(() => {});
  }, []);

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter((b) => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  const handleAiExplain = async (doc: DocItem) => {
    setExplainingId(doc.id);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/docs/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api: doc.api,
          endpoint: doc.endpoint,
          description: doc.summary
        })
      });
      const data = await resp.json();
      setDynamicExplanations((prev) => ({ ...prev, [doc.id]: data.explanation }));
    } catch (e) {
      console.error(e);
    } finally {
      setExplainingId(null);
    }
  };

  const filtered = docs.filter((d) => {
    const matchesSearch =
      d.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      d.summary.toLowerCase().includes(search.toLowerCase()) ||
      d.api.toLowerCase().includes(search.toLowerCase());
    const matchesApi = selectedApi === 'ALL' || d.api === selectedApi;
    return matchesSearch && matchesApi;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-zinc-200" />
            <span>OPENAPI 3.0 DOCUMENTATION HUB</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Searchable OpenAPI specs with live Ultron synthesis, changelog tracking, and 1-click Playground launch
          </p>
        </div>

        {/* Bookmarks Counter */}
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 bg-white/[0.06] backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/30">
            <Bookmark className="w-3.5 h-3.5 fill-cyan-400 text-zinc-200" />
            <span>{bookmarks.length} Bookmarked Endpoints</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search OpenAPI specs (e.g. payment_intents, chat, messages, POST)..."
            className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-white/30 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Stripe', 'OpenAI', 'Twilio'].map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedApi(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                selectedApi === prov
                  ? 'bg-white/10 text-zinc-200 border border-white/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* UIUX Interactive Visual Guide & Liquid Glass Design Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.docsGuideStream}
          title="Interactive Video Guide: Validating Webhook Signatures & Idempotency"
          badge="VIDEO DOCUMENTATION"
          category="DEVELOPER GUIDE"
          glow="cyan"
        />

        {/* Liquid Glass UI Kit Showcase Image Reference Card */}
        <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#111833]/90 via-[#090d20]/95 to-[#03050e] border border-pink-400/40 shadow-[0_14px_36px_-6px_rgba(236,72,153,0.35)] backdrop-blur-2xl p-4 flex flex-col justify-between">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
            <img
              src={UIUX_MEDIA.liquidGlassShowcase}
              alt="Liquid Glass UI Kit Showcase"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-pink-500/30 text-[10px] font-mono text-pink-300">
              OFFICIAL UI/UX DESIGN SPEC
            </div>
          </div>
          <div className="pt-3">
            <h4 className="font-display font-bold text-xs text-white">Liquid Glass Component Specification</h4>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              3D optical capsules, dual specular rim lights, and chromatic caustic shadows
            </p>
          </div>
        </div>
      </div>

      {/* Docs Endpoints Feed */}
      <div className="space-y-4">
        {filtered.map((doc) => {
          const isBookmarked = bookmarks.includes(doc.id);
          const showChangelog = expandedChangelog === doc.id;
          const activeExplanation = dynamicExplanations[doc.id] || doc.aiExplanation;

          return (
            <GlassPanel key={doc.id} className="p-5 space-y-4">
              {/* Endpoint Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-white/10 text-zinc-200 border border-white/30 text-xs font-mono font-bold">
                    {doc.method}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white">{doc.path}</span>
                      <span className="text-[10px] font-mono text-zinc-200 bg-white/[0.06] backdrop-blur-xl px-2 py-0.5 rounded border border-white/10">
                        {doc.api} ({doc.version})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(doc.id)}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      isBookmarked
                        ? 'bg-white/10 border-amber-400 text-zinc-200'
                        : 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Bookmarked' : 'Bookmark Endpoint'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                  </button>

                  <SpaceButton
                    size="sm"
                    variant="ultron"
                    icon={<Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                    onClick={() => handleAiExplain(doc)}
                    disabled={explainingId === doc.id}
                  >
                    {explainingId === doc.id ? 'Synthesizing...' : 'Ultron Explain'}
                  </SpaceButton>

                  <Link href="/playground">
                    <SpaceButton size="sm" variant="primary" icon={<PlaySquare className="w-3.5 h-3.5" />}>
                      Try in Playground
                    </SpaceButton>
                  </Link>
                </div>
              </div>

              {/* Endpoint Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{doc.summary}</p>

              {/* Parameters Table */}
              <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                  Request Parameters
                </span>

                <div className="bg-white/[0.06] backdrop-blur-xl rounded-lg border border-white/5 divide-y divide-white/5">
                  {doc.parameters.map((p, idx) => (
                    <div key={idx} className="p-2.5 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-zinc-200 font-bold">{p.name}</span>
                        <span className="text-[10px] text-zinc-200 ml-2">[{p.type}]</span>
                        {p.required && (
                          <span className="text-[9px] text-white ml-2 uppercase font-bold">Required</span>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Explanation Callout */}
              <div className="p-3.5 bg-white/[0.06] backdrop-blur-xl rounded-xl border border-pink-500/25 text-xs font-mono text-pink-200">
                <div className="flex items-center gap-1.5 text-pink-400 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ULTRON ENDPOINT SYNTHESIS & BEST PRACTICES:</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{activeExplanation}</div>
              </div>

              {/* Changelog Accordion */}
              {doc.changelog?.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => setExpandedChangelog(showChangelog ? null : doc.id)}
                    className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-zinc-200 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-200" />
                    <span>Endpoint Version History & Deprecation Tracker</span>
                    {showChangelog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showChangelog && (
                    <div className="mt-2 pl-4 border-l border-white/30 space-y-1.5 font-mono text-xs text-slate-300 pt-1">
                      {doc.changelog.map((ch, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-zinc-200 font-bold text-[11px]">{ch.version}</span>: {ch.note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
