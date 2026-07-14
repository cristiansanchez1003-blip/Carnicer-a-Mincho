'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCLP } from '@/lib/format'
import { localizedField } from '@/lib/i18n'
import { useApp } from '@/contexts/AppContext'
import ProductImage from './ProductImage'

// Modal de producto estilo bottom-sheet: sube desde abajo en el celular
// y se puede cerrar deslizando hacia abajo, tocando el fondo o con la X.
export default function ProductModal({ product, emoji, onClose }) {
  const { lang, t } = useApp()

  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [product])

  const name = product ? localizedField(product, 'name', lang) : ''
  const description = product ? localizedField(product, 'description', lang) : ''

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo oscuro */}
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Hoja */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={name}
            className="safe-bottom relative w-full max-w-md overflow-hidden rounded-t-3xl bg-card shadow-sheet dark:bg-carddark sm:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
          >
            {/* Asa para deslizar */}
            <div className="absolute left-1/2 top-2.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink/25 dark:bg-paper/25" />

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/55 text-white backdrop-blur transition-transform active:scale-90"
            >
              <svg className="h-4.5 w-4.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <ProductImage
              src={product.image}
              alt={name}
              emoji={emoji}
              className="h-56 w-full sm:h-64"
            />

            <div className="px-6 pb-7 pt-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-playfair text-[22px] font-bold leading-tight text-ink dark:text-paper">
                  {name}
                </h3>
              </div>

              {description && (
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted dark:text-muteddark">
                  {description}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between">
                <span className="font-playfair text-[26px] font-bold text-forest dark:text-mint">
                  {formatCLP(product.price)}
                </span>
                {product.available === false ? (
                  <span className="rounded-full bg-ink/10 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-ink/60 dark:bg-paper/10 dark:text-paper/50">
                    {t('unavailable')}
                  </span>
                ) : (
                  <span className="rounded-full bg-mintsoft px-3.5 py-1.5 text-[12px] font-bold text-forest dark:bg-forest/25 dark:text-mint">
                    {t('available')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
