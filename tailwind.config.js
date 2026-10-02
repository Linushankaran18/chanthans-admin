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
        // ink.mute is a darker muted tone used for small text (AA on cream/white)
        ink: { DEFAULT: '#16151c', soft: '#3f3d49', mute: '#6b6775' },
        muted: { DEFAULT: '#837f8c', light: '#a8a4b0' },
        line: { DEFAULT: '#ece9f0', strong: '#ddd8e4' },
        paper: { DEFAULT: '#f9f8f6', card: '#ffffff', line: '#ece9f0' },
        cream: { DEFAULT: '#f9f8f6', deep: '#f4f2ee' },
        brand: { cyan: '#1aa6e0', blue: '#2a7de1', purple: '#6d2e9e', aubergine: '#4a1d6e' },
        accent: { DEFAULT: '#6d2e9e', hover: '#58247f' },
        success: { DEFAULT: '#1f7a4d', soft: '#e8f5ee' },
        danger: { DEFAULT: '#b4233a', hover: '#9a1d32', soft: '#fbeef0' },
      },
      letterSpacing: { luxe: '0.3em' },
      transitionTimingFunction: { lux: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(22, 21, 28, 0.28)',
        lift: '0 30px 70px -30px rgba(22, 21, 28, 0.42)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #18a8e3 0%, #5a4bd0 52%, #7a2fa0 100%)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'sheet-up': 'sheet-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both' },
    },
  },
  plugins: [],
}
