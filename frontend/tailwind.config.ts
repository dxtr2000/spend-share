import forms from '@tailwindcss/forms'
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#111113',
        foreground: '#F4F4F5',
        card: '#1A1A1E',
        cardSoft: '#222228',
        border: '#2D2D34',
        muted: '#85858F',
        primary: '#6C5CE7',
        primarySoft: '#8B7CF6',
        accent: '#F97316',
        destructive: '#EF4444'
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        glow: '0 18px 45px rgb(108 92 231 / 0.18)',
        panel: '0 18px 80px rgb(0 0 0 / 0.26)'
      }
    }
  },
  plugins: [forms]
} satisfies Config
