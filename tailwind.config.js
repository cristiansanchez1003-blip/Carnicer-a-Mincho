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
        // Paleta tomada del letrero Mincho: rojo + amarillo + azul sobre
        // crema madera (light) y negro carbón (dark). Se conservan los
        // NOMBRES de tokens del proyecto original para no tocar componentes:
        // mint = acento (amarillo letrero) · forest = acción/precios (rojo letrero)
        paper: '#F5EFE4',
        card: '#FFFCF5',
        ink: '#231F1C',
        muted: '#7A716B',
        mint: '#FFC93C',
        mintsoft: '#FBEED3',
        forest: '#B3271D',
        linen: '#E8DFCE',
        gold: '#C9A227',
        azul: '#2E6FB7',
        rojo: '#D63426',
        // Variantes para modo oscuro (negro carbón del letrero)
        paperdark: '#151312',
        carddark: '#211E1B',
        linendark: '#3A342E',
        muteddark: '#ABA199',
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
