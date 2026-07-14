import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata = {
  title: 'Carnicería Mincho — Menú Digital',
  description:
    'Menú digital de Carnicería Mincho. Cortes de vacuno, cerdo, pollo, cordero y embutidos en San José de Maipo, Chile.',
  openGraph: {
    title: 'Carnicería Mincho',
    description: 'Carnes seleccionadas y atención de barrio. Escanea y mira nuestros cortes.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#151312',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-lato bg-paper text-ink min-h-screen">{children}</body>
    </html>
  )
}
