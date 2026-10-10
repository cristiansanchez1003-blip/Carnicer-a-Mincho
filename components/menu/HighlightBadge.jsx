'use client'

import { highlightLabel, isHighlight } from '@/lib/highlights'
import { useApp } from '@/contexts/AppContext'

// Etiqueta de producto destacado ("Recién llegado", "Del día", "Recomendado").
export default function HighlightBadge({ value, className = '' }) {
  const { lang } = useApp()
  if (!isHighlight(value)) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[#6b5200] dark:bg-gold/25 dark:text-gold ${className}`}
    >
      <span aria-hidden="true">⭐</span>
      {highlightLabel(value, lang)}
    </span>
  )
}
