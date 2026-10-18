'use client';

import React, { useState, useRef } from 'react';
import { UltronBlackHole } from '@/components/3d/UltronBlackHole';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  Atom,
  Send,
  Sparkles,
  Terminal,
  Code2,
  ShieldAlert,
  PlaySquare,
  Copy,
  Check,
  RotateCcw,
  Square,
  Layers,
  Zap,
  Bookmark
} from 'lucide-react';
import { ModelProvider, UltronState } from '@/lib/types';
import Link from 'next/link';

const QUICK_PROMPTS = [
  'Debug 429 rate limit failure on Twilio staging planet',
  'Synthesize high-speed Stripe webhook validator with replay protection',
  'Architect multi-model RAG pipeline using Google Gemini & Supabase pgvector',
  'Run cryptographic audit on all AES-256-GCM vault secret prefixes'
];

export default function UltronPage() {
  const [model, setModel] = useState<ModelProvider>('GEMINI');
  const [ultronState, setUltronState] = useState<UltronState>('idle');
  const [prompt, setPrompt] = useState(QUICK_PROMPTS[0]);
  const [output, setOutput] = useState(
    'Ultron Singularity Core initialized. Broken event horizon stable at 60fps.\nReady for multi-model architectural synthesis, payload diagnostics, and real-time code generation.'
  );
  const [copied, setCopied] = useState(false);
  const [tokensCount, setTokensCount] = useState(48);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setUltronState('thinking');
    setOutput('Ultron singularity is contracting... synthesizing neural response...');
    setTokensCount(0);

    try {
      const resp = await fetch('http://localhost:8000/api/v1/ultron/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToRun,
          model,
          context_keys: ['Stripe', 'OpenAI', 'Twilio'],
          include_playground_history: true
        }),
        signal: controller.signal
      });

      if (!resp.body) {
        setUltronState('error');
        setOutput('Neural singularity stream error.');
        return;
      }

      setUltronState('streaming');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let tokens = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;
            let token = '';
            try {
              const parsed = JSON.parse(raw);
              token = parsed.text || parsed.token || '';
            } catch {
              token = raw;
            }
            if (token) {
              accumulated += token;
              tokens += Math.max(1, Math.round(token.length / 4));
              setOutput(accumulated);
              setTokensCount(tokens);
            }
          }
        }
      }
      setUltronState('idle');
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setUltronState('error');
        setOutput('Connection to Ultron core severed.');
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUltronState('idle');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
        <div>
          <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <Atom className="w-6 h-6 text-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <span>ULTRON SINGULARITY CHAMBER</span>
          </h1>
          <p className="text-xs text-zinc-300 font-mono mt-1">
            The Fractured Black Hole Developer Intelligence • Google Gemini Multi-Turn Stream • Context-Aware Neural Lattice
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="crimson" pulse>
            SINGULARITY ONLINE
          </Badge>
          <span className="text-xs font-mono text-white bg-black/90 px-3.5 py-1 rounded-full border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
            Tokens: <span className="text-white font-bold">{tokensCount}</span> • Est: ${(tokensCount * 0.000002).toFixed(6)}
          </span>
        </div>
      </div>

      {/* 3D Realistic Black Hole Centerpiece with Accretion Disk */}
      <div className="flex justify-center my-3">
        <UltronBlackHole state={ultronState} size={380} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Directives:</span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(qp);
              handleGenerate(qp);
            }}
            className="text-[11px] font-mono text-zinc-300 hover:text-white bg-black/80 px-3.5 py-1 rounded-full border border-white/15 hover:border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all truncate max-w-sm"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Mineralistic Intelligence Console */}
      <GlassPanel glow="crimson" className="p-6 space-y-4">
        {/* Model Switcher & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span className="font-mono text-xs text-white font-bold tracking-wider">ULTRON REASONING CORE</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">Neural Model:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
            >
              <option value="GEMINI">Google Gemini 3.5 Flash / Pro (Live)</option>
              <option value="OPENAI">OpenAI GPT-4o Mini / Core</option>
              <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>
        </div>

        {/* Streamed Output Window */}
        <div className="relative">
          <div className="p-5 bg-black/90 rounded-2xl border border-white/15 font-mono text-xs text-zinc-100 leading-relaxed whitespace-pre-wrap min-h-[220px] max-h-[480px] overflow-y-auto shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]">
            {output}
          </div>

          {/* Action Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={copyOutput}
              className="p-1.5 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-mono flex items-center gap-1 border border-white/15"
              title="Copy Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (ultronState === 'idle') setUltronState('listening');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Command Ultron: e.g. 'Synthesize a Stripe webhook signature validator with replay protection'..."
            className="flex-1 bg-black/90 border border-white/20 rounded-full px-5 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] font-sans"
          />

          {ultronState === 'streaming' ? (
            <SpaceButton variant="danger" size="md" icon={<Square className="w-4 h-4" />} onClick={handleStop}>
              Halt
            </SpaceButton>
          ) : (
            <SpaceButton
              variant="ultron"
              size="md"
              icon={<Send className="w-4 h-4 text-white" />}
              onClick={() => handleGenerate()}
            >
              Transmit
            </SpaceButton>
          )}
        </div>

        {/* Context Vectors Footer */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Active Context:</span>
            <span className="text-zinc-300">Vault (Stripe, OpenAI, Twilio) • Playground (HTTP 200) • Alerts (1 Solar Flare)</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/playground" className="text-white hover:text-white hover:underline flex items-center gap-1 transition-colors">
              <PlaySquare className="w-3 h-3 text-white" />
              <span>Insert in Playground</span>
            </Link>
            <Link href="/alerts" className="text-white hover:text-white hover:underline flex items-center gap-1 transition-colors">
              <ShieldAlert className="w-3 h-3 text-white" />
              <span>Create Alert</span>
            </Link>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
