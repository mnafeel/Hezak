import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d5c2ff',
          300: '#bfa3ff',
          400: '#a985ff',
          500: '#9367ff',
          600: '#7d4aff',
          700: '#6535e6',
          800: '#4d29b3',
          900: '#351d80'
        },
        accent: {
          50: '#fff0f7',
          100: '#ffd6ec',
          200: '#ffadd9',
          300: '#ff84c6',
          400: '#ff5cb3',
          500: '#e6429a',
          600: '#b33278',
          700: '#802256',
          800: '#4d1234',
          900: '#1f010f'
        }
      },
      boxShadow: {
        glow: '0 0 30px rgba(147, 103, 255, 0.35)'
      },
      backgroundImage: {
        'luxury-gradient':
          'linear-gradient(135deg, rgba(147,103,255,0.9) 0%, rgba(236,72,153,0.9) 50%, rgba(15,23,42,0.95) 100%)',
        'glass-pattern':
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)'
      }
    }
  },
  plugins: []
} satisfies Config;


