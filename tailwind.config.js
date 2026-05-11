// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',                          // toggle via class (default dark theme)
  theme: {
    extend: {
      // NEXUS 2030 custom colours mapped to CSS variables
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        'neon-cyan': 'var(--neon-cyan)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },

      // Typography
      fontFamily: {
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        body: ['Inter', ...defaultTheme.fontFamily.sans],
      },

      // Border radius for cinematic cards
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // Spacing extras for immersive layouts
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '120': '30rem',
      },

      // Backdrop blur values (glassmorphism)
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '20px',
      },

      // Custom box shadows (glow effects + glass card)
      boxShadow: {
        'glow-primary': '0 0 12px 4px rgba(108, 92, 231, 0.4)',
        'glow-secondary': '0 0 12px 4px rgba(0, 242, 254, 0.4)',
        'glow-accent': '0 0 12px 4px rgba(255, 71, 133, 0.4)',
        'card-glass': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
      },

      // Keyframes for custom animations
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px var(--primary)' },
          '50%': { boxShadow: '0 0 20px var(--primary), 0 0 40px var(--secondary)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'confetti-burst': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.5) rotate(15deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(30deg)', opacity: '0' },
        },
        'neon-breathe': {
          '0%, 100%': {
            textShadow: '0 0 4px var(--primary), 0 0 8px var(--primary)',
            opacity: '0.9',
          },
          '50%': {
            textShadow: '0 0 12px var(--secondary), 0 0 24px var(--neon-cyan)',
            opacity: '1',
          },
        },
      },

      // Animation classes using the keyframes above
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'confetti-burst': 'confetti-burst 0.6s ease-out forwards',
        'neon-breathe': 'neon-breathe 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};