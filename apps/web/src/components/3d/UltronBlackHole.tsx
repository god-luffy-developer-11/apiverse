'use client';

import React, { useEffect, useRef } from 'react';
import { UltronState } from '@/lib/types';

interface UltronBlackHoleProps {
  state?: UltronState;
  onSingularityClick?: () => void;
  className?: string;
  size?: number;
  audioLevel?: number; // 0.0 to 1.0 from voice recognition or TTS
  isSpeaking?: boolean;
  isListening?: boolean;
}

export const UltronBlackHole: React.FC<UltronBlackHoleProps> = ({
  state = 'idle',
  onSingularityClick,
  className = '',
  size = 400,
  audioLevel = 0,
  isSpeaking = false,
  isListening = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const audioRef = useRef(0);

  // Keep smoothed audio level
  useEffect(() => {
    audioRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = Math.max(-1, Math.min(1, x));
      mouseRef.current.targetY = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display support
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    let time = 0;
    let smoothedAudio = 0;

    // Smoothed motion tracker state
    const trackerPos = { x: 0, y: 0 };

    // Synaptic electrical sparks
    interface Spark {
      angle: number;
      dist: number;
      length: number;
      opacity: number;
      speed: number;
    }
    const sparks: Spark[] = Array.from({ length: 24 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.6 + Math.random() * 0.4,
      length: 8 + Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.8,
      speed: 0.02 + Math.random() * 0.04
    }));

    const render = () => {
      // Fluid spring interpolation for mouse coordinates
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const targetAudio = Math.max(audioRef.current, isSpeaking ? 0.35 + Math.sin(time * 12) * 0.25 : isListening ? 0.25 + Math.sin(time * 8) * 0.15 : 0);
      smoothedAudio += (targetAudio - smoothedAudio) * 0.15;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const speedFactor =
        state === 'thinking' ? 0.038 : state === 'streaming' || isSpeaking ? 0.032 : state === 'listening' || isListening ? 0.024 : 0.014;
      time += speedFactor;

      const w = size;
      const h = size;
      ctx.clearRect(0, 0, w, h);

      // Center with dynamic organic floating & responsive perspective tilt
      const sphereCenterX = w / 2 + mx * 14 + Math.sin(time * 0.8) * 2;
      const sphereCenterY = h / 2 - my * 14 + Math.cos(time * 0.7) * 2;
      const radius = Math.min(w, h) * 0.32;

      // -------------------------------------------------------------
      // 1. Holographic HUD Concentric Tech Rings (JARVIS Arc Core)
      // -------------------------------------------------------------
      ctx.save();
      const ringColor = isSpeaking
        ? 'rgba(0, 240, 255, '
        : isListening
        ? 'rgba(56, 189, 248, '
        : state === 'thinking'
        ? 'rgba(239, 68, 68, '
        : 'rgba(255, 255, 255, ';

      // Outer segment ring
      const outerRingR = radius * (1.35 + smoothedAudio * 0.12);
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, outerRingR, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor + '0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating dashed HUD ring 1 (clockwise)
      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(time * 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor + '0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 12]);
      ctx.stroke();

      // Tech tick-marks around circumference
      for (let i = 0; i < 36; i++) {
        const a = (i * Math.PI) / 18;
        const tickLen = i % 3 === 0 ? 6 : 3;
        const x1 = Math.cos(a) * (radius * 1.25);
        const y1 = Math.sin(a) * (radius * 1.25);
        const x2 = Math.cos(a) * (radius * 1.25 + tickLen);
        const y2 = Math.sin(a) * (radius * 1.25 + tickLen);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = ringColor + (i % 3 === 0 ? '0.4)' : '0.15)');
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // Rotating dashed HUD ring 2 (counter-clockwise)
      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(-time * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor + '0.3)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([14, 20, 4, 20]);
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 2. Audio-Reactive Frequency Equalizer Waveform Ripples
      // -------------------------------------------------------------
      if (smoothedAudio > 0.05 || isSpeaking || isListening) {
        const waveCount = 48;
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= waveCount; i++) {
          const angle = (i / waveCount) * Math.PI * 2;
          const harmonic = Math.sin(angle * 8 + time * 6) * Math.cos(angle * 4 - time * 4);
          const waveAmp = (smoothedAudio * 24 + 4) * harmonic;
          const dist = radius * 1.08 + waveAmp;
          const px = sphereCenterX + Math.cos(angle) * dist;
          const py = sphereCenterY + Math.sin(angle) * dist;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = isSpeaking ? 'rgba(0, 240, 255, 0.7)' : 'rgba(147, 197, 253, 0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = isSpeaking ? '#00f0ff' : '#60a5fa';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 3. Volumetric Accretion Lensing & Ethereal Glow
      // -------------------------------------------------------------
      const ambientGlow = ctx.createRadialGradient(
        sphereCenterX,
        sphereCenterY,
        radius * 0.6,
        sphereCenterX,
        sphereCenterY,
        radius * (1.6 + smoothedAudio * 0.3)
      );
      if (isSpeaking) {
        ambientGlow.addColorStop(0, 'rgba(0, 220, 255, 0.45)');
        ambientGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.25)');
        ambientGlow.addColorStop(0.7, 'rgba(30, 58, 138, 0.1)');
      } else if (isListening) {
        ambientGlow.addColorStop(0, 'rgba(129, 140, 248, 0.45)');
        ambientGlow.addColorStop(0.35, 'rgba(99, 102, 241, 0.25)');
        ambientGlow.addColorStop(0.7, 'rgba(49, 46, 129, 0.1)');
      } else if (state === 'thinking') {
        ambientGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        ambientGlow.addColorStop(0.35, 'rgba(185, 28, 28, 0.25)');
        ambientGlow.addColorStop(0.7, 'rgba(69, 10, 10, 0.1)');
      } else {
        ambientGlow.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        ambientGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.2)');
        ambientGlow.addColorStop(0.7, 'rgba(59, 130, 246, 0.08)');
      }
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 4. Spherical Singularity Void (Clipped Deep Quantum Core)
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Deep dark void base
      const baseGrad = ctx.createRadialGradient(
        sphereCenterX + mx * 18,
        sphereCenterY - my * 18,
        radius * 0.05,
        sphereCenterX,
        sphereCenterY,
        radius
      );
      baseGrad.addColorStop(0, '#040612');
      baseGrad.addColorStop(0.5, '#020308');
      baseGrad.addColorStop(1, '#000000');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(sphereCenterX - radius, sphereCenterY - radius, radius * 2, radius * 2);

      // Multi-layer volumetric energy swirls (JARVIS Reactor Core)
      const focalX = sphereCenterX + mx * (radius * 0.3);
      const focalY = sphereCenterY - my * (radius * 0.3);

      const colorPalette = isSpeaking
        ? [
            { c1: 'rgba(0, 240, 255, 0.85)', c2: 'rgba(0, 100, 200, 0)' },
            { c1: 'rgba(56, 189, 248, 0.8)', c2: 'rgba(14, 116, 144, 0)' },
            { c1: 'rgba(125, 211, 252, 0.7)', c2: 'rgba(3, 105, 161, 0)' }
          ]
        : isListening
        ? [
            { c1: 'rgba(129, 140, 248, 0.85)', c2: 'rgba(67, 56, 202, 0)' },
            { c1: 'rgba(99, 102, 241, 0.8)', c2: 'rgba(49, 46, 129, 0)' },
            { c1: 'rgba(199, 210, 254, 0.7)', c2: 'rgba(30, 27, 75, 0)' }
          ]
        : state === 'thinking'
        ? [
            { c1: 'rgba(239, 68, 68, 0.85)', c2: 'rgba(153, 27, 27, 0)' },
            { c1: 'rgba(248, 113, 113, 0.8)', c2: 'rgba(127, 29, 29, 0)' },
            { c1: 'rgba(254, 202, 202, 0.7)', c2: 'rgba(69, 10, 10, 0)' }
          ]
        : [
            { c1: 'rgba(168, 85, 247, 0.8)', c2: 'rgba(88, 28, 135, 0)' },
            { c1: 'rgba(59, 130, 246, 0.75)', c2: 'rgba(29, 78, 216, 0)' },
            { c1: 'rgba(236, 72, 153, 0.7)', c2: 'rgba(157, 23, 77, 0)' }
          ];

      colorPalette.forEach((pal, idx) => {
        const layerAngle = time * (1.2 + idx * 0.4) + (idx * Math.PI) / 1.5;
        const lx = focalX + Math.cos(layerAngle) * (radius * 0.28);
        const ly = focalY + Math.sin(layerAngle) * (radius * 0.28);
        const lr = radius * (0.75 + idx * 0.15);

        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        g.addColorStop(0, pal.c1);
        g.addColorStop(0.6, pal.c2);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pure Event Horizon Void Core (Absolute pitch black gravity center)
      const voidX = focalX + mx * 8;
      const voidY = focalY - my * 8;
      const voidR = radius * (0.35 + (1.0 - smoothedAudio * 0.1) * 0.05);

      const voidGrad = ctx.createRadialGradient(voidX, voidY, voidR * 0.2, voidX, voidY, voidR);
      voidGrad.addColorStop(0, '#000000');
      voidGrad.addColorStop(0.85, '#020307');
      voidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(voidX, voidY, voidR, 0, Math.PI * 2);
      ctx.fill();

      // Photon Sphere High-Energy Ring
      ctx.beginPath();
      ctx.arc(voidX, voidY, voidR * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = isSpeaking ? '#00f0ff' : '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = isSpeaking ? '#00f0ff' : '#ffffff';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3D Spherical Volume Convex Shading
      const sphere3DShadow = ctx.createRadialGradient(
        sphereCenterX - mx * (radius * 0.4),
        sphereCenterY + my * (radius * 0.4),
        radius * 0.45,
        sphereCenterX,
        sphereCenterY,
        radius
      );
      sphere3DShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      sphere3DShadow.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      sphere3DShadow.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

      ctx.fillStyle = sphere3DShadow;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Top Specular Highlight
      const specX = sphereCenterX - radius * 0.15 + mx * (radius * 0.35);
      const specY = sphereCenterY - radius * 0.45 - my * (radius * 0.35);
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.35);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      specGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.4)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end clipped sphere path

      // -------------------------------------------------------------
      // 5. Synaptic Plasma Arcs / Reactor Electrical Discharges
      // -------------------------------------------------------------
      ctx.save();
      sparks.forEach((s) => {
        s.angle += s.speed;
        const currentR = radius * s.dist;
        const x1 = sphereCenterX + Math.cos(s.angle) * currentR;
        const y1 = sphereCenterY + Math.sin(s.angle) * currentR;
        const x2 = x1 + Math.cos(s.angle + 0.3) * s.length;
        const y2 = y1 + Math.sin(s.angle + 0.3) * s.length;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isSpeaking
          ? `rgba(0, 240, 255, ${s.opacity * 0.7})`
          : `rgba(255, 255, 255, ${s.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // 6. Holographic Optical Perimeter Rim
      // -------------------------------------------------------------
      ctx.save();
      const rimGrad = ctx.createLinearGradient(
        sphereCenterX - radius,
        sphereCenterY - radius,
        sphereCenterX + radius,
        sphereCenterY + radius
      );
      if (isSpeaking) {
        rimGrad.addColorStop(0, '#00f0ff');
        rimGrad.addColorStop(0.5, '#38bdf8');
        rimGrad.addColorStop(1, '#ffffff');
      } else if (isListening) {
        rimGrad.addColorStop(0, '#818cf8');
        rimGrad.addColorStop(0.5, '#a78bfa');
        rimGrad.addColorStop(1, '#ffffff');
      } else {
        rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        rimGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.8)');
        rimGrad.addColorStop(1, 'rgba(96, 165, 250, 0.85)');
      }

      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = isSpeaking ? '#00f0ff' : 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = isSpeaking ? 20 : 12;
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 7. Motion Tracking Target Reticle
      // -------------------------------------------------------------
      const targetPipX = sphereCenterX - radius * 0.85 + mx * 30;
      const targetPipY = sphereCenterY - radius * 0.75 - my * 30;
      trackerPos.x += (targetPipX - trackerPos.x) * 0.1;
      trackerPos.y += (targetPipY - trackerPos.y) * 0.1;

      ctx.save();
      ctx.beginPath();
      ctx.arc(trackerPos.x, trackerPos.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(trackerPos.x, trackerPos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Tech coordinate text next to reticle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`ULTRON://${(sphereCenterX + mx * 10).toFixed(0)}.${(sphereCenterY + my * 10).toFixed(0)}`, trackerPos.x + 12, trackerPos.y + 3);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [state, isSpeaking, isListening, size]);

  return (
    <div
      onClick={onSingularityClick}
      data-cursor="ultron"
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]"
      />

      {/* Futuristic Pill Status Indicator */}
      <div className="absolute bottom-2 text-center pointer-events-none flex flex-col items-center gap-1.5">
        <span
          className={`text-[10px] font-mono tracking-widest uppercase px-4 py-1 rounded-full border backdrop-blur-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center gap-2 ${
            isSpeaking
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse'
              : isListening
              ? 'bg-blue-950/80 text-blue-300 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse'
              : state === 'thinking'
              ? 'bg-red-950/80 text-red-300 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
              : state === 'streaming'
              ? 'bg-purple-950/80 text-purple-300 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse'
              : 'bg-black/80 text-zinc-300 border-white/20 hover:border-white/50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-blue-400 animate-ping' : state === 'thinking' ? 'bg-red-400' : 'bg-white'}`} />
          <span>
            {isSpeaking ? 'JARVIS VOICE CORE: TRANSMITTING' : isListening ? 'VOICE CMD: LISTENING...' : `ULTRON CORE: ${state.toUpperCase()}`}
          </span>
        </span>

        {/* Live Audio Spectrum Equalizer Indicator */}
        {(isSpeaking || isListening || audioLevel > 0.05) && (
          <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
            {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7, 0.3].map((mult, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-75 ${isSpeaking ? 'bg-cyan-400' : 'bg-blue-400'}`}
                style={{
                  height: `${Math.max(4, Math.min(22, (audioLevel || 0.4) * 24 * mult))}px`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
