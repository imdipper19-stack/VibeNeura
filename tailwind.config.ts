import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Theme-aware tokens (reference CSS custom properties) ── */
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-background)',
        'surface-bright': '#323b3b',
        'surface-container-lowest': '#071010',
        'surface-container-low': 'var(--color-surface)',
        'surface-container': 'var(--color-surface-variant)',
        'surface-container-high': '#232c2b',
        'surface-container-highest': '#2e3636',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'inverse-surface': '#dbe4e3',
        'inverse-on-surface': '#293232',
        outline: '#839493',
        'outline-variant': '#3a4a49',
        'surface-tint': '#00dddd',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary)',
        'on-primary-container': '#007070',
        'inverse-primary': '#006a6a',
        secondary: 'var(--color-secondary)',
        'on-secondary': '#002d6f',
        'secondary-container': '#568dff',
        'on-secondary-container': '#002661',
        tertiary: 'var(--color-tertiary)',
        'on-tertiary': '#4b007e',
        'tertiary-container': '#f1daff',
        'on-tertiary-container': '#9500f2',
        error: 'var(--color-error)',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-surface)',
        'surface-variant': 'var(--color-surface-variant)',
        coral: 'var(--color-coral)',
        abyss: '#000510',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'stack-sm': '4px',
        'stack-md': '12px',
        'stack-lg': '24px',
        gutter: '24px',
        unit: '8px',
        'container-padding': '32px',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      backdropBlur: {
        glass: '20px',
      },
      keyframes: {
        bloom: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        bloom: 'bloom 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
