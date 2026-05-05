/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          950: '#04070f',
          900: '#060913',
          850: '#0a1020',
          800: '#0d1529',
        },
        sky: '#78f0ff',
        sun: '#ffcb6b',
        mint: '#80f5c9',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(120, 240, 255, 0.12), 0 30px 90px rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        drift: 'drift 10s ease-in-out infinite',
        shimmer: 'shimmer 12s linear infinite',
        reveal: 'reveal 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      backgroundImage: {
        'galaxy-glow':
          'radial-gradient(circle at 20% 20%, rgba(120,240,255,0.14), transparent 26%), radial-gradient(circle at 80% 10%, rgba(255,203,107,0.12), transparent 22%), radial-gradient(circle at 70% 80%, rgba(128,245,201,0.08), transparent 25%)',
      },
    },
  },
  plugins: [],
};
