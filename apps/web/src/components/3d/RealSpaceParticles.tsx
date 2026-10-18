'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  speedX: number;
  speedY: number;
  depth: number;
  color: string;
  twinkleSpeed: number;
  phase: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  color: string;
}

export const RealSpaceParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle Palette: Stark White, Titanium Silver, Crimson Ruby, Ember Red
    const colors = [
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#f1f5f9',
      '#ff3355',
      'rgba(255,255,255,0.8)',
      '#cbd5e1',
      '#e2e8f0'
    ];

    const particleCount = Math.min(280, Math.floor((width * height) / 4500));
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const depth = Math.random() * 0.8 + 0.2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 * depth + 0.4,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.25 * depth,
        speedY: (Math.random() - 0.5) * 0.25 * depth,
        depth,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2
      };
    });

    // Cosmic Meteors / Shooting Stars
    const meteors: Meteor[] = [];
    const maybeSpawnMeteor = () => {
      if (meteors.length < 2 && Math.random() < 0.015) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.5),
          length: Math.random() * 120 + 80,
          speed: Math.random() * 12 + 10,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2, // ~45 degrees diagonal
          alpha: 1,
          color: Math.random() > 0.4 ? '#ffffff' : 'rgba(255,255,255,0.8)'
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Render & Update Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cosmic Drift
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interactive Mouse Gravitational Deflection
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        let renderX = p.x;
        let renderY = p.y;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 14 * p.depth;
          renderX -= (dx / dist) * force;
          renderY -= (dy / dist) * force;
        }

        // Twinkle Alpha
        p.phase += p.twinkleSpeed;
        const currentAlpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));

        // Draw particle
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        if (p.size > 1.4) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.color.includes('ff') ? 8 : 4;
        }

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Meteors / Shooting Stars
      maybeSpawnMeteor();
      for (let m = meteors.length - 1; m >= 0; m--) {
        const meteor = meteors[m];
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha -= 0.018;

        if (meteor.alpha <= 0 || meteor.x > width + 200 || meteor.y > height + 200) {
          meteors.splice(m, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = meteor.alpha;
        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, meteor.color === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)');
        grad.addColorStop(1, meteor.color);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.shadowColor = meteor.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();

        // White incandescent tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
