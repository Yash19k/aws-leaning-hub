import type { Config } from 'tailwindcss';

/** Theme surfaces come from CSS variables (see src/styles/index.css) so dark mode is one class swap. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        line: v('border'),
        ink: v('text'),
        muted: v('text-muted'),
        // AWS-inspired orange. 500 is #FF9900; use 700 for text on light backgrounds (AA).
        brand: {
          50: '#FFF7EB',
          100: '#FFEBC7',
          200: '#FFD68A',
          300: '#FFC04D',
          400: '#FFAD24',
          500: '#FF9900',
          600: '#C96F00',
          700: '#B45F06',
          800: '#8A4808',
          900: '#5C3106',
        },
        navy: {
          50: '#EEF2F9',
          100: '#D8E0EF',
          200: '#AFC0DE',
          300: '#7F98C6',
          400: '#5573AB',
          500: '#3A5690',
          600: '#2B4273',
          700: '#213459',
          800: '#172540',
          900: '#0F1B2D',
          950: '#090F1C',
        },
        // The fresh accent.
        teal: {
          50: '#EDFCF9',
          100: '#D2F7F0',
          200: '#A6EEE2',
          300: '#6EDFCF',
          400: '#34C8B6',
          500: '#14B09F',
          600: '#0C8E82',
          700: '#0D7169',
          800: '#105A55',
          900: '#124A46',
        },
        // One colour per AWS service category, used everywhere (chips, nodes, cards).
        cat: {
          storage: '#1F9D55',
          compute: '#E8830C',
          database: '#3B6FE0',
          networking: '#8B5CF6',
          security: '#E5484D',
          management: '#D6409F',
          integration: '#0E9CC9',
          frontend: '#5F9E10',
          actor: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        display: ['clamp(2.25rem, 5.5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 27 45 / 0.06), 0 4px 16px -4px rgb(15 27 45 / 0.08)',
        lift: '0 2px 4px rgb(15 27 45 / 0.06), 0 16px 32px -12px rgb(15 27 45 / 0.22)',
        glow: '0 0 0 4px rgb(255 153 0 / 0.25), 0 0 24px rgb(255 153 0 / 0.45)',
        'glow-teal': '0 0 0 4px rgb(20 176 159 / 0.25), 0 0 24px rgb(20 176 159 / 0.4)',
      },
      maxWidth: {
        content: '72rem',
        prose: '46rem',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgb(255 153 0 / 0.55)' },
          '70%': { boxShadow: '0 0 0 12px rgb(255 153 0 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(255 153 0 / 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'page-in': 'page-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
