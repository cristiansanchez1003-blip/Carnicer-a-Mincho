'use client'

import { useApp } from '@/contexts/AppContext'

// Buscador del menú: filtra productos de todas las categorías mientras se escribe.
export default function SearchBox({ value, onChange }) {
  const { t } = useApp()

  return (
    <div role="search" className="mx-auto max-w-lg px-4 pt-5">
      <div className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted dark:text-muteddark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t('searchAria')}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-full border border-linen bg-card py-3 pl-11 pr-11 text-[15px] text-ink shadow-card outline-none transition placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-mint dark:border-linendark dark:bg-carddark dark:text-paper dark:placeholder:text-muteddark dark:focus:border-mint dark:focus:ring-mint/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t('clearSearch')}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[15px] text-ink/60 active:scale-90 dark:text-paper/60"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
