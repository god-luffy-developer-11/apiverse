import React from 'react';

interface BadgeProps {
  variant?: 'healthy' | 'warning' | 'error' | 'neutral' | 'nebula' | 'crimson' | 'white';
  children: React.ReactNode;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  pulse = false,
  children
}) => {
  // Translucent optical glass pills in Pure Black & White Glass UI
  const styles = {
    crimson: 'bg-white/15 text-white border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
    white: 'bg-white/20 text-white border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]',
    healthy: 'bg-white/10 text-white border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]',
    warning: 'bg-white/10 text-zinc-200 border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]',
    error: 'bg-white/15 text-white border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
    neutral: 'bg-white/[0.08] text-zinc-200 border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    nebula: 'bg-white/10 text-white border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border backdrop-blur-2xl select-none ${styles}`}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      )}
      <span>{children}</span>
    </span>
  );
};
