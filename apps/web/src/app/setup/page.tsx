'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';
import {
  Rocket,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode,
  Shield,
  Zap,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  desc: string;
}

export default function SetupAssistantPage() {
  const [selectedApi, setSelectedApi] = useState('Stripe');
  const [data, setData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [snippetLang, setSnippetLang] = useState<'curl' | 'javascript' | 'python' | 'go' | 'php'>('javascript');
  const [pkgManager, setPkgManager] = useState<'npm' | 'python' | 'go' | 'php'>('npm');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/setup/steps/${selectedApi}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setCurrentStep(0);
        setVerificationResult(null);
      })
      .catch(() => {});
  }, [selectedApi]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (stepId: string) => {
    setIsVerifying(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/setup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_name: selectedApi,
          step_id: stepId
        })
      });
      const res = await resp.json();
      setVerificationResult(res);
      if (currentStep < (data?.steps?.length || 5) - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (e) {
      setVerificationResult({ verified: false, message: 'Handshake timeout' });
    } finally {
      setIsVerifying(false);
    }
  };

  const currentSnippet = data?.snippets?.[snippetLang] || '// Loading snippet...';
  const currentSdkCmd = data?.sdkInstall?.[pkgManager] || 'pnpm add stripe';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-zinc-200" />
            <span>LAUNCH CHECKLIST & SETUP WIZARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Guided 5-step integration assistant with live cryptographic verification & multi-runtime snippets
          </p>
        </div>

        {/* API Switcher */}
        <div className="flex items-center gap-2">
          {['Stripe', 'OpenAI'].map((api) => (
            <button
              key={api}
              onClick={() => setSelectedApi(api)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedApi === api
                  ? 'bg-white/20 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/[0.08] backdrop-blur-xl text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {api}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5-Step Launch Checklist (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
            Launch Checklist: {selectedApi}
          </div>

          {data?.steps?.map((st: Step, idx: number) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <GlassPanel
                key={st.id}
                glow={isCurrent ? 'cyan' : 'none'}
                className={`p-4 transition-all cursor-pointer ${
                  isCurrent ? 'border-white/30 bg-white/10' : 'border-white/5 opacity-80'
                }`}
                onClick={() => setCurrentStep(idx)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs shrink-0 transition-transform ${
                      isCompleted
                        ? 'bg-white/20 text-black font-bold'
                        : isCurrent
                        ? 'bg-white/20 text-black font-bold scale-110 shadow-[0_0_10px_#22d3ee]'
                        : 'bg-white/[0.06] backdrop-blur-xl text-slate-500 border border-white/10'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display font-bold text-sm ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        {st.title}
                      </h3>
                      {isCompleted && <Badge variant="healthy">VERIFIED</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.desc}</p>

                    {isCurrent && (
                      <div className="mt-3 flex items-center gap-2">
                        <SpaceButton
                          size="sm"
                          variant="primary"
                          icon={<Zap className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(st.id);
                          }}
                          disabled={isVerifying}
                        >
                          {isVerifying ? 'Verifying Handshake...' : 'Verify Step'}
                        </SpaceButton>
                      </div>
                    )}
                  </div>
                </div>
              </GlassPanel>
            );
          })}

          {/* Verification Ping Result Badge */}
          {verificationResult && (
            <GlassPanel glow={verificationResult.verified ? 'cyan' : 'danger'} className="p-4 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-zinc-200" />
                <span className="font-mono text-xs font-bold text-zinc-200">
                  {verificationResult.verified ? 'LIVE HANDSHAKE CONFIRMED' : 'VERIFICATION FAILED'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  {verificationResult.latencyMs}ms latency
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300">{verificationResult.message}</p>
            </GlassPanel>
          )}

          {/* Liquid Glass Setup Telemetry Stream (UIUX Asset 11) */}
          <LiquidGlassVideoCard
            src={UIUX_MEDIA.setupAssistantStream}
            title="LAUNCH VERIFICATION TELEMETRY"
            badge="LIVE RUNTIME STREAM"
            description="Autonomous handshake protocol and cryptographic validation engine feed."
            className="w-full mt-4"
          />
        </div>

        {/* Right: Code Snippets & Environment Config (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* SDK Installation Banner */}
          <GlassPanel className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                <Terminal className="w-4 h-4 text-zinc-200" />
                <span>SDK INSTALLATION COMMAND</span>
              </div>

              {/* Package Manager Selector */}
              <div className="flex items-center gap-1 bg-white/[0.06] backdrop-blur-xl p-1 rounded-lg border border-white/10 text-[11px] font-mono">
                {(['npm', 'python', 'go', 'php'] as const).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPkgManager(pm)}
                    className={`px-2 py-0.5 rounded ${
                      pkgManager === pm ? 'bg-white/10 text-zinc-200 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/10 font-mono text-xs text-zinc-200">
              <code>{currentSdkCmd}</code>
              <button
                onClick={() => copyToClipboard(currentSdkCmd)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Command"
              >
                {copied ? <Check className="w-4 h-4 text-zinc-200" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </GlassPanel>

          {/* 5-Language Snippet Hub */}
          <GlassPanel glow="cyan" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Code2 className="w-4 h-4 text-zinc-200" />
                <span>FIRST REQUEST SNIPPET</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-white/[0.06] backdrop-blur-xl p-1 rounded-lg border border-white/10 text-[11px] font-mono">
                {(['javascript', 'python', 'go', 'php', 'curl'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSnippetLang(lang)}
                    className={`px-2 py-0.5 rounded uppercase ${
                      snippetLang === lang ? 'bg-white/10 text-zinc-200 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {lang === 'javascript' ? 'JS/TS' : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="bg-white/[0.06] backdrop-blur-xl p-4 rounded-xl border border-white/10 font-mono text-xs text-zinc-200 overflow-x-auto min-h-[180px] leading-relaxed">
                <code>{currentSnippet}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(currentSnippet)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                title="Copy Snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </GlassPanel>

          {/* Environment Variables Template */}
          <GlassPanel className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <FileCode className="w-4 h-4 text-zinc-200" />
                <span>.env.local TEMPLATE</span>
              </div>
              <button
                onClick={() => copyToClipboard(data?.envSnippet || '')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy .env"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/10 font-mono text-[11px] text-zinc-200 overflow-x-auto">
              <code>{data?.envSnippet || '# Generating env variables...'}</code>
            </pre>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
