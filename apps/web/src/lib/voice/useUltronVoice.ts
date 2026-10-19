'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Procedural high-tech sound generator using Web Audio API
class UltronAudioEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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
  }

  // Soft futuristic startup chime (like JARVIS powering up)
  playWake() {
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
  }

  // Listening active beep
  playListening() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Recognized & processing command chime
  playAcknowledge() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = [587.33, 739.99, 880.0]; // D5, F#5, A5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }
}

export const ultronAudio = new UltronAudioEffects();

// Clean text for speech synthesis so JARVIS doesn't pronounce markdown symbols
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/```[\s\S]*?```/g, ' [Code synthesis provided below in console] ') // don't read full raw code blocks
    .replace(/`([^`]+)`/g, '$1') // remove single backticks
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
    .replace(/\*([^*]+)\*/g, '$1') // remove italics
    .replace(/#+\s+/g, '') // remove markdown headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // convert markdown links to text
    .replace(/\|/g, ' ') // remove table pipes
    .replace(/[-*]\s+/g, '') // remove bullet marks
    .replace(/https?:\/\/\S+/g, 'link') // replace raw urls
    .replace(/\n\s*\n/g, '. ') // double newlines to period
    .replace(/\n/g, ' ') // single newlines to space
    .trim();

  // If the text is very long (e.g. 500+ words), summarize beginning for voice so it doesn't drone on forever
  if (cleaned.length > 450) {
    const sentenceEnd = cleaned.indexOf('.', 350);
    if (sentenceEnd !== -1 && sentenceEnd < 550) {
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

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

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

  // Audio level analyzer during listening
  const startAudioAnalyzer = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const pollVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          setAudioLevel(avg);
          animFrameRef.current = requestAnimationFrame(pollVolume);
        };
        pollVolume();
      }
    } catch {
      // Microphone access denied or not available; fallback to silent simulation
    }
  };

  const stopAudioAnalyzer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Voice Command (Speech Recognition)
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Brave.');
      return;
    }

    // Stop speaking if currently replying
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        ultronAudio.playListening();
        startAudioAnalyzer();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimTranscript('');
          ultronAudio.playAcknowledge();
          if (onCommand) {
            onCommand(finalTranscript);
          }
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioAnalyzer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioAnalyzer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      stopAudioAnalyzer();
    }
  }, [onCommand]);

  // Stop Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    stopAudioAnalyzer();
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopAudioAnalyzer();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceEnabled,
    transcript,
    interimTranscript,
    audioLevel,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice
  };
}
