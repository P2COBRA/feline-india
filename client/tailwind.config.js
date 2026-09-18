/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#0f9ba8',
          600: '#0d7c87',
          700: '#0a5e6a'
        },
        accent: {
          500: '#22c55e',
          600: '#16a34a'
        },
        warning: '#ef4444'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 155, 168, 0.12)'
      }
    }
  },
  plugins: []
};
