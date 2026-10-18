'use client';

import React, { useState } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import {
  PlaySquare,
  Send,
  Code,
  Share2,
  Shield,
  Clock,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import { formatBytes, formatLatency } from '@apiverse/utils';
import { realtimeGateway } from '@/lib/realtime-client';

interface KeyVal {
  key: string;
  value: string;
  enabled: boolean;
}

const PRESET_REQUESTS = [
  {
    name: 'Stripe: Create PaymentIntent',
    method: 'POST',
    url: 'https://httpbin.org/post',
    authType: 'bearer',
    authToken: 'sk_test_mock_stripe_key',
    body: '{\n  "amount": 2500,\n  "currency": "usd",\n  "payment_method_types": ["card"]\n}'
  },
  {
    name: 'OpenAI: Chat Completion',
    method: 'POST',
    url: 'https://httpbin.org/post',
    authType: 'bearer',
    authToken: 'sk-proj-mock-openai-key',
    body: '{\n  "model": "gpt-4o-mini",\n  "messages": [\n    {"role": "user", "content": "Ping"}\n  ]\n}'
  },
  {
    name: 'Twilio: Send SMS',
    method: 'POST',
    url: 'https://httpbin.org/post',
    authType: 'basic',
    authToken: 'ACmock:authtoken',
    body: '{\n  "To": "+15551234567",\n  "From": "+15559876543",\n  "Body": "APIVerse Code: 9812"\n}'
  },
  {
    name: 'Httpbin: Get User IP & Headers',
    method: 'GET',
    url: 'https://httpbin.org/get',
    authType: 'none',
    authToken: '',
    body: ''
  }
];

export default function PlaygroundPage() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('POST');
  const [url, setUrl] = useState('https://httpbin.org/post');
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'headers' | 'auth' | 'body' | 'codegen'>('body');
  const [activeRespTab, setActiveRespTab] = useState<'pretty' | 'raw' | 'headers' | 'timing'>('pretty');

  // Request Data
  const [params, setParams] = useState<KeyVal[]>([{ key: 'version', value: '2026-v1', enabled: true }]);
  const [headers, setHeaders] = useState<KeyVal[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'X-Requested-By', value: 'APIVerse-Playground', enabled: true }
  ]);
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'apiKey' | 'basic'>('none');
  const [authToken, setAuthToken] = useState('');
  const [body, setBody] = useState('{\n  "event": "charge.success",\n  "amount": 2500,\n  "currency": "usd"\n}');
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');

  // Response Data
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const loadPreset = (p: typeof PRESET_REQUESTS[0]) => {
    setMethod(p.method as any);
    setUrl(p.url);
    setAuthType(p.authType as any);
    setAuthToken(p.authToken);
    setBody(p.body);
  };

  const addParam = () => setParams([...params, { key: '', value: '', enabled: true }]);
  const removeParam = (idx: number) => setParams(params.filter((_, i) => i !== idx));

  const addHeader = () => setHeaders([...headers, { key: '', value: '', enabled: true }]);
  const removeHeader = (idx: number) => setHeaders(headers.filter((_, i) => i !== idx));

  const runRequest = async () => {
    setIsLoading(true);

    // Build header dict
    const headerDict: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.enabled && h.key) headerDict[h.key] = h.value;
    });

    // Build param dict
    const paramDict: Record<string, string> = {};
    params.forEach((p) => {
      if (p.enabled && p.key) paramDict[p.key] = p.value;
    });

    try {
      const resp = await fetch('http://localhost:8000/api/v1/playground/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: headerDict,
          params: paramDict,
          auth_type: authType,
          auth_token: authToken,
          body_type: 'json',
          body: method === 'GET' ? '' : body
        })
      });
      const data = await resp.json();
      setResponse(data);
    } catch (e: any) {
      setResponse({
        status: 500,
        statusText: 'Client Execution Failure',
        data: { error: e.message },
        sizeBytes: 0,
        timing: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareWithTeam = () => {
    realtimeGateway.send({
      type: 'PLAYGROUND_COLLAB_SYNC',
      workspaceId: 'ws_solar_alpha',
      timestamp: new Date().toISOString(),
      payload: { method, url, body }
    });
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  const getGeneratedCode = () => {
    if (codeLang === 'curl') {
      const authHeader = authType === 'bearer' ? ` -H "Authorization: Bearer ${authToken || '$TOKEN'}"` : '';
      const bodyPart = method !== 'GET' ? ` -d '${body.replace(/\n/g, '')}'` : '';
      return `curl -X ${method} "${url}"${authHeader} -H "Content-Type: application/json"${bodyPart}`;
    }
    if (codeLang === 'javascript') {
      return `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
    ${authType === 'bearer' ? `"Authorization": "Bearer ${authToken || 'YOUR_KEY'}",` : ''}
  },
  ${method !== 'GET' ? `body: JSON.stringify(${body})` : ''}
});
const data = await response.json();
console.log(data);`;
    }
    if (codeLang === 'python') {
      return `import requests

headers = {
    "Content-Type": "application/json",
    ${authType === 'bearer' ? `"Authorization": "Bearer ${authToken || 'YOUR_KEY'}",` : ''}
}
response = requests.${method.toLowerCase()}(
    "${url}",
    headers=headers,
    ${method !== 'GET' ? `data='''${body}'''` : ''}
)
print(response.json())`;
    }
    if (codeLang === 'go') {
      return `package main

import (
  "bytes"
  "fmt"
  "net/http"
  "io"
)

func main() {
  req, _ := http.NewRequest("${method}", "${url}", bytes.NewBuffer([]byte(\`${body}\`)))
  req.Header.Set("Content-Type", "application/json")
  resp, _ := http.DefaultClient.Do(req)
  body, _ := io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-zinc-200" />
            <span>POSTMAN-CLASS API PLAYGROUND</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Trust SSRF-Protected Proxy • Live Timing Waterfall Breakdown • Real-Time Team Sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SpaceButton
            size="sm"
            variant="secondary"
            icon={sharedToast ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Share2 className="w-3.5 h-3.5" />}
            onClick={shareWithTeam}
          >
            {sharedToast ? 'Broadcasted to Team!' : 'Share Live with Team'}
          </SpaceButton>
        </div>
      </div>

      {/* Preset Request Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Presets:</span>
        {PRESET_REQUESTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => loadPreset(p)}
            className="px-2.5 py-1 rounded bg-white/[0.06] backdrop-blur-xl border border-white/5 hover:border-white/30 text-[11px] font-mono text-slate-300 hover:text-zinc-200 transition-colors shrink-0"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Request Execution Bar */}
      <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-xl p-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-bold outline-none border transition-colors ${
            method === 'GET'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : method === 'POST'
              ? 'bg-white/10 text-zinc-200 border-white/30'
              : method === 'PUT'
              ? 'bg-white/10 text-zinc-200 border-white/30'
              : 'bg-white/10 text-white border-white/30'
          }`}
        >
          <option value="GET" className="bg-white/[0.06] backdrop-blur-xl text-white">GET</option>
          <option value="POST" className="bg-white/[0.06] backdrop-blur-xl text-white">POST</option>
          <option value="PUT" className="bg-white/[0.06] backdrop-blur-xl text-white">PUT</option>
          <option value="DELETE" className="bg-white/[0.06] backdrop-blur-xl text-white">DELETE</option>
          <option value="PATCH" className="bg-white/[0.06] backdrop-blur-xl text-white">PATCH</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/..."
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-white outline-none placeholder-slate-500"
        />

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            <Shield className="w-3 h-3 text-zinc-200" />
            <span>SSRF GUARD</span>
          </div>

          <SpaceButton
            variant="primary"
            size="md"
            icon={<Send className="w-3.5 h-3.5" />}
            onClick={runRequest}
            disabled={isLoading}
          >
            {isLoading ? 'Executing...' : 'Send'}
          </SpaceButton>
        </div>
      </div>

      {/* Editor & Response Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Configuration (6 Cols) */}
        <GlassPanel className="p-4 lg:col-span-6 flex flex-col h-[520px]">
          {/* Request Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['body', 'params', 'headers', 'auth', 'codegen'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveReqTab(tab)}
                  className={`px-3 py-1 rounded-md transition-colors uppercase ${
                    activeReqTab === tab
                      ? 'bg-white/10 text-zinc-200 font-bold border border-white/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'codegen' ? 'Code Gen' : tab}
                </button>
              ))}
            </div>

            <Badge variant="neutral">HTTP/1.1 & 2.0</Badge>
          </div>

          {/* Tab 1: Body Editor */}
          {activeReqTab === 'body' && (
            <div className="flex-1 flex flex-col">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                className="flex-1 w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-3 text-xs font-mono text-zinc-200 outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Tab 2: Params Table */}
          {activeReqTab === 'params' && (
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span>Query Parameters</span>
                <button
                  onClick={addParam}
                  className="px-2 py-0.5 rounded bg-white/10 text-zinc-200 hover:bg-white/20 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Param
                </button>
              </div>

              {params.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].enabled = e.target.checked;
                      setParams(copy);
                    }}
                    className="rounded bg-white/[0.06] backdrop-blur-xl border-white/20"
                  />
                  <input
                    type="text"
                    value={p.key}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].key = e.target.value;
                      setParams(copy);
                    }}
                    placeholder="Key"
                    className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded px-2.5 py-1 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={p.value}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].value = e.target.value;
                      setParams(copy);
                    }}
                    placeholder="Value"
                    className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded px-2.5 py-1 text-slate-300 outline-none"
                  />
                  <button onClick={() => removeParam(idx)} className="text-slate-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Headers Table */}
          {activeReqTab === 'headers' && (
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 mb-1">
                <span>Request Headers</span>
                <button
                  onClick={addHeader}
                  className="px-2 py-0.5 rounded bg-white/10 text-zinc-200 hover:bg-white/20 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Header
                </button>
              </div>

              {headers.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].enabled = e.target.checked;
                      setHeaders(copy);
                    }}
                    className="rounded bg-white/[0.06] backdrop-blur-xl border-white/20"
                  />
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].key = e.target.value;
                      setHeaders(copy);
                    }}
                    placeholder="Header Name"
                    className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded px-2.5 py-1 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].value = e.target.value;
                      setHeaders(copy);
                    }}
                    placeholder="Value"
                    className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded px-2.5 py-1 text-slate-300 outline-none"
                  />
                  <button onClick={() => removeHeader(idx)} className="text-slate-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Auth Tab */}
          {activeReqTab === 'auth' && (
            <div className="flex-1 space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5">Authentication Type</label>
                <div className="flex gap-2">
                  {(['none', 'bearer', 'apiKey', 'basic'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAuthType(t)}
                      className={`px-3 py-1.5 rounded-lg border uppercase ${
                        authType === t
                          ? 'bg-white/10 border-cyan-400 text-zinc-200'
                          : 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {authType === 'bearer' && (
                <div>
                  <label className="text-slate-400 block mb-1">Bearer Token / API Key</label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="sk_live_... or token string"
                    className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {authType === 'basic' && (
                <div>
                  <label className="text-slate-400 block mb-1">Basic Auth (username:password)</label>
                  <input
                    type="text"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="username:password or APIKey:secret"
                    className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Code Generation */}
          {activeReqTab === 'codegen' && (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  {(['curl', 'javascript', 'python', 'go'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-2 py-0.5 rounded uppercase ${
                        codeLang === lang ? 'bg-white/10 text-zinc-200 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {lang === 'javascript' ? 'JS Fetch' : lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getGeneratedCode());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="flex-1 bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/10 font-mono text-[11px] text-zinc-200 overflow-auto leading-relaxed">
                <code>{getGeneratedCode()}</code>
              </pre>
            </div>
          )}
        </GlassPanel>

        {/* Right: Response Inspector & Waterfall (6 Cols) */}
        <GlassPanel className="p-4 lg:col-span-6 flex flex-col h-[520px] overflow-hidden">
          {/* Response Header Info */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-300 font-bold">RESPONSE</span>
              {response && (
                <Badge variant={response.status >= 200 && response.status < 300 ? 'healthy' : 'error'}>
                  {response.status} {response.statusText}
                </Badge>
              )}
            </div>

            {response?.timing && (
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-zinc-200">{formatLatency(response.timing.totalDurationMs)}</span>
                <span className="text-slate-400">{formatBytes(response.sizeBytes)}</span>
              </div>
            )}
          </div>

          {/* Response Tabs */}
          <div className="flex items-center gap-1 mb-3 font-mono text-xs">
            {(['pretty', 'raw', 'headers', 'timing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRespTab(tab)}
                className={`px-2.5 py-1 rounded capitalize ${
                  activeRespTab === tab
                    ? 'bg-white/10 text-zinc-200 font-bold border border-white/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'timing' ? 'Timing Waterfall' : tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Pretty JSON Tree */}
          {activeRespTab === 'pretty' && (
            <pre className="flex-1 overflow-auto bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/5 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {response ? JSON.stringify(response.data, null, 2) : '// Click Send to execute request through secure proxy'}
            </pre>
          )}

          {/* Tab 2: Raw Text */}
          {activeRespTab === 'raw' && (
            <pre className="flex-1 overflow-auto bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {response ? (typeof response.data === 'string' ? response.data : JSON.stringify(response.data)) : '// No data'}
            </pre>
          )}

          {/* Tab 3: Response Headers */}
          {activeRespTab === 'headers' && (
            <div className="flex-1 overflow-auto bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/5 font-mono text-xs space-y-1.5">
              {response?.headers ? (
                Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-zinc-200">{k}:</span>
                    <span className="text-slate-300 truncate max-w-xs">{String(v)}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">// No headers received</div>
              )}
            </div>
          )}

          {/* Tab 4: Timing Waterfall */}
          {activeRespTab === 'timing' && (
            <div className="flex-1 bg-white/[0.06] backdrop-blur-xl p-4 rounded-lg border border-white/5 space-y-3 font-mono text-xs overflow-y-auto">
              <div className="text-xs font-bold text-zinc-200 mb-2">Request Lifecycle Waterfall</div>

              {response?.timing ? (
                <div className="space-y-3">
                  {[
                    { label: 'DNS Lookup', time: response.timing.dnsLookupMs, color: 'bg-blue-400' },
                    { label: 'TCP Handshake', time: response.timing.tcpHandshakeMs, color: 'bg-white/20' },
                    { label: 'TLS Negotiation', time: response.timing.tlsNegotiationMs, color: 'bg-purple-400' },
                    { label: 'Time to First Byte (TTFB)', time: response.timing.timeToFirstByteMs, color: 'bg-white/20' },
                    { label: 'Content Download', time: response.timing.contentDownloadMs, color: 'bg-amber-400' }
                  ].map((stage, idx) => {
                    const pct = Math.max(8, Math.min(100, (stage.time / response.timing.totalDurationMs) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>{stage.label}</span>
                          <span className="text-white font-bold">{stage.time} ms</span>
                        </div>
                        <div className="w-full bg-white/[0.08] backdrop-blur-xl h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${stage.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-zinc-200 font-bold">
                    <span>Total Roundtrip Duration:</span>
                    <span>{response.timing.totalDurationMs} ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">// Run a request to inspect timing breakdown</div>
              )}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
