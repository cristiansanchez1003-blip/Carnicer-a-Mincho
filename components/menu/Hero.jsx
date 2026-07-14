'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { localizedField } from '@/lib/i18n'
import { useApp } from '@/contexts/AppContext'

export default function Hero({ settings }) {
  const { scrollY } = useScroll()
  const { lang } = useApp()
  // Parallax sutil: el logo se desplaza y desvanece al hacer scroll
  const y = useTransform(scrollY, [0, 300], [0, 60])
  const opacity = useTransform(scrollY, [0, 260], [1, 0.25])

  const slogan = settings ? localizedField(settings, 'slogan', lang) : ''
  const hours = settings ? localizedField(settings, 'hours', lang) : ''

  return (
    <header className="hero-texture relative overflow-hidden bg-paper pb-8 pt-10 dark:bg-paperdark">
      {/* halo verde decorativo */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-mint/40 blur-3xl dark:bg-forest/20" />
      <div className="pointer-events-none absolute -left-20 top-32 h-48 w-48 rounded-full bg-mint/30 blur-3xl dark:bg-forest/15" />

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-lg px-6">
        <motion.img
          src="/logo.jpg"
          alt="El Café de Pirque"
          className="mx-auto w-full max-w-[320px] mix-blend-multiply dark:mix-blend-normal dark:rounded-2xl"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        <motion.p
          className="mt-4 text-center font-lato text-[15px] leading-relaxed text-muted dark:text-muteddark"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {slogan}
        </motion.p>

        <motion.div
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {hours && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-mintsoft px-3.5 py-1.5 text-[13px] font-semibold text-forest dark:border-mint/25 dark:bg-carddark dark:text-mint">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {hours}
            </span>
          )}
          {settings?.address && (
            <a
              href={settings.mapsUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-card px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-card active:scale-95 transition-transform dark:border-linendark dark:bg-carddark dark:text-paper"
            >
              <svg className="h-3.5 w-3.5 text-forest dark:text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Pirque
            </a>
          )}
        </motion.div>
      </motion.div>
    </header>
  )
}
