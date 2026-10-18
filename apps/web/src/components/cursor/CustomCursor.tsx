'use client';

import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'planet' | 'ultron' | 'text'>('default');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="ultron"]')) {
        setCursorType('ultron');
      } else if (target.closest('[data-cursor="planet"]')) {
        setCursorType('planet');
      } else if (target.closest('button, a, input, select')) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spring smoothing animation loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.25,
        y: prev.y + (targetPos.y - prev.y) * 0.25
      }));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Magnetic Outer Ring: Black, Crimson Red & Stark White */}
      <div
        className={`fixed top-0 left-0 rounded-full border transition-transform duration-100 ease-out flex items-center justify-center ${
          cursorType === 'ultron'
            ? 'w-14 h-14 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/10'
            : cursorType === 'planet'
            ? 'w-10 h-10 border-white/40 shadow-[0_0_16px_rgba(255,255,255,0.3)] bg-black/60'
            : cursorType === 'pointer'
            ? 'w-8 h-8 border-white shadow-[0_0_12px_rgba(255,255,255,0.7)] scale-125'
            : 'w-6 h-6 border-white/40'
        }`}
        style={{
          transform: `translate3d(${pos.x - (cursorType === 'ultron' ? 28 : cursorType === 'planet' ? 20 : cursorType === 'pointer' ? 16 : 12)}px, ${
            pos.y - (cursorType === 'ultron' ? 28 : cursorType === 'planet' ? 20 : cursorType === 'pointer' ? 16 : 12)
          }px, 0)`
        }}
      >
        {cursorType === 'ultron' && (
          <span className="text-[9px] font-mono text-white font-bold tracking-wider">VOID</span>
        )}
        {cursorType === 'planet' && (
          <span className="text-[8px] font-mono text-white font-bold tracking-tighter">ORBIT</span>
        )}
      </div>

      {/* Center Stardust Incandescent Dot */}
      <div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_rgba(255,255,255,0.8)]"
        style={{
          transform: `translate3d(${targetPos.x - 3}px, ${targetPos.y - 3}px, 0)`
        }}
      />
    </div>
  );
};
