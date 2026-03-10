// || ॐ श्री गणेशाय नमः || · AITDL Portal · tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#09090b',  // zinc-950 — main bg
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#a1a1aa',
            a: { color: '#a78bfa', '&:hover': { color: '#c4b5fd' } },
            h1: { color: '#fafafa', fontFamily: 'Syne, sans-serif' },
            h2: { color: '#fafafa', fontFamily: 'Syne, sans-serif' },
            h3: { color: '#fafafa', fontFamily: 'Syne, sans-serif' },
            code: { color: '#e879f9', background: 'rgba(232,121,249,0.1)', padding: '0.2em 0.4em', borderRadius: '0.25rem' },
            'code::before': { content: 'none' },
            'code::after':  { content: 'none' },
            pre: { background: '#18181b', border: '1px solid rgba(255,255,255,0.06)' },
            blockquote: { color: '#a1a1aa', borderLeftColor: '#7c3aed' },
            hr: { borderColor: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
