import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0d1514',
        'surface-dim': '#0d1514',
        'surface-bright': '#333b39',
        'surface-container-lowest': '#08100e',
        'surface-container-low': '#161d1c',
        'surface-container': '#1a2120',
        'surface-container-high': '#242b2a',
        'surface-container-highest': '#2f3635',
        'on-surface': '#dce4e2',
        'on-surface-variant': '#bacac6',
        'inverse-surface': '#dce4e2',
        'inverse-on-surface': '#2a3230',
        outline: '#849491',
        'outline-variant': '#3b4a47',
        'surface-tint': '#1cdecc',
        primary: '#7bffee',
        'on-primary': '#003732',
        'primary-container': '#2ee5d3',
        'on-primary-container': '#00625a',
        'inverse-primary': '#006a61',
        secondary: '#ddb7ff',
        'on-secondary': '#490080',
        'secondary-container': '#6f00be',
        'on-secondary-container': '#d6a9ff',
        tertiary: '#d0fa00',
        'on-tertiary': '#2a3400',
        'tertiary-container': '#b7dc00',
        'on-tertiary-container': '#4d5e00',
        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        background: '#0d1514',
        'on-background': '#dce4e2',
        'surface-variant': '#2f3635',
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
