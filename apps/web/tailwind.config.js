/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#09090b',
          900: '#111116',
          850: '#181820',
          800: '#22222c',
          700: '#2e2e3a',
          600: '#3f3f4e',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          950: '#1a0507',
        },
        // Mapeo retrocompatible para transformar cualquier clase lime en tonos rojos
        lime: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        impostor: {
          red: '#ef4444',
          crimson: '#dc2626',
          dark: '#09090b',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(239, 68, 68, 0.4)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.5)',
      },
      animation: {
        pulseSlow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
