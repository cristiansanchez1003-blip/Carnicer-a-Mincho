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
  title: 'El Café de Pirque — Menú Digital',
  description:
    'Menú digital de El Café de Pirque. Cafés, desayunos, sándwiches, tortas y más en Pirque, Chile.',
  openGraph: {
    title: 'El Café de Pirque',
    description: 'Nuestro menú, siempre fresco. Escanea, mira y disfruta.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#24282A',
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
