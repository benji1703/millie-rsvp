import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        parchment: '#F0EBE0',
        blush: '#E8C5C8',
        sage: '#A8BBA8',
        charcoal: {
          DEFAULT: '#1A1A1A',
          hover: '#2d2d2d',
        },
        gold: '#C2A87A',
      },
      fontFamily: {
        serif: ['"Noto Serif Hebrew"', '"Frank Ruhl Libre"', 'serif'],
        sans: ['Heebo', 'Assistant', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up-d1': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both',
        'fade-up-d2': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both',
        'fade-up-d3': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.19s both',
        'fade-up-d4': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.26s both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        paper: '0 1px 3px rgba(26,26,26,0.04), 0 4px 16px rgba(26,26,26,0.04), 0 0 0 1px rgba(184,168,138,0.06)',
        card: '0 2px 4px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.05), 0 32px 80px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}

export default config
