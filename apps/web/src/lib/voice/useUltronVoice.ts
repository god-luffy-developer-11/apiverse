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
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 to 1.0 for core visual pulsation
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const listeningPulseInterval = useRef<any>(null);
  const silenceTimer = useRef<any>(null);
  const isSessionActiveRef = useRef(false);
  const accumulatedSpeechRef = useRef('');
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Setup High-Quality FEMALE AI Voice (FRIDAY / Samantha / Jarvis-Female style)
  const setupFemaleVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    synthRef.current = window.speechSynthesis;

    const findFemaleVoice = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (!voices.length) return;

      // Priority list: Sophisticated Female English voices
      const preferred = [
        voices.find((v) => v.name.includes('Google UK English Female')),
        voices.find((v) => v.name.includes('Google US English') && !v.name.toLowerCase().includes('male')),
        voices.find((v) => v.name.includes('Zira')), // Windows built-in high quality female
        voices.find((v) => v.name.includes('Jenny')), // Windows 11 Natural female
        voices.find((v) => v.name.includes('Aria')), // Windows 11 Natural female
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

  // Internal function to create and bind recognition instance
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Brave.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // continuous: false is the most stable and compatible mode across all Chromium browsers
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);

        // Visual harmonic pulsation while listening
        clearInterval(listeningPulseInterval.current);
        listeningPulseInterval.current = setInterval(() => {
          setAudioLevel(0.25 + Math.random() * 0.4);
        }, 100);
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
          setAudioLevel(0.8);

          // Clear previous timer
          clearTimeout(silenceTimer.current);

          // Auto-submit after 1 second of pause
          silenceTimer.current = setTimeout(() => {
            const captured = accumulatedSpeechRef.current.trim();
            if (captured) {
              isSessionActiveRef.current = false;
              stopListening();
              if (onCommand) {
                onCommand(captured);
              }
            }
          }, 1000);
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          setAudioLevel(0.55 + Math.random() * 0.35);

          clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => {
            const captured = (accumulatedSpeechRef.current + ' ' + currentInterim).trim();
            if (captured) {
              isSessionActiveRef.current = false;
              setTranscript(captured);
              setInterimTranscript('');
              stopListening();
              if (onCommand) {
                onCommand(captured);
              }
            }
          }, 2000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone access blocked. Please allow microphone permission in your browser address bar.');
          isSessionActiveRef.current = false;
          setIsListening(false);
          clearInterval(listeningPulseInterval.current);
          setAudioLevel(0);
        } else if (event.error === 'network') {
          setVoiceError('Network error connecting to speech recognition server.');
        }
      };

      recognition.onend = () => {
        // If session is still active (e.g. Chrome finished a segment or had brief no-speech), restart listening!
        if (isSessionActiveRef.current) {
          try {
            setTimeout(() => {
              if (isSessionActiveRef.current && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch {
            // Already started or busy
          }
        } else {
          setIsListening(false);
          clearInterval(listeningPulseInterval.current);
          setAudioLevel(0);
        }
      };

      return recognition;
    } catch (e: any) {
      console.error('Failed to init speech recognition:', e);
      setVoiceError(e?.message || 'Speech recognition initialization failed');
      return null;
    }
  }, [onCommand]);

  // Start Voice Command (Speech Recognition)
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // First stop any speaking TTS
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    isSessionActiveRef.current = true;

    // Check / request mic permission explicitly so browser won't abruptly abort
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release dummy stream
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Mic permission error:', err);
      setVoiceError('Microphone permission denied. Please allow microphone access in browser.');
      isSessionActiveRef.current = false;
      setIsListening(false);
      return;
    }

    // Stop existing instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const rec = initRecognition();
    if (!rec) {
      isSessionActiveRef.current = false;
      return;
    }

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch (err) {
      console.warn('SpeechRecognition start err:', err);
      try {
        setTimeout(() => rec.start(), 150);
      } catch {}
    }
  }, [initRecognition]);

  // Stop Listening
  const stopListening = useCallback(() => {
    isSessionActiveRef.current = false;
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

  // Speak Reply (FEMALE AI Persona Voice)
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

      // Female AI Voice Tuning: Smooth, warm, intelligent (FRIDAY / Samantha style)
      utterance.pitch = 1.08; // slightly higher feminine pitch
      utterance.rate = 1.02; // crisp natural conversational speed
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
      isSessionActiveRef.current = false;
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
