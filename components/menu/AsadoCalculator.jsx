'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCLP, formatQuantity } from '@/lib/format'
import { localizedField } from '@/lib/i18n'
import { GRAMS, planAsado } from '@/lib/asado'
import { useApp } from '@/contexts/AppContext'
import { useOrder } from '@/contexts/OrderContext'

function CountRow({ label, value, onChange }) {
  const { t } = useApp()
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full text-[20px] font-bold leading-none active:scale-90'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14.5px] font-bold text-ink dark:text-paper">{label}</span>
      <div className="inline-flex items-center rounded-full border border-linen bg-card dark:border-linendark dark:bg-paperdark">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`${t('decrease')}: ${label}`} className={`${btn} text-ink dark:text-paper`}>
          −
        </button>
        <span className="min-w-[2.6rem] text-center text-[15px] font-bold tabular-nums text-ink dark:text-paper" aria-live="polite">
          {value}
        </span>
        <button type="button" onClick={() => onChange(Math.min(100, value + 1))} aria-label={`${t('increase')}: ${label}`} className={`${btn} text-forest dark:text-mint`}>
          +
        </button>
      </div>
    </div>
  )
}

// Botón en la portada + ventana con la calculadora de asado.
export default function AsadoCalculator({ products }) {
  const { lang, t } = useApp()
  const { setMany, openDrawer } = useOrder()
  const [open, setOpen] = useState(false)
  const [adults, setAdults] = useState(6)
  const [kids, setKids] = useState(0)
  const [appetite, setAppetite] = useState('normal')

  const plan = useMemo(() => planAsado({ adults, kids, appetite }, products), [adults, kids, appetite, products])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  function addAll() {
    setMany(plan.items.map((i) => ({ id: i.product.id, qty: i.kg, unit: 'kg' })))
    setOpen(false)
    openDrawer()
  }

  const seg = (active) =>
    `flex-1 rounded-lg px-3 py-2 text-[13px] font-bold transition ${
      active ? 'bg-ink text-mint dark:bg-mint dark:text-ink' : 'text-ink/70 dark:text-paper/70'
    }`

  return (
    <>
      <div className="px-4 pb-1 pt-4 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-forest/30 bg-card px-4 py-2 text-[13.5px] font-bold text-forest shadow-card active:scale-95 dark:border-mint/30 dark:bg-carddark dark:text-mint"
        >
          <span aria-hidden="true">🔥</span>
          {t('asadoButton')}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('asadoTitle')}
              className="safe-bottom relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-sheet dark:bg-carddark sm:rounded-3xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-[21px] font-bold text-ink dark:text-paper">🔥 {t('asadoTitle')}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('close')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/70 dark:bg-paper/10 dark:text-paper/80"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-[13.5px] text-muted dark:text-muteddark">{t('asadoIntro')}</p>

              <div className="mt-4 flex flex-col gap-3">
                <CountRow label={t('adults')} value={adults} onChange={setAdults} />
                <CountRow label={t('kids')} value={kids} onChange={setKids} />
                <div>
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70 dark:text-paper/70">{t('appetite')}</span>
                  <div className="flex gap-1 rounded-xl border border-linen bg-paper p-1 dark:border-linendark dark:bg-paperdark">
                    <button type="button" onClick={() => setAppetite('normal')} className={seg(appetite === 'normal')}>
                      {t('appetiteNormal')}
                    </button>
                    <button type="button" onClick={() => setAppetite('big')} className={seg(appetite === 'big')}>
                      {t('appetiteBig')}
                    </button>
                  </div>
                </div>
              </div>

              {plan.totalKg > 0 && (
                <div className="mt-5 rounded-2xl border border-forest/20 bg-mintsoft p-4 dark:border-mint/20 dark:bg-paperdark" aria-live="polite">
                  <p className="text-[15px] font-bold text-ink dark:text-paper">
                    {t('asadoResult', { people: adults + kids, kg: formatQuantity(plan.totalKg, 'kg', lang) })}
                  </p>

                  {plan.items.length === 0 ? (
                    <p className="mt-2 text-[13px] text-muted dark:text-muteddark">{t('asadoNoProducts')}</p>
                  ) : (
                    <>
                      <p className="mt-3 text-[12px] font-bold uppercase tracking-wide text-ink/70 dark:text-paper/70">{t('asadoMix')}</p>
                      <ul className="mt-1 divide-y divide-forest/10 dark:divide-mint/10">
                        {plan.items.map((item) => (
                          <li key={item.product.id} className="flex items-baseline justify-between gap-3 py-2 text-[14px]">
                            <span className="min-w-0 truncate font-semibold text-ink dark:text-paper">
                              {localizedField(item.product, 'name', lang)}
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="font-bold text-ink dark:text-paper">{formatQuantity(item.kg, 'kg', lang)}</span>{' '}
                              <span className="text-muted dark:text-muteddark">· {formatCLP(item.subtotal)}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex items-baseline justify-between border-t border-forest/20 pt-2 dark:border-mint/20">
                        <span className="text-[13.5px] font-bold text-ink dark:text-paper">{t('estimatedTotal')}</span>
                        <span className="font-playfair text-[20px] font-bold text-ink dark:text-paper">{formatCLP(plan.estimatedTotal)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={addAll}
                        className="mt-3 w-full rounded-xl bg-forest py-3.5 text-[15px] font-bold text-white shadow-nav active:scale-[0.98] dark:bg-mint dark:text-ink"
                      >
                        {t('addAllToOrder')}
                      </button>
                    </>
                  )}
                </div>
              )}

              <p className="mt-3 text-[12px] leading-relaxed text-muted dark:text-muteddark">
                {t('asadoDisclaimer', { adult: GRAMS.adult, kid: GRAMS.kid })}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
