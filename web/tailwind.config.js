/** @type {import('tailwindcss').Config} */
// Reflex design tokens — see DESIGN.md for the full system.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — deep charcoal ramp
        ink: {
          950: '#07080a', // page background
          900: '#0a0c0f', // sunken sections
          850: '#0e1116', // card surface
          800: '#12161d', // raised card
          700: '#1a202a', // hover / inset
          600: '#262e3b', // strong border
        },
        line: 'rgba(235, 242, 235, 0.08)',
        // Brand accent — electric lime, used sparingly
        volt: {
          200: '#efffb8',
          300: '#e2ff7a',
          400: '#cff94d',
          500: '#b8e62e',
          600: '#92c418',
        },
        // Secondary signal — reactive cyan (network / in-flight states)
        pulse: {
          300: '#a5f3fc',
          400: '#67e8f9',
          500: '#22d3ee',
        },
        // Semantic
        rose: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
        },
        // Text ramp
        mist: {
          100: '#f2f5f0', // primary text
          200: '#d7dcd4',
          300: '#b7beb4',
          400: '#939c92', // secondary text
          500: '#68736a', // muted / captions
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'price': ['2.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        card: '1.25rem',
        panel: '1rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.55)',
        glow: '0 0 0 1px rgba(207,249,77,0.35), 0 8px 32px -8px rgba(184,230,46,0.45)',
        pop: '0 16px 40px -12px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1200' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'ping-soft': 'ping-soft 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
