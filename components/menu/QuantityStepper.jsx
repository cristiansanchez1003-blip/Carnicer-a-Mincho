'use client'

import { formatQuantity } from '@/lib/format'
import { useApp } from '@/contexts/AppContext'

// Selector de cantidad: [−] 1,5 kg [+]. onChange recibe -1 o +1 (un paso: 0,5 kg o 1 unidad).
export default function QuantityStepper({ qty, unit = 'kg', onChange, size = 'md' }) {
  const { lang, t } = useApp()
  const button =
    size === 'sm'
      ? 'h-9 w-9 text-[18px]'
      : 'h-10 w-10 text-[20px]'

  return (
    <div className="inline-flex items-center rounded-full border border-linen bg-card dark:border-linendark dark:bg-carddark">
      <button
        type="button"
        onClick={() => onChange(-1)}
        aria-label={t('decrease')}
        className={`${button} flex items-center justify-center rounded-full font-bold leading-none text-ink active:scale-90 dark:text-paper`}
      >
        −
      </button>
      <span
        className="min-w-[3.6rem] select-none px-1 text-center text-[13.5px] font-bold tabular-nums text-ink dark:text-paper"
        aria-live="polite"
      >
        {formatQuantity(qty, unit, lang)}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label={t('increase')}
        className={`${button} flex items-center justify-center rounded-full font-bold leading-none text-forest active:scale-90 dark:text-mint`}
      >
        +
      </button>
    </div>
  )
}
