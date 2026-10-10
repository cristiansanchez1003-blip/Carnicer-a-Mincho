'use client'

import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/format'
import { localizedField } from '@/lib/i18n'
import { useApp } from '@/contexts/AppContext'
import { useOrder } from '@/contexts/OrderContext'
import HighlightBadge from './HighlightBadge'
import ProductImage from './ProductImage'
import QuantityStepper from './QuantityStepper'

export default function ProductCard({ product, emoji, onSelect }) {
  const { lang, t } = useApp()
  const { qtyOf, add, change } = useOrder()
  const unavailable = product.available === false
  const name = localizedField(product, 'name', lang)
  const description = localizedField(product, 'description', lang)
  const unit = product.unit || 'kg'
  const qty = qtyOf(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex w-full items-center gap-3.5 rounded-2xl border border-linen/80 bg-card p-3 text-left shadow-card transition-shadow dark:border-linendark/80 dark:bg-carddark ${
        unavailable ? 'opacity-60 saturate-50' : ''
      }`}
    >
      <div className="min-w-0 flex-1 py-0.5">
        <button type="button" onClick={() => onSelect(product)} className="block w-full text-left">
          {product.highlight && <HighlightBadge value={product.highlight} className="mb-1" />}
          <h4 className="font-lato text-[15px] font-bold leading-snug text-ink dark:text-paper">
            {name}
          </h4>
          {description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted dark:text-muteddark">
              {description}
            </p>
          )}
        </button>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-playfair text-[15.5px] font-bold text-forest dark:text-mint">
            {formatPrice(product.price, product.unit, lang)}
          </span>
          {unavailable ? (
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink/75 dark:bg-paper/10 dark:text-paper/70">
              {t('unavailable')}
            </span>
          ) : (
            <div className="ml-auto">
              {qty > 0 ? (
                <QuantityStepper
                  size="sm"
                  qty={qty}
                  unit={unit}
                  onChange={(delta) => change(product.id, delta, unit)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => add(product.id, 1, unit)}
                  aria-label={t('addProduct', { name })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-[22px] font-bold leading-none text-white shadow-nav transition active:scale-90 dark:bg-mint dark:text-ink"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(product)}
        tabIndex={-1}
        aria-hidden="true"
        className="shrink-0 rounded-xl transition active:scale-95"
      >
        <ProductImage
          src={product.image}
          alt={name}
          emoji={emoji}
          sizes="76px"
          className="h-[76px] w-[76px] rounded-xl"
        />
      </button>
    </motion.div>
  )
}
