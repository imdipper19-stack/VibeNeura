import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0d1515',
        'surface-dim': '#0d1515',
        'surface-bright': '#323b3b',
        'surface-container-lowest': '#071010',
        'surface-container-low': '#151d1d',
        'surface-container': '#192121',
        'surface-container-high': '#232c2b',
        'surface-container-highest': '#2e3636',
        'on-surface': '#dbe4e3',
        'on-surface-variant': '#b9cac9',
        'inverse-surface': '#dbe4e3',
        'inverse-on-surface': '#293232',
        outline: '#839493',
        'outline-variant': '#3a4a49',
        'surface-tint': '#00dddd',
        primary: '#00fbfb',
        'on-primary': '#003737',
        'primary-container': '#00fbfb',
        'on-primary-container': '#007070',
        'inverse-primary': '#006a6a',
        secondary: '#b0c6ff',
        'on-secondary': '#002d6f',
        'secondary-container': '#568dff',
        'on-secondary-container': '#002661',
        tertiary: '#dfb7ff',
        'on-tertiary': '#4b007e',
        'tertiary-container': '#f1daff',
        'on-tertiary-container': '#9500f2',
        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        background: '#0d1515',
        'on-background': '#dbe4e3',
        'surface-variant': '#2e3636',
        coral: '#ff6b81',
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
