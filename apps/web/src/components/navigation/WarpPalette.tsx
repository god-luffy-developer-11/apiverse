'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Globe,
  KeyRound,
  PlaySquare,
  BarChart3,
  Atom,
  BookOpen,
  Boxes,
  Users,
  Search,
  Sparkles
} from 'lucide-react';

interface WarpPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WarpPalette: React.FC<WarpPaletteProps> = ({ open, onOpenChange }) => {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const warpTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white/[0.08] backdrop-blur-2xl border border-white/25 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.6)] overflow-hidden">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-white/15 gap-3 bg-white/[0.04]">
            <Search className="w-5 h-5 text-white shrink-0" />
            <Command.Input
              placeholder="Warp jump to star system, planet, or command..."
              className="w-full py-4 bg-transparent outline-none text-sm text-white placeholder-zinc-400 font-sans"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-3 space-y-1 bg-transparent">
            <Command.Empty className="p-4 text-xs font-mono text-zinc-400 text-center">
              No celestial coordinates found.
            </Command.Empty>

            <Command.Group heading="Universe Locations" className="text-[10px] font-mono text-zinc-400 px-2 py-1 font-bold uppercase tracking-wider">
              <Command.Item
                onSelect={() => warpTo('/galaxy')}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <Globe className="w-4 h-4 text-white" />
                <span>Galaxy Dashboard (Live Moving Universe)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => warpTo('/vault')}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>API Key Vault (Planets & Zero-Trust Secrets)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => warpTo('/playground')}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <PlaySquare className="w-4 h-4 text-white" />
                <span>API Playground (Postman-Class Runner & SSRF Proxy)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => warpTo('/ultron')}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <Atom className="w-4 h-4 text-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                <span>Ultron Singularity Chamber (Broken Black Hole)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => warpTo('/starter-kits')}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <Boxes className="w-4 h-4 text-white" />
                <span>Starter Kit Generator (Download Full Codebase Zip)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
