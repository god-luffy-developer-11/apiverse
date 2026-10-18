'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UltronState } from '@/lib/types';

interface UltronBlackHoleProps {
  state?: UltronState;
  onSingularityClick?: () => void;
  className?: string;
  size?: number;
}

export const UltronBlackHole: React.FC<UltronBlackHoleProps> = ({
  state = 'idle',
  onSingularityClick,
  className = '',
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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

    let animId: number;
    let time = 0;

    // Smoothed motion tracker state
    const trackerPos = { x: 0, y: 0 };

    const render = () => {
      // Fluid spring interpolation for mouse coordinates
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const speedFactor =
        state === 'thinking' ? 0.038 : state === 'streaming' ? 0.028 : state === 'listening' ? 0.02 : 0.012;
      time += speedFactor;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Center with dynamic organic floating & responsive perspective tilt
      const sphereCenterX = w / 2 + mx * 18 + Math.sin(time * 0.8) * 3;
      const sphereCenterY = h / 2 - my * 18 + Math.cos(time * 0.7) * 3;
      const radius = Math.min(w, h) * 0.36;

      // -------------------------------------------------------------
      // 1. Motion Tracking Pip Target (upper-left tracking cursor focus)
      // -------------------------------------------------------------
      // Target tracks with cursor offset and smooth dampening
      const targetPipX = sphereCenterX - radius * 0.85 + mx * 35;
      const targetPipY = sphereCenterY - radius * 0.75 - my * 35;
      trackerPos.x += (targetPipX - trackerPos.x) * 0.1;
      trackerPos.y += (targetPipY - trackerPos.y) * 0.1;

      ctx.save();
      // Outer translucent tracking reticle
      ctx.beginPath();
      ctx.arc(trackerPos.x, trackerPos.y, 8.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner solid pip
      ctx.beginPath();
      ctx.arc(trackerPos.x, trackerPos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Subtle dashed tracker ray connecting reticle to sphere surface
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(trackerPos.x + 8, trackerPos.y + 8);
      ctx.lineTo(sphereCenterX - radius * 0.5, sphereCenterY - radius * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // -------------------------------------------------------------
      // 2. Soft Outer Ambient Ethereal Glow
      // -------------------------------------------------------------
      const ambientGlow = ctx.createRadialGradient(
        sphereCenterX,
        sphereCenterY,
        radius * 0.7,
        sphereCenterX,
        sphereCenterY,
        radius * 1.55
      );
      ambientGlow.addColorStop(0, 'rgba(100, 110, 240, 0.22)');
      ambientGlow.addColorStop(0.35, 'rgba(170, 90, 220, 0.14)');
      ambientGlow.addColorStop(0.7, 'rgba(40, 60, 180, 0.05)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 3. Spherical Orb Clipping Path for 3D Shading & Internal Nebula
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Deep dark violet-indigo void base
      const baseGrad = ctx.createRadialGradient(
        sphereCenterX + mx * 20,
        sphereCenterY - my * 20,
        radius * 0.1,
        sphereCenterX,
        sphereCenterY,
        radius
      );
      baseGrad.addColorStop(0, '#0a0d26');
      baseGrad.addColorStop(0.5, '#070818');
      baseGrad.addColorStop(0.85, '#04050d');
      baseGrad.addColorStop(1, '#020206');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(sphereCenterX - radius, sphereCenterY - radius, radius * 2, radius * 2);

      // -------------------------------------------------------------
      // 4. Volumetric Fluid / Internal Chromatic Waves (Blue, Violet, Magenta)
      // -------------------------------------------------------------
      // Responsive refraction focal center shifting with mouse tilt
      const focalX = sphereCenterX + mx * (radius * 0.35);
      const focalY = sphereCenterY - my * (radius * 0.35);

      // Swirling organic chromatic caustic layers
      const layers = [
        {
          color1: 'rgba(65, 120, 255, 0.85)',
          color2: 'rgba(25, 45, 180, 0)',
          ox: -0.22,
          oy: -0.28,
          r: radius * 0.9,
          phase: time * 1.2
        },
        {
          color1: 'rgba(235, 100, 210, 0.8)',
          color2: 'rgba(180, 40, 160, 0)',
          ox: 0.1,
          oy: -0.25,
          r: radius * 0.75,
          phase: time * 1.4 + 1.2
        },
        {
          color1: 'rgba(90, 80, 230, 0.75)',
          color2: 'rgba(40, 30, 150, 0)',
          ox: -0.15,
          oy: 0.15,
          r: radius * 0.85,
          phase: time * 0.9 + 2.4
        },
        {
          color1: 'rgba(255, 140, 210, 0.65)',
          color2: 'rgba(200, 80, 160, 0)',
          ox: 0.22,
          oy: 0.1,
          r: radius * 0.65,
          phase: time * 1.1 + 3.8
        }
      ];

      layers.forEach((layer) => {
        const lx = focalX + (layer.ox * radius) + Math.cos(layer.phase) * (radius * 0.15);
        const ly = focalY + (layer.oy * radius) + Math.sin(layer.phase) * (radius * 0.15);

        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, layer.r);
        g.addColorStop(0, layer.color1);
        g.addColorStop(0.55, layer.color2);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(lx, ly, layer.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central deep iridescent swirl (matching reference: bright magenta/blue crescent bridge)
      const crescentX = focalX - radius * 0.05 + Math.sin(time) * 10;
      const crescentY = focalY - radius * 0.08 + Math.cos(time) * 10;
      const crescentGrad = ctx.createRadialGradient(
        crescentX,
        crescentY,
        radius * 0.15,
        crescentX,
        crescentY,
        radius * 0.65
      );
      crescentGrad.addColorStop(0, 'rgba(240, 130, 220, 0.9)');
      crescentGrad.addColorStop(0.35, 'rgba(120, 90, 240, 0.8)');
      crescentGrad.addColorStop(0.7, 'rgba(30, 70, 210, 0.4)');
      crescentGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = crescentGrad;
      ctx.beginPath();
      ctx.ellipse(
        crescentX,
        crescentY,
        radius * 0.55,
        radius * 0.35,
        -0.45 + mx * 0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Dark gravitational center well (absorptive internal core)
      const coreWellX = focalX - radius * 0.15 + mx * 10;
      const coreWellY = focalY + radius * 0.15 - my * 10;
      const coreGrad = ctx.createRadialGradient(
        coreWellX,
        coreWellY,
        0,
        coreWellX,
        coreWellY,
        radius * 0.45
      );
      coreGrad.addColorStop(0, '#060714');
      coreGrad.addColorStop(0.65, '#04050d');
      coreGrad.addColorStop(1, 'rgba(5, 7, 18, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreWellX, coreWellY, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 5. 3D Spherical Volume Shading & Glass Fresnel Edge Refraction
      // -------------------------------------------------------------
      // Inner shadow for convex 3D sphere curvature
      const sphere3DShadow = ctx.createRadialGradient(
        sphereCenterX - mx * (radius * 0.4),
        sphereCenterY + my * (radius * 0.4),
        radius * 0.4,
        sphereCenterX,
        sphereCenterY,
        radius
      );
      sphere3DShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      sphere3DShadow.addColorStop(0.75, 'rgba(0, 0, 0, 0.45)');
      sphere3DShadow.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

      ctx.fillStyle = sphere3DShadow;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Top-edge chromatic specular highlight
      const specX = sphereCenterX - radius * 0.15 + mx * (radius * 0.4);
      const specY = sphereCenterY - radius * 0.45 - my * (radius * 0.4);
      const specGrad = ctx.createRadialGradient(
        specX,
        specY,
        0,
        specX,
        specY,
        radius * 0.4
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      specGrad.addColorStop(0.25, 'rgba(210, 225, 255, 0.35)');
      specGrad.addColorStop(0.7, 'rgba(180, 160, 255, 0.08)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end clipped sphere path

      // -------------------------------------------------------------
      // 6. Pearlescent Fresnel Edge Rim (Pristine Iridescent Glass Perimeter)
      // -------------------------------------------------------------
      ctx.save();
      // Outer iridescent border glow
      const rimGrad = ctx.createLinearGradient(
        sphereCenterX - radius,
        sphereCenterY - radius,
        sphereCenterX + radius,
        sphereCenterY + radius
      );
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      rimGrad.addColorStop(0.25, 'rgba(190, 215, 255, 0.85)');
      rimGrad.addColorStop(0.65, 'rgba(230, 185, 245, 0.8)');
      rimGrad.addColorStop(1, 'rgba(160, 190, 255, 0.6)');

      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(215, 225, 255, 0.75)';
      ctx.shadowBlur = 16;
      ctx.stroke();

      // Secondary fine inner rim ring for physical glass meniscus depth
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, radius - 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [state]);

  return (
    <div
      onClick={onSingularityClick}
      data-cursor="ultron"
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]"
      />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span
          className={`text-[10px] font-mono tracking-widest uppercase px-3.5 py-1 rounded-full border backdrop-blur-xl transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] ${
            state === 'thinking'
              ? 'bg-[#2a0409]/90 text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse'
              : state === 'streaming'
              ? 'bg-[#3b060d]/90 text-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse'
              : state === 'listening'
              ? 'bg-[#180306]/90 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : state === 'error'
              ? 'bg-white/10 text-white border-white/40'
              : state === 'success'
              ? 'bg-white/10 text-white border-emerald-500'
              : 'bg-black/80 text-zinc-300 border-white/20 hover:border-white/50'
          }`}
        >
          SINGULARITY: {state.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
