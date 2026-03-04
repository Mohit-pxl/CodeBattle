/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#0B0B0E',
        'deep-blue': '#1A1A24',
        slate: '#C5C6C7',
        white: '#FFFFFF',
        primary: '#E63946',
        'primary-glow': 'rgba(230, 57, 70, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', '"Consolas"', 'monospace'],
      },
    },
  },
  plugins: [],
}
