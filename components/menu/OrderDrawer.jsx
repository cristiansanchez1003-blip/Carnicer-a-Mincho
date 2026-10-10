'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCLP } from '@/lib/format'
import { localizedField } from '@/lib/i18n'
import { buildWhatsAppMessage, buildWhatsAppUrl, summarize } from '@/lib/order'
import { useApp } from '@/contexts/AppContext'
import { useOrder } from '@/contexts/OrderContext'
import QuantityStepper from './QuantityStepper'

// Panel "Mi pedido": detalle, total estimado y envío por WhatsApp con el mensaje ya escrito.
export default function OrderDrawer({ products, settings }) {
  const { lang, t } = useApp()
  const { items, drawerOpen, closeDrawer, change, remove, clear } = useOrder()
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  const summary = useMemo(() => summarize(items, products), [items, products])
  const message = useMemo(
    () =>
      buildWhatsAppMessage({
        ...summary,
        shopName: settings?.name || 'Carnicería Mincho',
        lang,
        name,
        note,
      }),
    [summary, settings?.name, lang, name, note]
  )
  const url = settings?.whatsapp ? buildWhatsAppUrl(settings.whatsapp, message) : null
  const canSend = summary.count > 0 && Boolean(url)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => e.key === 'Escape' && closeDrawer()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, closeDrawer])

  const fieldCls =
    'w-full rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint dark:border-linendark dark:bg-paperdark dark:text-paper dark:focus:border-mint dark:focus:ring-mint/30'

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" onClick={closeDrawer} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('myOrder')}
            className="safe-bottom relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-sheet dark:bg-carddark sm:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h3 className="font-playfair text-[21px] font-bold text-ink dark:text-paper">{t('myOrder')}</h3>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/70 dark:bg-paper/10 dark:text-paper/80"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {summary.lines.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-muted dark:text-muteddark">{t('emptyOrder')}</p>
              ) : (
                <ul className="divide-y divide-linen dark:divide-linendark">
                  {summary.lines.map((line) => {
                    const lineName = localizedField(line.product, 'name', lang)
                    return (
                      <li key={line.product.id} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-[14.5px] font-bold text-ink dark:text-paper ${line.unavailable ? 'line-through opacity-60' : ''}`}>
                              {lineName}
                            </p>
                            {line.unavailable && (
                              <p className="mt-0.5 text-[12px] font-semibold text-amber-800 dark:text-amber-300">
                                {t('unavailableInOrder')}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.product.id)}
                            aria-label={`${t('remove')}: ${lineName}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-ink/5 dark:text-muteddark"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <QuantityStepper
                            size="sm"
                            qty={line.qty}
                            unit={line.unit}
                            onChange={(delta) => change(line.product.id, delta, line.unit)}
                          />
                          <span className={`font-playfair text-[16px] font-bold text-forest dark:text-mint ${line.unavailable ? 'opacity-50' : ''}`}>
                            {formatCLP(line.subtotal)}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {summary.lines.length > 0 && (
                <div className="mt-2 flex flex-col gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[12.5px] font-bold text-ink/70 dark:text-paper/70">{t('yourName')}</span>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className={fieldCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12.5px] font-bold text-ink/70 dark:text-paper/70">{t('orderNote')}</span>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={300}
                      placeholder={t('orderNotePlaceholder')}
                      className={fieldCls}
                    />
                  </label>
                </div>
              )}
            </div>

            {summary.lines.length > 0 && (
              <div className="border-t border-linen px-5 pb-5 pt-4 dark:border-linendark">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] font-bold text-ink dark:text-paper">{t('estimatedTotal')}</span>
                  <span className="font-playfair text-[24px] font-bold text-ink dark:text-paper">{formatCLP(summary.total)}</span>
                </div>
                <p className="mt-1 text-[12px] text-muted dark:text-muteddark">{t('priceNote')}</p>

                {canSend ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c9c4e] py-3.5 text-[15px] font-bold text-white shadow-nav active:scale-[0.98]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23z" />
                    </svg>
                    {t('sendWhatsApp')}
                  </a>
                ) : (
                  <span aria-disabled="true" className="mt-3 flex w-full items-center justify-center rounded-xl bg-ink/20 py-3.5 text-[15px] font-bold text-ink/60">
                    {t('sendWhatsApp')}
                  </span>
                )}
                <p className="mt-2 text-center text-[12px] text-muted dark:text-muteddark">{t('sendHint')}</p>

                <button
                  type="button"
                  onClick={() => window.confirm(`${t('clearOrder')}?`) && clear()}
                  className="mx-auto mt-2 block text-[13px] font-bold text-muted underline underline-offset-2 dark:text-muteddark"
                >
                  {t('clearOrder')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
