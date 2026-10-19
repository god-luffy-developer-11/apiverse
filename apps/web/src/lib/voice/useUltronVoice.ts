'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Clean text for speech synthesis so female Ultron doesn't pronounce markdown symbols
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

  // If the text is long, summarize beginning for speech so it remains crisp and articulate
  if (cleaned.length > 380) {
    const sentenceEnd = cleaned.indexOf('.', 280);
    if (sentenceEnd !== -1 && sentenceEnd < 450) {
      cleaned = cleaned.slice(0, sentenceEnd + 1) + ' I have rendered the full technical breakdown on your console, sir.';
    }
  }

  return cleaned;
}

// Encode Float32 PCM samples to standard 16-bit Mono WAV Blob
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
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
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 to 1.0 for core visualizer
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimer = useRef<any>(null);
  const isSessionActiveRef = useRef(false);
  const accumulatedSpeechRef = useRef('');
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Audio recording state for robust fallback
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isProcessingBackendTranscribe = useRef(false);

  // Setup High-Quality FEMALE AI Voice (FRIDAY / Samantha / Natural English)
  const setupFemaleVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    synthRef.current = window.speechSynthesis;

    const findFemaleVoice = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (!voices.length) return;

      const preferred = [
        voices.find((v) => v.name.includes('Google UK English Female')),
        voices.find((v) => v.name.includes('Google US English') && !v.name.toLowerCase().includes('male')),
        voices.find((v) => v.name.includes('Zira')),
        voices.find((v) => v.name.includes('Jenny')),
        voices.find((v) => v.name.includes('Aria')),
        voices.find((v) => v.name.includes('Sonia')),
        voices.find((v) => v.name.toLowerCase().includes('female')),
        voices.find((v) => v.name.toLowerCase().includes('samantha')),
        voices.find((v) => v.name.toLowerCase().includes('victoria')),
        voices.find((v) => v.name.toLowerCase().includes('karen')),
        voices.find((v) => v.lang === 'en-GB'),
        voices.find((v) => v.lang.startsWith('en'))
      ].filter(Boolean);

      if (preferred.length > 0) {
        selectedVoiceRef.current = preferred[0] as SpeechSynthesisVoice;
      }
    };

    findFemaleVoice();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = findFemaleVoice;
    }
  }, []);

  useEffect(() => {
    setupFemaleVoice();
  }, [setupFemaleVoice]);

  // Transcribe recorded audio chunks using backend Gemini Flash audio API
  const sendAudioToBackend = useCallback(async () => {
    if (isProcessingBackendTranscribe.current) return;
    if (audioChunksRef.current.length === 0) return;

    // If speech recognition already provided full captured speech, prioritize it!
    if (accumulatedSpeechRef.current.trim().length > 3) {
      const captured = accumulatedSpeechRef.current.trim();
      if (onCommand) onCommand(captured);
      return;
    }

    try {
      isProcessingBackendTranscribe.current = true;
      setInterimTranscript('Processing neural voice with Gemini Flash...');

      // Concatenate Float32 chunks
      let totalLength = 0;
      for (const chunk of audioChunksRef.current) {
        totalLength += chunk.length;
      }

      if (totalLength < 4000) {
        // Less than 0.25 seconds of sound, probably silence
        setInterimTranscript('');
        return;
      }

      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunksRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const sampleRate = audioContextRef.current?.sampleRate || 16000;
      const wavBlob = encodeWAV(merged, sampleRate);

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(wavBlob);
      const dataUrl = await base64Promise;

      const resp = await fetch('http://localhost:8000/api/v1/ultron/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: dataUrl, mime_type: 'audio/wav' })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = (data.transcript || '').trim();
        if (text) {
          setTranscript(text);
          setInterimTranscript('');
          if (onCommand) {
            onCommand(text);
          }
        }
      }
    } catch (err) {
      console.warn('Backend audio transcribe error:', err);
    } finally {
      isProcessingBackendTranscribe.current = false;
      audioChunksRef.current = [];
    }
  }, [onCommand]);

  // Clean up recording stream & audio context
  const cleanupAudioHardware = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Stop Listening cleanly
  const stopListening = useCallback(() => {
    isSessionActiveRef.current = false;
    clearTimeout(silenceTimer.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsListening(false);
    sendAudioToBackend();
    cleanupAudioHardware();
  }, [sendAudioToBackend, cleanupAudioHardware]);

  // Start Voice Command (Speech Recognition + Parallel Audio Recording)
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Stop speaking if TTS is active
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    audioChunksRef.current = [];
    isSessionActiveRef.current = true;
    setIsListening(true);

    // 1. Initialize Microphone Audio Stream (100% resilient across all Chromium browsers)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      audioContextRef.current = actx;

      const source = actx.createMediaStreamSource(stream);
      // Create ScriptProcessor to capture PCM samples
      const processor = actx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isSessionActiveRef.current) return;
        const channelData = e.inputBuffer.getChannelData(0);
        // Save copy of samples
        audioChunksRef.current.push(new Float32Array(channelData));

        // Calculate real-time RMS volume level for UI visualizer
        let sum = 0;
        for (let i = 0; i < channelData.length; i += 8) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / (channelData.length / 8));
        const normalized = Math.min(1.0, rms * 6);
        setAudioLevel(Math.max(0.12, normalized));
      };

      source.connect(processor);
      processor.connect(actx.destination);
    } catch (err: any) {
      console.warn('Microphone stream access error:', err);
      setVoiceError('Microphone permission blocked. Please allow microphone in your browser address bar.');
      setIsListening(false);
      isSessionActiveRef.current = false;
      return;
    }

    // 2. Initialize Web Speech API for fast real-time interim preview
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

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

            clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
              if (isSessionActiveRef.current) {
                stopListening();
              }
            }, 1200);
          } else if (currentInterim) {
            setInterimTranscript(currentInterim);
            clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
              if (isSessionActiveRef.current) {
                accumulatedSpeechRef.current = (accumulatedSpeechRef.current + ' ' + currentInterim).trim();
                stopListening();
              }
            }, 2200);
          }
        };

        recognition.onerror = (event: any) => {
          // If browser throws 'network' or 'no-speech', do NOT show scary error or abort!
          // The background audio recorder captures the voice and transcribes via Gemini Flash!
          if (event.error === 'network') {
            console.log('Web Speech API network fallback active (audio recorder transcribes via Gemini)');
          } else if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission denied.');
          }
        };

        recognition.onend = () => {
          // If still recording audio and user is speaking, keep audio capture running
          if (isSessionActiveRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (e) {
      console.log('SpeechRecognition unavailable; relying on Gemini audio transcribe');
    }
  }, [stopListening]);

  // Speak Reply (FEMALE AI Voice)
  const speak = useCallback(
    (rawText: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!rawText) return;

      const clean = cleanTextForSpeech(rawText);
      if (!clean) return;

      try {
        if (!synthRef.current) {
          synthRef.current = window.speechSynthesis;
        }

        // Cancel existing utterance
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(clean);
        if (selectedVoiceRef.current) {
          utterance.voice = selectedVoiceRef.current;
        }

        // Female AI Voice Tuning: articulate, smooth, intelligent
        utterance.pitch = 1.08;
        utterance.rate = 1.02;
        utterance.volume = 1.0;

        let synthInterval: any = null;

        utterance.onstart = () => {
          setIsSpeaking(true);
          synthInterval = setInterval(() => {
            setAudioLevel(0.3 + Math.random() * 0.45);
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
      } catch (err) {
        console.error('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [voiceEnabled]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setAudioLevel(0);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next && synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isSessionActiveRef.current = false;
      clearTimeout(silenceTimer.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      cleanupAudioHardware();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [cleanupAudioHardware]);

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
