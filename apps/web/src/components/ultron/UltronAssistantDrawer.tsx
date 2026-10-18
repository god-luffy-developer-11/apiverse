'use client';

import React, { useState } from 'react';
import { SpaceButton } from '@apiverse/ui';
import { Atom, Send, X, Sparkles, ChevronRight, Terminal } from 'lucide-react';
import { ModelProvider } from '@/lib/types';

export const UltronAssistantDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [model, setModel] = useState<ModelProvider>('GEMINI');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am Ultron, powered by top-tier intelligence (Gemini 3.8, GPT-4o, and Claude 3.5). How can I help you today with coding, APIs, architecture, or any questions?'
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userPrompt = input;
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: userPrompt }];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ultron/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          model,
          context_keys: ['Stripe', 'OpenAI'],
          messages_history: updatedMessages.slice(-10),
          include_playground_history: true
        })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

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
              assistantMsg += token;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', text: assistantMsg };
                return copy;
              });
            }
          }
        }
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'I encountered an error connecting to the intelligence server. Please ensure the backend is running.' }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Singularity Beacon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-cursor="ultron"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/[0.1] hover:bg-white/[0.2] border border-white/40 p-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 select-none backdrop-blur-2xl"
        title="Open Ultron AI Assistant"
      >
        <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-white/10 animate-ping rounded-full pointer-events-none" />
          <Atom className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '16s' }} />
        </div>
      </button>

      {/* Ultron Chat Drawer - Properly docked on the right side */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-black/40 border border-white/25 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1.5px_1px_0_rgba(255,255,255,0.7)] backdrop-blur-3xl flex flex-col overflow-hidden">
          {/* Live Background Video */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover opacity-35 scale-105 grayscale contrast-125"
            >
              <source src="/live-wallpapers/bg-ultron-chat.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
          </div>

          {/* Header */}
          <div className="p-4 border-b border-white/20 bg-white/[0.04] backdrop-blur-2xl flex items-center justify-between relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-md">
                <Atom className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white tracking-wider">ULTRON SINGULARITY</div>
                <div className="text-[10px] font-mono text-zinc-300">Glass Event Horizon • Black & White</div>
              </div>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelProvider)}
                className="bg-black/60 backdrop-blur-md border border-white/25 rounded-xl px-2.5 py-1 text-[10px] font-mono text-white outline-none focus:border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                <option value="GEMINI" className="bg-black text-white">Gemini 3.8 (Live)</option>
                <option value="OPENAI" className="bg-black text-white">OpenAI GPT-4o</option>
                <option value="ANTHROPIC" className="bg-black text-white">Claude 3.5</option>
              </select>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all ${
                  m.role === 'user'
                    ? 'ml-8 bg-white/[0.12] border-white/30 text-white shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.3)]'
                    : 'mr-6 bg-white/[0.04] border-white/20 text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1.5px_1px_0_rgba(255,255,255,0.3)]'
                }`}
              >
                <div className="text-[9px] font-mono mb-1 font-bold tracking-wider text-zinc-400">
                  {m.role === 'user' ? 'YOU' : 'ULTRON AI'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3.5 border-t border-white/20 bg-black/40 backdrop-blur-2xl flex items-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything (code, debugging, concepts, writing)..."
              className="flex-1 bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-400 outline-none focus:border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-40 border border-white/40 text-white flex items-center justify-center transition-all shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.7),0_4px_16px_rgba(0,0,0,0.4)] shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
