'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCLP } from '@/lib/format'
import { ROUNDING_STEPS, previewAdjustment, validateAdjustment } from '@/lib/pricing'

const ROUNDING_LABELS = { 1: 'Exacto', 10: 'A la decena', 50: 'A los $50', 100: 'A la centena' }

// Ajuste masivo de precios: sube o baja un porcentaje (o un monto) a todo el menú o a una
// categoría. Muestra cómo quedarían los precios ANTES de aplicar; los cambios recién se
// publican cuando se presiona "Guardar cambios" en el panel.
export default function BulkPriceModal({ open, categories, products, onApply, onClose }) {
  const [scope, setScope] = useState('all')
  const [mode, setMode] = useState('percent')
  const [direction, setDirection] = useState('up')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(10)

  // Cada vez que se abre, parte limpio
  useEffect(() => {
    if (open) {
      setScope('all')
      setMode('percent')
      setDirection('up')
      setAmount('')
      setStep(10)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const options = useMemo(() => {
    const n = Number(amount)
    return { scope, mode, step, value: direction === 'down' ? -Math.abs(n) : Math.abs(n) }
  }, [scope, mode, step, direction, amount])

  const problem = amount === '' ? null : validateAdjustment(options)
  const ready = amount !== '' && !problem
  const preview = useMemo(
    () => (ready ? previewAdjustment(products, options) : null),
    [ready, products, options]
  )

  const inputCls =
    'w-full rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'
  const segCls = (active) =>
    `flex-1 rounded-lg px-3 py-2 text-[13px] font-bold transition ${
      active ? 'bg-ink text-mint' : 'text-ink/70'
    }`

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-ink/60" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ajustar precios"
            className="safe-bottom relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-sheet sm:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-playfair text-lg font-bold text-ink">Ajustar precios</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-muted">
              Sube o baja los precios de una vez. Primero verás cómo quedarían; nada se publica
              hasta que presiones “Guardar cambios”.
            </p>

            <div className="mt-4 flex flex-col gap-3.5">
              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">¿A qué productos?</span>
                <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputCls}>
                  <option value="all">Todos los productos ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({products.filter((p) => p.categoryId === c.id).length})
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Tipo de ajuste</span>
                <div className="flex gap-1 rounded-xl border border-linen bg-paper p-1">
                  <button type="button" onClick={() => setMode('percent')} className={segCls(mode === 'percent')}>
                    Porcentaje (%)
                  </button>
                  <button type="button" onClick={() => setMode('amount')} className={segCls(mode === 'amount')}>
                    Monto ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Dirección</span>
                  <div className="flex gap-1 rounded-xl border border-linen bg-paper p-1">
                    <button type="button" onClick={() => setDirection('up')} className={segCls(direction === 'up')}>
                      Subir
                    </button>
                    <button type="button" onClick={() => setDirection('down')} className={segCls(direction === 'down')}>
                      Bajar
                    </button>
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                    {mode === 'percent' ? 'Cuánto (%)' : 'Cuánto ($)'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step={mode === 'percent' ? '0.1' : '1'}
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={mode === 'percent' ? 'Ej: 5' : 'Ej: 500'}
                    className={inputCls}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Redondear el precio nuevo</span>
                <select value={step} onChange={(e) => setStep(Number(e.target.value))} className={inputCls}>
                  {ROUNDING_STEPS.map((s) => (
                    <option key={s} value={s}>
                      {ROUNDING_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {problem && (
              <p role="alert" className="mt-3 text-[13px] font-semibold text-red-600">
                {problem}
              </p>
            )}

            {preview && (
              <div className="mt-4 rounded-xl border border-linen bg-paper p-3" aria-live="polite">
                <p className="text-[13px] font-bold text-ink">
                  {preview.changed === 0
                    ? 'Con estos valores ningún precio cambia.'
                    : `${preview.changed} ${preview.changed === 1 ? 'precio cambia' : 'precios cambian'} (así quedarían):`}
                </p>
                <ul className="mt-2 max-h-48 divide-y divide-linen overflow-y-auto">
                  {preview.rows
                    .filter((r) => r.delta !== 0)
                    .map((r) => (
                      <li key={r.id} className="flex items-baseline justify-between gap-3 py-1.5 text-[13px]">
                        <span className="min-w-0 truncate text-ink">{r.name}</span>
                        <span className="shrink-0 text-right">
                          <span className="text-ink/60 line-through">{formatCLP(r.oldPrice)}</span>{' '}
                          <span className="font-bold text-ink">{formatCLP(r.newPrice)}</span>{' '}
                          <span className={r.delta > 0 ? 'text-forest' : 'text-emerald-800'}>
                            ({r.delta > 0 ? '+' : '−'}
                            {formatCLP(Math.abs(r.delta))})
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              disabled={!preview || preview.changed === 0}
              onClick={() => onApply({ ...options, changed: preview.changed })}
              className="mt-4 w-full rounded-xl bg-forest py-3.5 text-[15px] font-bold text-white shadow-nav active:scale-[0.98] disabled:opacity-50"
            >
              {preview && preview.changed > 0
                ? `Aplicar a ${preview.changed} ${preview.changed === 1 ? 'producto' : 'productos'}`
                : 'Aplicar ajuste'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
