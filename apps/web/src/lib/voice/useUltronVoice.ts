'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Procedural high-tech sound generator using Web Audio API
class UltronAudioEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Soft futuristic startup chime (like JARVIS powering up)
  playWake() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554.37, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {}
  }

  // Listening active beep
  playListening() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Recognized & processing command chime
  playAcknowledge() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const freqs = [587.33, 739.99, 880.0]; // D5, F#5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch {}
  }
}

export const ultronAudio = new UltronAudioEffects();

// Clean text for speech synthesis so JARVIS doesn't pronounce markdown symbols
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/```[\s\S]*?```/g, ' Code synthesis provided below in console. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/[-*]\s+/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/\n\s*\n/g, '. ')
    .replace(/\n/g, ' ')
    .trim();

  // If the text is very long, summarize beginning for voice so it doesn't drone on forever
  if (cleaned.length > 380) {
    const sentenceEnd = cleaned.indexOf('.', 280);
    if (sentenceEnd !== -1 && sentenceEnd < 450) {
      cleaned = cleaned.slice(0, sentenceEnd + 1) + ' I have rendered the full technical breakdown on your console, sir.';
    }
  }

  return cleaned;
}

export interface UseUltronVoiceOptions {
  onCommand?: (command: string) => void;
  autoSpeak?: boolean;
}

export function useUltronVoice({ onCommand, autoSpeak = true }: UseUltronVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 to 1.0 for core pulsation
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const listeningPulseInterval = useRef<any>(null);
  const silenceTimer = useRef<any>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const accumulatedSpeechRef = useRef<string>('');

  // Load voices and pick the best British / Deep AI voice (JARVIS style)
  const setupVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    synthRef.current = window.speechSynthesis;

    const findJarvisVoice = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (!voices.length) return;

      // Priority list: Sophisticated British / Deep English male voices
      const preferred = [
        voices.find((v) => v.name.includes('Google UK English Male')),
        voices.find((v) => v.name.includes('en-GB') && v.name.toLowerCase().includes('male')),
        voices.find((v) => v.name.toLowerCase().includes('daniel')),
        voices.find((v) => v.name.toLowerCase().includes('george')),
        voices.find((v) => v.name.toLowerCase().includes('arthur')),
        voices.find((v) => v.name.toLowerCase().includes('oliver')),
        voices.find((v) => v.name.includes('en-GB')),
        voices.find((v) => v.name.toLowerCase().includes('natural')),
        voices.find((v) => v.lang === 'en-GB'),
        voices.find((v) => v.lang.startsWith('en'))
      ].filter(Boolean);

      if (preferred.length > 0) {
        selectedVoiceRef.current = preferred[0] as SpeechSynthesisVoice;
      }
    };

    findJarvisVoice();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = findJarvisVoice;
    }
  }, []);

  useEffect(() => {
    setupVoice();
  }, [setupVoice]);

  // Start Voice Command (Speech Recognition)
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Brave.');
      alert('Speech Recognition is supported in Chrome, Edge, and Brave browsers.');
      return;
    }

    setVoiceError(null);

    // Stop speaking if currently replying
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    // Stop existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Stay listening until silence or user pause
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      accumulatedSpeechRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        ultronAudio.playListening();

        // Pulsate audio level realistically while microphone is active
        clearInterval(listeningPulseInterval.current);
        listeningPulseInterval.current = setInterval(() => {
          setAudioLevel(0.25 + Math.random() * 0.45);
        }, 90);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          accumulatedSpeechRef.current += (accumulatedSpeechRef.current ? ' ' : '') + currentFinal.trim();
          setTranscript(accumulatedSpeechRef.current);
          setInterimTranscript('');

          // Reset silence timer on every new speech chunk
          clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => {
            // After 1.2s of silence following final text, auto-submit!
            if (accumulatedSpeechRef.current.trim()) {
              const fullCommand = accumulatedSpeechRef.current.trim();
              ultronAudio.playAcknowledge();
              stopListening();
              if (onCommand) {
                onCommand(fullCommand);
              }
            }
          }, 1200);
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          // Boost audio level visually during active speech
          setAudioLevel(0.6 + Math.random() * 0.35);

          // Reset silence timer
          clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => {
            // If user stopped speaking interim text for 2.2s, treat as complete
            const captured = (accumulatedSpeechRef.current + ' ' + currentInterim).trim();
            if (captured) {
              ultronAudio.playAcknowledge();
              setTranscript(captured);
              setInterimTranscript('');
              stopListening();
              if (onCommand) {
                onCommand(captured);
              }
            }
          }, 2200);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please allow microphone in browser settings.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice input: ${event.error}`);
        }
        if (event.error !== 'no-speech') {
          setIsListening(false);
          clearInterval(listeningPulseInterval.current);
          setAudioLevel(0);
        }
      };

      recognition.onend = () => {
        // If we captured accumulated speech and ended, dispatch it
        if (accumulatedSpeechRef.current.trim() && isListening) {
          const captured = accumulatedSpeechRef.current.trim();
          ultronAudio.playAcknowledge();
          if (onCommand) {
            onCommand(captured);
          }
        }
        setIsListening(false);
        clearInterval(listeningPulseInterval.current);
        setAudioLevel(0);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setVoiceError(e?.message || 'Could not access speech recognition');
      setIsListening(false);
      clearInterval(listeningPulseInterval.current);
      setAudioLevel(0);
    }
  }, [onCommand]);

  // Stop Listening
  const stopListening = useCallback(() => {
    clearTimeout(silenceTimer.current);
    clearInterval(listeningPulseInterval.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Speak Reply (JARVIS Text-to-Speech)
  const speak = useCallback(
    (rawText: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!synthRef.current) synthRef.current = window.speechSynthesis;

      synthRef.current.cancel();

      const cleaned = cleanTextForSpeech(rawText);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      // JARVIS Speech tuning: Calm, measured, articulate
      utterance.pitch = 0.92;
      utterance.rate = 1.05;
      utterance.volume = 1.0;

      // Simulate audio harmonics during speaking for core visualizer
      let synthInterval: any = null;

      utterance.onstart = () => {
        setIsSpeaking(true);
        synthInterval = setInterval(() => {
          setAudioLevel(0.35 + Math.random() * 0.45);
        }, 80);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        clearInterval(synthInterval);
        setAudioLevel(0);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        clearInterval(synthInterval);
        setAudioLevel(0);
      };

      synthRef.current.speak(utterance);
    },
    [voiceEnabled]
  );

  // Stop Speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  // Toggle voice mute
  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      if (prev && synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(silenceTimer.current);
      clearInterval(listeningPulseInterval.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
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
  };
}
