'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Clean text for speech synthesis: extract a natural executive conversational summary
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // If text contains markdown code blocks, extract before the code block or provide a crisp vocal summary
  if (cleaned.includes('```')) {
    const parts = cleaned.split('```');
    const intro = parts[0].trim();
    if (intro.length > 20) {
      cleaned = intro + '. The complete implementation is displayed on your console.';
    } else {
      cleaned = 'I have generated the requested implementation. The complete code is available on your console.';
    }
  }

  cleaned = cleaned
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
    .replace(/\s+/g, ' ')
    .trim();

  // Keep vocal output to a natural conversational length (first 1-2 complete sentences, max ~260 chars)
  if (cleaned.length > 260) {
    const sentenceEnd = cleaned.indexOf('.', 120);
    if (sentenceEnd !== -1 && sentenceEnd < 280) {
      cleaned = cleaned.slice(0, sentenceEnd + 1);
    } else {
      const spaceIdx = cleaned.lastIndexOf(' ', 240);
      if (spaceIdx !== -1) {
        cleaned = cleaned.slice(0, spaceIdx) + '.';
      }
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
  const capturedTextRef = useRef('');
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Audio recording state for robust fallback
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isProcessingBackendTranscribe = useRef(false);

  // Setup High-Quality Voice (Prioritize 100% LOCAL OS voices so they never fail on network)
  const setupVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    synthRef.current = window.speechSynthesis;

    const findVoice = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (!voices.length) return;

      // Priority list: First look for reliable LOCAL voices (Microsoft Zira, David, Samantha, etc.)
      const preferred = [
        voices.find((v) => v.localService && (v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Aria'))),
        voices.find((v) => v.name.includes('Zira')),
        voices.find((v) => v.localService && v.name.toLowerCase().includes('samantha')),
        voices.find((v) => v.name.includes('Google UK English Female')),
        voices.find((v) => v.localService && v.lang.startsWith('en')),
        voices.find((v) => v.lang === 'en-US'),
        voices.find((v) => v.lang.startsWith('en'))
      ].filter(Boolean);

      if (preferred.length > 0) {
        selectedVoiceRef.current = preferred[0] as SpeechSynthesisVoice;
      }
    };

    findVoice();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = findVoice;
    }
  }, []);

  useEffect(() => {
    setupVoice();
  }, [setupVoice]);

  // Transcribe recorded audio chunks using backend Gemini Flash audio API
  const sendAudioToBackend = useCallback(async () => {
    if (isProcessingBackendTranscribe.current) return;

    // If speech recognition already provided captured speech, prioritize it!
    const captured = capturedTextRef.current.trim();
    if (captured.length > 1) {
      if (onCommand) onCommand(captured);
      return;
    }

    if (audioChunksRef.current.length === 0) return;

    try {
      isProcessingBackendTranscribe.current = true;
      setInterimTranscript('Processing neural voice...');

      // Concatenate Float32 chunks
      let totalLength = 0;
      for (const chunk of audioChunksRef.current) {
        totalLength += chunk.length;
      }

      if (totalLength < 3000) {
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
        reader.onloadend = () => resolve(reader.result as string);
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
          capturedTextRef.current = text;
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

    // If we have text from Web Speech API right now, invoke command immediately
    const textNow = capturedTextRef.current.trim();
    if (textNow.length > 1) {
      if (onCommand) onCommand(textNow);
      cleanupAudioHardware();
    } else {
      // Otherwise send audio buffer to backend Gemini transcriber
      sendAudioToBackend().finally(() => {
        cleanupAudioHardware();
      });
    }
  }, [sendAudioToBackend, cleanupAudioHardware, onCommand]);

  // Start Voice Command (Speech Recognition + Parallel Audio Recording)
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Prime speech synthesis on user interaction so subsequent voice replies are never blocked
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        const primer = new SpeechSynthesisUtterance(' ');
        primer.volume = 0.01;
        window.speechSynthesis.speak(primer);
      } catch {}
    }

    // Stop speaking if TTS is active
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');
    capturedTextRef.current = '';
    audioChunksRef.current = [];
    isSessionActiveRef.current = true;
    setIsListening(true);

    // 1. Initialize Microphone Audio Stream (100% resilient across all browsers)
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
      const processor = actx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isSessionActiveRef.current) return;
        const channelData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(channelData));

        // Real-time audio volume level for visual pulsation
        let sum = 0;
        for (let i = 0; i < channelData.length; i += 8) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / (channelData.length / 8));
        const normalized = Math.min(1.0, rms * 6);
        setAudioLevel(Math.max(0.15, normalized));
      };

      source.connect(processor);
      processor.connect(actx.destination);
    } catch (err: any) {
      console.warn('Microphone stream access error:', err);
      setVoiceError('Microphone permission blocked. Please allow microphone access in your browser address bar.');
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
            const fullText = (capturedTextRef.current + ' ' + currentFinal).trim();
            capturedTextRef.current = fullText;
            setTranscript(fullText);
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
                const fullText = (capturedTextRef.current + ' ' + currentInterim).trim();
                capturedTextRef.current = fullText;
                stopListening();
              }
            }, 2000);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission denied.');
          }
        };

        recognition.onend = () => {
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
      console.log('SpeechRecognition unavailable; relying on audio recorder');
    }
  }, [stopListening]);

  // Speak Reply (Robust, Zero-Fail Voice Synthesis)
  const speak = useCallback(
    (rawText: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!rawText || !rawText.trim()) return;

      const clean = cleanTextForSpeech(rawText);
      if (!clean) return;

      try {
        const synth = window.speechSynthesis;

        // 1. Resume synth if paused
        if (synth.paused) {
          synth.resume();
        }

        // 2. Only cancel if actively speaking previous utterance
        if (synth.speaking) {
          synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-US';
        utterance.volume = 1.0;
        utterance.rate = 1.02;
        utterance.pitch = 1.06;

        // 3. Select local voice if available
        if (selectedVoiceRef.current) {
          utterance.voice = selectedVoiceRef.current;
        } else {
          const voices = synth.getVoices();
          if (voices && voices.length > 0) {
            const match =
              voices.find((v) => v.localService && (v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Aria'))) ||
              voices.find((v) => v.name.includes('Zira')) ||
              voices.find((v) => v.localService && v.lang.startsWith('en')) ||
              voices.find((v) => v.lang.startsWith('en'));
            if (match) utterance.voice = match;
          }
        }

        // 4. Retain window reference to prevent garbage collection mid-speech
        (window as any).__ultronUtterance = utterance;

        let synthInterval: any = null;

        utterance.onstart = () => {
          setIsSpeaking(true);
          synthInterval = setInterval(() => {
            setAudioLevel(0.35 + Math.random() * 0.45);
          }, 80);
        };

        const handleFinish = () => {
          setIsSpeaking(false);
          clearInterval(synthInterval);
          setAudioLevel(0);
          (window as any).__ultronUtterance = null;
        };

        utterance.onend = handleFinish;

        utterance.onerror = (e) => {
          console.warn('Utterance error:', e);
          handleFinish();
          // Fallback: If voice failed because of a specific voice object, retry once with system default voice
          if (utterance.voice) {
            try {
              const fallback = new SpeechSynthesisUtterance(clean);
              fallback.lang = 'en-US';
              fallback.volume = 1.0;
              (window as any).__ultronUtterance = fallback;
              synth.speak(fallback);
            } catch {}
          }
        };

        // 5. Speak!
        synth.speak(utterance);

        // Keep-alive timer for Chrome speech synthesis
        const keepAlive = setInterval(() => {
          if (!synth.speaking) {
            clearInterval(keepAlive);
          } else if (synth.paused) {
            synth.resume();
          }
        }, 3000);
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
