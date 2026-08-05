import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // Modern Premium brand colors
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#8b5cf6', // Violet 500 primary accent
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        ink: '#0b0f19', // Sleeker rich black dark mode bg
        leaf: '#10b981', // Emerald 500 for active states/success
        ember: '#f43f5e', // Vibrant rose/pink for warning/cart alerts
        glass: {
          light: 'rgba(255, 255, 255, 0.45)',
          dark: 'rgba(15, 23, 42, 0.45)',
        }
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        premium: '0 20px 50px -12px rgba(139, 92, 246, 0.15)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: []
} satisfies Config;

