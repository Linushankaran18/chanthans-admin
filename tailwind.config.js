/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        ink: { DEFAULT: '#1c1917', soft: '#57534e', mute: '#78716c' },
        paper: { DEFAULT: '#faf9f7', card: '#ffffff', line: '#e7e5e4' },
        accent: { DEFAULT: '#292524', hover: '#44403c' },
      },
    },
  },
  plugins: [],
}
