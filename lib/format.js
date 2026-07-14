// Formatea un precio entero en CLP al estilo chileno: 2500 -> "$2.500"
export function formatCLP(value) {
  const number = Number(value) || 0
  return '$' + number.toLocaleString('es-CL')
}

// Precio con unidad de venta: (12990, 'kg') -> "$12.990 /kg".
// Sin unidad devuelve solo el precio (productos antiguos siguen funcionando).
const UNIT_LABELS = { kg: '/kg', un: 'c/u', docena: '/docena' }

export function formatPrice(price, unit) {
  const base = formatCLP(price)
  const label = UNIT_LABELS[unit]
  return label ? `${base} ${label}` : base
}
