/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030408',
          900: '#05060f', // Near-black navy primary background
          850: '#090b1a',
          800: '#0f122c',
          700: '#191f42',
          600: '#262e5d'
        },
        nebula: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          electric: '#00f0ff',
          violet: '#c084fc'
        },
        star: {
          gold: '#fbbf24',
          amber: '#f59e0b',
          white: '#f8fafc'
        },
        ultron: {
          void: '#000000',
          singularity: '#12021c',
          crack: '#ec4899',
          energy: '#a855f7',
          cyan: '#22d3ee',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-slow': 'spin 60s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'solar-flare': 'solarFlare 1.8s ease-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        solarFlare: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
