/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          500: '#0C1A1A',
          600: '#0a1616',
          700: '#081212',
          800: '#060e0e',
          900: '#040a0a',
        },
        accent: {
          400: '#f4d03f',
          500: '#D4AF37',
          600: '#b8962f',
        }
      },
      fontFamily: {
        'arabic': ['Scheherazade New', 'serif'],
        'bengali': ['Noto Sans Bengali', 'sans-serif'],
        'sans': ['Lato', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'arabic': ['1.5rem', { lineHeight: '1.8' }],
        'translation': ['1rem', { lineHeight: '1.6' }],
      }
    },
  },
  plugins: [],
}