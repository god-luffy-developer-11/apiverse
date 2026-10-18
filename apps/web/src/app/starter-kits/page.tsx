'use client';

import React, { useState } from 'react';
import { GlassPanel, Badge, SpaceButton } from '@apiverse/ui';
import { Boxes, Download, Check, FileCode, Folder, Copy, Code2, Sparkles, Layers } from 'lucide-react';
import { UIUX_MEDIA } from '@/lib/uiux-assets';
import { LiquidGlassVideoCard } from '@/components/ui/LiquidGlassVideoCard';

interface FileDefinition {
  name: string;
  path: string;
  getContent: (cfg: { name: string; stack: string; apis: string[] }) => string;
}

export default function StarterKitsPage() {
  const [projectName, setProjectName] = useState('apiverse-production-app');
  const [stack, setStack] = useState<'nextjs' | 'fastapi' | 'express' | 'go'>('nextjs');
  const [selectedApis, setSelectedApis] = useState<string[]>(['stripe', 'openai', 'supabase']);
  const [activeFile, setActiveFile] = useState<string>('README.md');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleApi = (api: string) => {
    if (selectedApis.includes(api)) {
      setSelectedApis(selectedApis.filter((x) => x !== api));
    } else {
      setSelectedApis([...selectedApis, api]);
    }
  };

  const getFileContent = (filename: string) => {
    if (filename === 'README.md') {
      return `# ${projectName}
Engineered by APIVerse Starter Kit Generator

## Architecture Topology
- Framework: ${stack.toUpperCase()}
- Active API Integrations: ${selectedApis.join(', ')}
- Zero-Trust Secret Management: Configured for AES-256-GCM Vault

## Rapid Launch Sequence
\`\`\`bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local

# 3. Boot local dev server
pnpm dev
\`\`\`
`;
    }
    if (filename === '.env.example') {
      return `# ${projectName} Environment Variables
PORT=3000
NODE_ENV=development
${selectedApis.map((a) => `${a.toUpperCase()}_API_KEY=your_${a}_key_here\n${a.toUpperCase()}_WEBHOOK_SECRET=whsec_${a}_example`).join('\n')}
`;
    }
    if (filename === 'Dockerfile') {
      return `FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
`;
    }
    if (filename === 'docker-compose.yml') {
      return `version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    environment:
      - NODE_ENV=production
`;
    }
    if (filename === 'index.ts' || filename === 'main.py') {
      if (stack === 'fastapi') {
        return `from fastapi import FastAPI
app = FastAPI(title="${projectName}")

@app.get("/health")
def health():
    return {"status": "HEALTHY", "apis": [${selectedApis.map((a) => `"${a}"`).join(', ')}]}
`;
      }
      return `// ${projectName} Master Service Entrypoint
import { createServer } from 'http';

console.log('Booting ${projectName} with APIs: ${selectedApis.join(', ')}');
`;
    }
    if (filename.endsWith('.client.ts')) {
      const api = filename.replace('.client.ts', '');
      return `// Autonomous client wrapper for ${api.toUpperCase()}
export class ${api.charAt(0).toUpperCase() + api.slice(1)}Client {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.${api.toUpperCase()}_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Missing ${api.toUpperCase()}_API_KEY in environment');
    }
  }

  async verifyHandshake(): Promise<boolean> {
    console.log('Executing live telemetry ping to ${api}...');
    return true;
  }
}

export const ${api}Client = new ${api.charAt(0).toUpperCase() + api.slice(1)}Client();
`;
    }
    return '// File preview ready.';
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/starter-kit/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          stack,
          selected_apis: selectedApis,
          include_docker: true,
          include_auth: true
        })
      });
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_starter.zip`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyFile = () => {
    navigator.clipboard.writeText(getFileContent(activeFile));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Boxes className="w-6 h-6 text-zinc-200" />
          <span>PRODUCTION STARTER KIT GENERATOR</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Export fully typed scaffolding, Docker configs, and API clients as a downloadable ZIP package
        </p>
      </div>

      {/* UIUX Architecture Preview Video Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.starterKitStream1}
          title="Full-Stack Starter Kit Scaffolding: Next.js + Stripe Subscriptions"
          badge="ARCHITECTURE PREVIEW"
          category="PRODUCTION READY"
          glow="cyan"
        />
        <LiquidGlassVideoCard
          src={UIUX_MEDIA.starterKitStream2}
          title="Microservices Template: FastAPI + pgvector + Gemini RAG"
          badge="CONTAINERIZED STACK"
          category="PRODUCTION READY"
          glow="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (5 Cols) */}
        <GlassPanel className="p-5 lg:col-span-5 space-y-5">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2">Target Framework Stack</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'nextjs', label: 'Next.js 14 App Router' },
                { id: 'fastapi', label: 'FastAPI Python 3.11' },
                { id: 'express', label: 'Express TypeScript' },
                { id: 'go', label: 'Go Gin Engine' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStack(s.id as any)}
                  className={`p-3 rounded-lg border text-xs font-mono text-left transition-all ${
                    stack === s.id
                      ? 'bg-white/10 border-cyan-400 text-zinc-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2">Select Integrated APIs</label>
            <div className="grid grid-cols-2 gap-2">
              {['stripe', 'openai', 'supabase', 'twilio', 'resend', 'github'].map((api) => {
                const active = selectedApis.includes(api);
                return (
                  <button
                    key={api}
                    onClick={() => toggleApi(api)}
                    className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
                      active
                        ? 'bg-white/10 border-purple-400 text-zinc-200'
                        : 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="capitalize">{api}</span>
                    {active && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                  </button>
                );
              })}
            </div>
          </div>

          <SpaceButton
            variant="primary"
            size="lg"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full mt-4"
          >
            {isDownloading ? 'Packaging Archive...' : `Download ${projectName}.zip`}
          </SpaceButton>
        </GlassPanel>

        {/* Right: Live File Tree & Code Editor Split (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* File Tree (4 Cols) */}
          <GlassPanel glow="cyan" className="p-4 sm:col-span-5 font-mono text-xs space-y-1">
            <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-zinc-200" />
              <span>Project Structure</span>
            </div>

            <div className="text-zinc-200 font-bold flex items-center gap-1.5 pb-1">
              <Folder className="w-3.5 h-3.5 text-zinc-200" />
              <span>{projectName}/</span>
            </div>

            {['README.md', '.env.example', 'Dockerfile', 'docker-compose.yml'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFile(f)}
                className={`w-full text-left pl-4 py-1 rounded flex items-center gap-1.5 text-xs transition-colors ${
                  activeFile === f ? 'bg-white/10 text-zinc-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3 h-3 text-slate-500" />
                <span>{f}</span>
              </button>
            ))}

            <div className="text-zinc-200 pl-4 flex items-center gap-1.5 pt-1">
              <Folder className="w-3 h-3 text-zinc-200" />
              <span>src/</span>
            </div>

            <button
              onClick={() => setActiveFile(stack === 'fastapi' ? 'main.py' : 'index.ts')}
              className={`w-full text-left pl-8 py-1 rounded flex items-center gap-1.5 text-xs transition-colors ${
                activeFile === (stack === 'fastapi' ? 'main.py' : 'index.ts')
                  ? 'bg-white/10 text-zinc-200 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3 h-3 text-slate-500" />
              <span>{stack === 'fastapi' ? 'main.py' : 'index.ts'}</span>
            </button>

            {selectedApis.map((api) => {
              const filename = `${api}.client.ts`;
              return (
                <button
                  key={api}
                  onClick={() => setActiveFile(filename)}
                  className={`w-full text-left pl-8 py-1 rounded flex items-center gap-1.5 text-xs transition-colors ${
                    activeFile === filename
                      ? 'bg-white/10 text-zinc-200 font-bold'
                      : 'text-zinc-200/80 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="w-3 h-3 text-zinc-200" />
                  <span>{filename}</span>
                </button>
              );
            })}
          </GlassPanel>

          {/* Code Preview Panel (7 Cols) */}
          <GlassPanel className="p-4 sm:col-span-7 flex flex-col h-[420px] overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="font-mono text-xs text-zinc-200 font-bold flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-zinc-200" />
                {activeFile}
              </span>
              <button
                onClick={copyFile}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy File"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="flex-1 bg-white/[0.06] backdrop-blur-xl p-3 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300 overflow-auto leading-relaxed">
              <code>{getFileContent(activeFile)}</code>
            </pre>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
