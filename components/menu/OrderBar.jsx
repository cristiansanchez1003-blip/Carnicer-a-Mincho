'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCLP } from '@/lib/format'
import { summarize } from '@/lib/order'
import { useApp } from '@/contexts/AppContext'
import { useOrder } from '@/contexts/OrderContext'

// Barra fija inferior que aparece cuando hay productos en el pedido.
export default function OrderBar({ products }) {
  const { t } = useApp()
  const { items, drawerOpen, openDrawer } = useOrder()
  const summary = useMemo(() => summarize(items, products), [items, products])
  const show = summary.count > 0 && !drawerOpen

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        >
          <button
            type="button"
            onClick={openDrawer}
            className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3 text-left text-white shadow-sheet active:scale-[0.99]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <svg className="h-6 w-6 shrink-0 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 7h12l-1 13H7L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold">
                  {summary.count === 1 ? t('orderCountOne') : t('orderCountMany', { n: summary.count })}
                </span>
                <span className="block text-[12px] text-white/70">
                  {t('estimatedTotal')}: {formatCLP(summary.total)}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-mint px-4 py-2 text-[13px] font-bold text-ink">
              {t('viewOrder')}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
