'use client'

import { motion } from 'framer-motion'
import { localizedField } from '@/lib/i18n'
import { useApp } from '@/contexts/AppContext'

function ContactLink({ href, label, sub, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-3.5 rounded-2xl bg-white/[0.06] p-4 backdrop-blur transition-colors active:bg-white/[0.12]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint/20 text-mint">
        {children}
      </span>
      <span className="min-w-0">
        <span className="block text-[14.5px] font-bold text-white">{label}</span>
        <span className="block truncate text-[12.5px] text-white/60">{sub}</span>
      </span>
      <svg className="ml-auto h-4 w-4 shrink-0 text-white/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </motion.a>
  )
}

export default function Footer({ settings }) {
  const { lang, t } = useApp()
  if (!settings) return null

  const hours = localizedField(settings, 'hours', lang)

  return (
    <footer className="safe-bottom mt-12 bg-ink px-5 pb-10 pt-10 dark:bg-carddark">
      <div className="mx-auto max-w-md">
        <motion.h3
          className="text-center font-playfair text-[22px] font-bold text-white"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t('contactSectionTitle')}
        </motion.h3>
        <p className="mt-1.5 text-center text-[13px] text-white/50">
          {t('contactSectionSubtitle')}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {settings.whatsapp && (
            <ContactLink
              href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}`}
              label={t('whatsapp')}
              sub={`+${settings.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4')}`}
            >
              <svg className="h-5.5 w-5.5" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
              </svg>
            </ContactLink>
          )}

          {settings.instagram && (
            <ContactLink
              href={settings.instagram}
              label={t('instagram')}
              sub={settings.instagramHandle || '@elcafedepirque'}
            >
              <svg className="h-5.5 w-5.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </ContactLink>
          )}

          {settings.email && (
            <ContactLink href={`mailto:${settings.email}`} label={t('email')} sub={settings.email}>
              <svg className="h-5.5 w-5.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="3" />
                <path d="m3.5 7 8.5 6 8.5-6" />
              </svg>
            </ContactLink>
          )}

          {settings.address && (
            <ContactLink
              href={settings.mapsUrl || '#'}
              label={t('directions')}
              sub={settings.address}
            >
              <svg className="h-5.5 w-5.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </ContactLink>
          )}
        </div>

        {hours && (
          <div className="mt-6 rounded-2xl border border-white/10 p-4 text-center">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-mint">
              {t('hoursLabel')}
            </span>
            <span className="mt-1 block text-[15px] font-bold text-white">{hours}</span>
          </div>
        )}

        <p className="mt-8 text-center text-[11.5px] text-white/35">
          © {new Date().getFullYear()} {settings.name || 'El Café de Pirque'} · Pirque, Chile
        </p>

        <p className="mt-2 text-center text-[11.5px] text-white/35">
          {lang === 'en' ? 'Made by' : 'Hecho por'}{' '}
          <a
            href="https://www.espiritudigital.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-mint/80 underline decoration-mint/30 underline-offset-2 transition-colors hover:text-mint"
          >
            Espíritu Digital
          </a>
        </p>
      </div>
    </footer>
  )
}
