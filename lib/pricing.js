// Ajuste masivo de precios: sube o baja un porcentaje (o un monto) a todo el menú o a una
// categoría, con vista previa. Son funciones puras: no modifican lo que reciben.

export const ROUNDING_STEPS = [1, 10, 50, 100]

const MIN_PERCENT = -90
const MAX_PERCENT = 200
const MAX_AMOUNT = 1_000_000

export function roundToStep(value, step = 1) {
  const s = ROUNDING_STEPS.includes(Number(step)) ? Number(step) : 1
  return Math.round(value / s) * s
}

// Precio nuevo: entero, redondeado al paso elegido y nunca menor que 0.
export function adjustPrice(price, { mode, value, step = 1 }) {
  const base = Number(price)
  const amount = Number(value)
  if (!Number.isFinite(base) || !Number.isFinite(amount)) return price
  const raw = mode === 'amount' ? base + amount : base * (1 + amount / 100)
  return Math.max(0, roundToStep(raw, step))
}

// Devuelve un mensaje en español si el ajuste no es válido, o null.
export function validateAdjustment({ mode, value, step = 1 } = {}) {
  if (mode !== 'percent' && mode !== 'amount') return 'Elige el tipo de ajuste: porcentaje o monto'
  if (!ROUNDING_STEPS.includes(Number(step))) return 'El redondeo elegido no es válido'
  const n = Number(value)
  if (value === '' || value === null || value === undefined || !Number.isFinite(n) || n === 0) {
    return 'Ingresa un valor distinto de cero'
  }
  if (mode === 'percent' && (n < MIN_PERCENT || n > MAX_PERCENT)) {
    return `El porcentaje debe estar entre ${MIN_PERCENT}% y +${MAX_PERCENT}%`
  }
  if (mode === 'amount' && Math.abs(n) > MAX_AMOUNT) {
    return 'El monto es demasiado grande'
  }
  return null
}

const inScope = (product, scope) => scope === 'all' || !scope || product.categoryId === scope

// Vista previa: una fila por producto del alcance, con precio anterior, nuevo y diferencia.
export function previewAdjustment(products, options) {
  const rows = products
    .filter((p) => inScope(p, options.scope))
    .map((p) => {
      const newPrice = adjustPrice(p.price, options)
      return {
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        oldPrice: p.price,
        newPrice,
        delta: newPrice - p.price,
      }
    })
  const changed = rows.filter((r) => r.delta !== 0).length
  return { rows, changed, unchanged: rows.length - changed }
}

// Lista nueva de productos con los precios ajustados; el resto de los campos no cambia.
export function applyAdjustment(products, options) {
  return products.map((p) =>
    inScope(p, options.scope) ? { ...p, price: adjustPrice(p.price, options) } : p
  )
}
