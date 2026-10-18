import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'crimson' | 'white' | 'obsidian' | 'cyan' | 'purple' | 'gold' | 'danger' | 'none';
  variant?: 'subtle' | 'standard' | 'heavy' | 'liquid';
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  glow = 'none',
  variant = 'standard',
  className = '',
  children,
  ...props
}) => {
  // Pure Monochromatic Liquid Glass Refractive Rim Borders & Highlights
  const glowClasses = {
    none:
      'border-white/20 hover:border-white/40 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.45),inset_0_-1px_1px_0_rgba(255,255,255,0.06),0_16px_45px_rgba(0,0,0,0.35)]',
    crimson:
      'border-white/35 hover:border-white/70 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(255,255,255,0.1),0_16px_45px_rgba(0,0,0,0.45)]',
    white:
      'border-white/40 hover:border-white/80 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.85),inset_0_-1px_1px_0_rgba(255,255,255,0.15),0_16px_45px_rgba(255,255,255,0.2),0_4px_20px_rgba(0,0,0,0.5)]',
    obsidian:
      'border-white/20 hover:border-white/40 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.45),0_20px_50px_rgba(0,0,0,0.5)]',
    cyan:
      'border-white/30 hover:border-white/60 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.65),0_14px_40px_rgba(0,0,0,0.4)]',
    purple:
      'border-white/30 hover:border-white/60 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.65),0_14px_40px_rgba(0,0,0,0.4)]',
    gold:
      'border-white/35 hover:border-white/70 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),0_14px_40px_rgba(0,0,0,0.4)]',
    danger:
      'border-white/40 hover:border-white/80 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.75),0_16px_45px_rgba(0,0,0,0.5)]'
  }[glow];

  // Completely transparent crystal-clear glass background (Pure Black, White, Clear Glass)
  const bgClasses = {
    subtle: 'bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl',
    standard: 'bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-2xl',
    heavy: 'bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-3xl',
    liquid: 'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl'
  }[variant];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden ${bgClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {/* Upper optical specular sheen reflection */}
      <div className="absolute top-0 left-0 right-0 h-[38%] bg-gradient-to-b from-white/[0.18] via-white/[0.03] to-transparent pointer-events-none rounded-t-2xl" />

      {/* Monochromatic specular corner highlights */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none rounded-br-2xl" />

      {/* Relative content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
