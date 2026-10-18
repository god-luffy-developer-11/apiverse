import React from 'react';

interface SpaceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ultron' | 'success' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const SpaceButton: React.FC<SpaceButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5'
  }[size];

  // Optical Transparent Liquid Glass Capsules in Pure Black & White Glass UI
  const variantClasses = {
    // 1. Primary: Translucent White Refractive Optical Glass Capsule
    primary:
      'bg-white/[0.12] hover:bg-white/[0.22] ' +
      'text-white hover:text-white ' +
      'border border-white/40 hover:border-white/90 ' +
      'shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(0,0,0,0.4),0_8px_25px_rgba(0,0,0,0.5)] ' +
      'hover:shadow-[inset_0_2px_1px_0_rgba(255,255,255,0.95),0_12px_32px_rgba(255,255,255,0.15)] ' +
      'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',

    // 2. Secondary: Crystal Clear Glass Pill with Specular Bevel
    secondary:
      'bg-white/[0.06] hover:bg-white/[0.14] ' +
      'text-zinc-200 hover:text-white ' +
      'border border-white/20 hover:border-white/50 ' +
      'shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.5),inset_0_-1px_1px_0_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)] ' +
      'hover:shadow-[inset_0_2px_1px_0_rgba(255,255,255,0.8),0_12px_28px_rgba(0,0,0,0.5)] ' +
      'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',

    // 3. Ultron: Obsidian Glass Optical Capsule
    ultron:
      'bg-black/60 hover:bg-black/80 ' +
      'text-white hover:text-white ' +
      'border border-white/30 hover:border-white/80 ' +
      'shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(0,0,0,0.6)] ' +
      'hover:shadow-[inset_0_2px_1px_0_rgba(255,255,255,0.9),0_14px_40px_rgba(255,255,255,0.12)] ' +
      'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',

    // 4. Success: Monochromatic White Bevel Pill
    success:
      'bg-white/[0.15] hover:bg-white/[0.25] ' +
      'text-white ' +
      'border border-white/50 hover:border-white ' +
      'shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.7),0_8px_22px_rgba(0,0,0,0.4)] ' +
      'active:scale-[0.97]',

    // 5. Ghost: Pure Transparent Crystal Rim
    ghost:
      'bg-transparent hover:bg-white/[0.08] ' +
      'text-zinc-300 hover:text-white ' +
      'border border-white/15 hover:border-white/40 ' +
      'shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)] ' +
      'active:scale-[0.97]',

    // 6. Danger: High-Contrast Monochromatic Stark Pill
    danger:
      'bg-white/[0.08] hover:bg-white/[0.18] ' +
      'text-white ' +
      'border border-white/35 hover:border-white/80 ' +
      'shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.65),0_8px_20px_rgba(0,0,0,0.4)] ' +
      'active:scale-[0.97]'
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 cursor-pointer backdrop-blur-2xl relative overflow-hidden select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {/* Upper optical specular sheen reflection */}
      <span className="absolute top-0 left-2 right-2 h-[45%] bg-gradient-to-b from-white/[0.35] via-white/[0.08] to-transparent rounded-t-full pointer-events-none" />
      
      {/* Fluid gleam shimmer sweep animation */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      {icon && <span className="shrink-0 relative z-10">{icon}</span>}
      <span className="relative z-10 tracking-wide font-sans">{children}</span>
    </button>
  );
};
