'use client'

import { useApp } from '@/contexts/AppContext'

// Cluster compacto de controles: idioma (ES/EN) y tema (claro/oscuro).
// Pensado para vivir dentro de la barra sticky, siempre a mano.
export default function ControlsBar() {
  const { lang, toggleLang, theme, toggleTheme, t } = useApp()

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        onClick={toggleLang}
        aria-label="Cambiar idioma"
        className="flex h-8 min-w-[38px] items-center justify-center rounded-full border border-linen bg-card px-2 text-[12px] font-bold text-ink dark:border-linendark dark:bg-carddark dark:text-paper"
      >
        {lang === 'es' ? 'ES' : 'EN'}
      </button>
      <button
        onClick={toggleTheme}
        aria-label={theme === 'light' ? t('themeToggleDark') : t('themeToggleLight')}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-linen bg-card text-ink dark:border-linendark dark:bg-carddark dark:text-mint"
      >
        {theme === 'light' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" />
          </svg>
        )}
      </button>
    </div>
  )
}
