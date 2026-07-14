/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './contexts/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta tomada del logotipo: charcoal + verde menta sobre papel cálido
        paper: '#F7F4EE',
        card: '#FFFFFF',
        ink: '#24282A',
        muted: '#6E7370',
        mint: '#BFE5CB',
        mintsoft: '#E9F5ED',
        forest: '#2F6B47',
        linen: '#E6E1D6',
        gold: '#C9A227',
        // Variantes para modo oscuro (mismo espíritu: charcoal + menta)
        paperdark: '#1B1E1F',
        carddark: '#242829',
        linendark: '#343A3B',
        muteddark: '#9BA3A0',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        lato: ['var(--font-lato)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(36, 40, 42, 0.06)',
        cardHover: '0 12px 28px rgba(36, 40, 42, 0.14)',
        nav: '0 6px 18px rgba(36, 40, 42, 0.08)',
        sheet: '0 -12px 40px rgba(36, 40, 42, 0.22)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
