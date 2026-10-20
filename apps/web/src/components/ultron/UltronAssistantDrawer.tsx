'use client';

import React, { useState } from 'react';
import { SpaceButton } from '@apiverse/ui';
import {
  Atom,
  Send,
  X,
  Sparkles,
  ChevronRight,
  Terminal,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { ModelProvider } from '@/lib/types';
import { useUltronVoice } from '@/lib/voice/useUltronVoice';
import { useRouter } from 'next/navigation';

export const UltronAssistantDrawer: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [model, setModel] = useState<ModelProvider>('GEMINI');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Good day, sir. I am Ultron, operating on Google Gemini 3.8 and multi-model intelligence. I am equipped with JARVIS voice protocols and full APIVerse telemetry. How may I be of service?'
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Female AI Voice Engine
  const {
    isListening,
    isSpeaking,
    voiceEnabled,
    interimTranscript,
    voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice
  } = useUltronVoice({
    onCommand: (cmd) => {
      setInput(cmd);
      sendMessage(cmd);
    }
  });

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isStreaming) return;

    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(updatedMessages);
    setIsStreaming(true);
    stopSpeaking();

    try {
      const response = await fetch('http://localhost:8000/api/v1/ultron/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
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
      let voiceSummaryToSpeak = '';

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
              if (parsed.action && parsed.action.type === 'NAVIGATE' && parsed.action.path) {
                setTimeout(() => {
                  router.push(parsed.action.path);
                  setIsOpen(false);
                }, 1200);
              }
              if (parsed.voice_summary) {
                voiceSummaryToSpeak = parsed.voice_summary;
              }
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

      // Voice reply
      if (voiceSummaryToSpeak) {
        speak(voiceSummaryToSpeak);
      } else if (assistantMsg && voiceEnabled) {
        speak(assistantMsg);
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
        title="Open Ultron AI Voice Assistant"
      >
        <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-white/10 animate-ping rounded-full pointer-events-none" />
          <Atom className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '16s' }} />
        </div>
      </button>

      {/* Ultron Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-black/50 border border-white/25 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1.5px_1px_0_rgba(255,255,255,0.7)] backdrop-blur-3xl flex flex-col overflow-hidden">
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
                <div className="font-display font-bold text-xs text-white tracking-wider flex items-center gap-1.5">
                  <span>ULTRON CORE</span>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-1.5 rounded">JARVIS VOICE</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-300">
                  {isSpeaking ? 'Vocalizing response...' : isListening ? 'Listening to voice cmd...' : 'Vocal & Neural Ready'}
                </div>
              </div>
            </div>

            {/* Actions & Model Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`p-1.5 rounded-xl border transition-colors ${
                  voiceEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/10 border-white/20 text-zinc-400'
                }`}
                title={voiceEnabled ? 'Voice Reply Enabled' : 'Voice Reply Muted'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelProvider)}
                className="bg-black/60 backdrop-blur-md border border-white/25 rounded-xl px-2 py-1 text-[10px] font-mono text-white outline-none focus:border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                <option value="GEMINI" className="bg-black text-white">Gemini 3.8</option>
                <option value="OPENAI" className="bg-black text-white">GPT-4o</option>
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

          {/* Voice Listening Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-blue-600/30 border-b border-blue-400/40 backdrop-blur-md flex items-center justify-between text-xs font-mono text-blue-200 animate-pulse">
              <div className="flex items-center gap-2 truncate">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                <span className="truncate">{interimTranscript ? `"${interimTranscript}"` : 'Listening, speak your command...'}</span>
              </div>
              <button onClick={stopListening} className="text-[10px] text-white hover:underline shrink-0 ml-2">
                Stop
              </button>
            </div>
          )}

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
                <div className="text-[9px] font-mono mb-1 font-bold tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>{m.role === 'user' ? 'YOU' : 'ULTRON AI'}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => (isSpeaking ? stopSpeaking() : speak(m.text))}
                      className="text-zinc-400 hover:text-white"
                      title="Speak Message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            ))}
          </div>

          {/* Input Bar with Voice Mic Button */}
          <div className="p-3.5 border-t border-white/20 bg-black/50 backdrop-blur-2xl flex items-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_16px_rgba(37,99,235,0.8)] scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-cyan-400'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Command: Tap to speak'}
            >
              {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={isListening ? 'Listening to speech...' : 'Type or speak command...'}
              className="flex-1 bg-white/[0.06] backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-400 outline-none focus:border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
            />

            <button
              onClick={() => sendMessage()}
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
