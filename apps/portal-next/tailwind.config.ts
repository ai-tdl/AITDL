// ॥ ॐ श्री गणेशाय नमः ॥ · AITDL Portal · tailwind.config.ts
// Organization: AITDL — AI Technology Development Lab
// Creator: Jawahar R. Mallah · Copyright © aitdl.com
// Typography System V2 — Ancient Wisdom. Modern Precision.

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {

      // ── Font Families ────────────────────────────────────────────────────
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        impact:  ['Bebas Neue', 'Arial Narrow', 'sans-serif'],
        sans:    ['Noto Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
        label:   ['Space Grotesk', 'Helvetica Neue', 'sans-serif'],
        mono:    ['Space Mono', 'Courier New', 'monospace'],
        deva:    ['Noto Sans Devanagari', 'Noto Sans', 'sans-serif'],
        // Legacy aliases — keep for backward compat
        heading: ['Bebas Neue', 'sans-serif'],
        body:    ['Noto Sans', 'sans-serif'],
      },

      // ── Font Sizes — fluid type scale ────────────────────────────────────
      fontSize: {
        'hero':    ['clamp(4rem, 12vw, 10rem)',   { lineHeight: '1.0',  letterSpacing: '0.04em' }],
        'tagline': ['clamp(1.1rem, 2.5vw, 1.75rem)', { lineHeight: '1.3', letterSpacing: '0.25em' }],
        'h1':      ['clamp(2.5rem, 6vw, 5rem)',   { lineHeight: '1.1',  letterSpacing: '0.02em' }],
        'h2':      ['clamp(2rem, 4vw, 3.5rem)',   { lineHeight: '1.15', letterSpacing: '0.02em' }],
        'h3':      ['clamp(1.4rem, 2.5vw, 2rem)', { lineHeight: '1.2',  letterSpacing: '0.03em' }],
        'h4':      ['clamp(1.1rem, 1.8vw, 1.4rem)', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        'label':   ['clamp(0.65rem, 1vw, 0.75rem)', { lineHeight: '1.0', letterSpacing: '0.18em' }],
        'body':    ['1rem',                        { lineHeight: '1.75', letterSpacing: '0' }],
        'small':   ['0.875rem',                    { lineHeight: '1.7',  letterSpacing: '0' }],
        'meta':    ['0.6875rem',                   { lineHeight: '1.5',  letterSpacing: '0.04em' }],
      },

      // ── Colours ──────────────────────────────────────────────────────────
      colors: {
        bg: {
          DEFAULT: '#06070e',
          deep:    '#03040a',
          card:    '#0a0c16',
          glass:   'rgba(10,12,22,0.7)',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E8C96A',
          dim:     '#8A6E2E',
          glow:    'rgba(201,168,76,0.15)',
        },
        text: {
          hero:     '#FFFFFF',
          primary:  '#F5F2EC',
          secondary:'#EDE9E0',
          card:     '#E0DBD0',
          body:     '#B0A898',
          muted:    '#746C60',
          disabled: '#3D3A35',
        },
        // Section accent colours
        retail:    '#FF6B1A',
        erp:       '#1A8FFF',
        education: '#22C565',
        ai:        '#A259FF',
        partner:   '#39E07A',
        ngo:       '#0EB8A0',
        lef:       '#F5A623',
        ecom:      '#6C63FF',
        home:      '#FF4D6A',
      },

      // ── Letter Spacing ────────────────────────────────────────────────────
      letterSpacing: {
        hero:    '0.04em',
        heading: '0.02em',
        label:   '0.18em',
        wide:    '0.08em',
        wider:   '0.12em',
        widest:  '0.25em',
      },

      // ── Line Heights ──────────────────────────────────────────────────────
      lineHeight: {
        tight:   '1.0',
        heading: '1.15',
        subhead: '1.3',
        body:    '1.75',
        relaxed: '1.9',
      },

      // ── Border Colours ────────────────────────────────────────────────────
      borderColor: {
        gold:    'rgba(201,168,76,0.12)',
        subtle:  'rgba(255,255,255,0.05)',
        card:    'rgba(255,255,255,0.08)',
      },

    },
  },

  plugins: [
    // Devanagari language variants
    ({ addVariant }: { addVariant: Function }) => {
      addVariant('hi', '&:lang(hi)')
      addVariant('sa', '&:lang(sa)')
      addVariant('en', '&:lang(en)')
    },
  ],
}

export default config
