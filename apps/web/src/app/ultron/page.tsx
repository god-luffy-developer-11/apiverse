'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Bookmark,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  AudioWaveform
} from 'lucide-react';
import { ModelProvider, UltronState } from '@/lib/types';
import { useUltronVoice } from '@/lib/voice/useUltronVoice';
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
    'Ultron Singularity Core initialized. Quantum event horizon stabilized at 60fps.\nJARVIS voice protocol ready for multi-model architectural synthesis, payload diagnostics, and real-time verbal commands.'
  );
  const [copied, setCopied] = useState(false);
  const [tokensCount, setTokensCount] = useState(48);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Voice Engine (Voice Command + Voice Reply like JARVIS Female AI)
  const {
    isListening,
    isSpeaking,
    voiceEnabled,
    transcript,
    interimTranscript,
    audioLevel,
    voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice
  } = useUltronVoice({
    onCommand: (cmd) => {
      setPrompt(cmd);
      handleGenerate(cmd);
    }
  });

  // Keep Ultron state synced with voice
  useEffect(() => {
    if (isListening) {
      setUltronState('listening');
    } else if (ultronState === 'listening' && !isListening) {
      setUltronState('idle');
    }
  }, [isListening, ultronState]);

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    stopSpeaking();
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

      // JARVIS Voice Reply
      if (accumulated && voiceEnabled) {
        speak(accumulated);
      }
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
    stopSpeaking();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.35),0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
              JARVIS PROTOCOL ACTIVE • VOICE COMMAND & SPEECH SYNTHESIS ONLINE
            </span>
          </div>
          <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <Atom className="w-6 h-6 text-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <span>ULTRON SINGULARITY CHAMBER</span>
          </h1>
          <p className="text-xs text-zinc-300 font-mono mt-0.5">
            Quantum Arc Reactor Core • Voice Command & Neural Vocal Response • Google Gemini 3.8 Multi-Turn Stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice Mute/Unmute Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-mono backdrop-blur-xl ${
              voiceEnabled
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.06] border-white/20 text-zinc-400 hover:text-white'
            }`}
            title={voiceEnabled ? 'Female AI Voice Enabled (Click to Mute)' : 'Female AI Voice Muted (Click to Enable)'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{voiceEnabled ? 'Female Voice: ON' : 'Voice Reply: OFF'}</span>
          </button>

          <Badge variant={isSpeaking ? 'healthy' : isListening ? 'neutral' : 'crimson'} pulse>
            {isSpeaking ? 'TRANSMITTING' : isListening ? 'LISTENING' : 'CORE ONLINE'}
          </Badge>
          <span className="text-xs font-mono text-white bg-black/90 px-3.5 py-2 rounded-2xl border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
            Tokens: <span className="text-white font-bold">{tokensCount}</span>
          </span>
        </div>
      </div>

      {/* 3D Realistic High-Tech Black Hole Centerpiece with Audio Reactive Waveforms */}
      <div className="flex flex-col items-center justify-center my-2">
        <UltronBlackHole
          state={ultronState}
          size={390}
          audioLevel={audioLevel}
          isSpeaking={isSpeaking}
          isListening={isListening}
        />

        {/* Live Voice Status Capsule */}
        <div className="mt-3 flex items-center gap-3">
          {isListening && (
            <div className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/50 backdrop-blur-xl text-blue-200 font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>{interimTranscript ? `"${interimTranscript}"` : 'Listening for your voice command, sir...'}</span>
            </div>
          )}

          {isSpeaking && (
            <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-xl text-cyan-200 font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Ultron is vocalizing response...</span>
              <button
                onClick={stopSpeaking}
                className="ml-2 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors"
              >
                Silence
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Directives:</span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(qp);
              handleGenerate(qp);
            }}
            className="text-[11px] font-mono text-zinc-300 hover:text-white bg-black/80 px-3.5 py-1.5 rounded-2xl border border-white/15 hover:border-white/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all truncate max-w-sm"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Futuristic Singularity Console */}
      <GlassPanel glow="crimson" className="p-6 space-y-4">
        {/* Model Switcher & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span className="font-mono text-xs text-white font-bold tracking-wider">ULTRON MULTI-NEURAL CONSOLE</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">Neural Model:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
            >
              <option value="GEMINI">Google Gemini 3.8 Flash / Pro (Live Web & News)</option>
              <option value="OPENAI">OpenAI GPT-4o Mini / Reasoning</option>
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
            {voiceEnabled && output && (
              <button
                onClick={() => (isSpeaking ? stopSpeaking() : speak(output))}
                className={`p-1.5 px-2.5 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-all ${
                  isSpeaking
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
                title={isSpeaking ? 'Stop Speaking' : 'Read Out Loud (JARVIS)'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
              </button>
            )}

            <button
              onClick={copyOutput}
              className="p-1.5 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-mono flex items-center gap-1 border border-white/15"
              title="Copy Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Voice Error Banner */}
        {voiceError && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 animate-pulse">
            <span>⚠️ {voiceError}</span>
            <button
              onClick={() => startListening()}
              className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-[11px] font-bold border border-amber-500/30 transition-all shrink-0"
            >
              Retry Mic
            </button>
          </div>
        )}

        {/* Voice & Text Input Command Bar */}
        <div className="flex items-center gap-2">
          {/* Voice Command Mic Trigger (Like JARVIS) */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3.5 rounded-full border transition-all duration-300 flex items-center justify-center relative shrink-0 ${
              isListening
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_24px_rgba(37,99,235,0.8)] scale-105 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
            title={isListening ? 'Stop Listening' : 'Voice Command: Tap to speak to Ultron'}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4 text-white" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            )}
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (ultronState === 'idle') setUltronState('listening');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder={
              isListening
                ? 'Listening to your voice command, sir...'
                : "Type command or tap mic: e.g. 'Synthesize a Stripe webhook validator with replay protection'..."
            }
            className="flex-1 bg-black/90 border border-white/20 rounded-full px-5 py-3 text-xs text-white placeholder-zinc-400 outline-none focus:border-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] font-sans"
          />

          {ultronState === 'streaming' || isSpeaking ? (
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
