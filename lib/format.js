// Formatea un precio entero en CLP al estilo chileno: 2500 -> "$2.500"
export function formatCLP(value) {
  const number = Number(value) || 0
  return '$' + number.toLocaleString('es-CL')
}

// Etiqueta de la unidad de venta junto al precio.
const PRICE_UNIT = {
  es: { kg: '/kg', un: 'c/u', docena: '/docena' },
  en: { kg: '/kg', un: 'each', docena: '/dozen' },
}

// Precio con unidad de venta: (12990, 'kg') -> "$12.990 /kg".
// Sin unidad devuelve solo el precio (productos antiguos siguen funcionando).
export function formatPrice(price, unit, lang = 'es') {
  const base = formatCLP(price)
  const label = (PRICE_UNIT[lang] || PRICE_UNIT.es)[unit]
  return label ? `${base} ${label}` : base
}

// Cantidad pedida: (1.5, 'kg', 'es') -> "1,5 kg"; (2, 'docena', 'es') -> "2 docenas".
export function formatQuantity(qty, unit = 'kg', lang = 'es') {
  const n = Number(qty) || 0
  const text = n.toLocaleString(lang === 'en' ? 'en-US' : 'es-CL', { maximumFractionDigits: 2 })
  if (unit === 'un') return lang === 'en' ? `${text} pcs` : `${text} un.`
  if (unit === 'docena') {
    return lang === 'en' ? `${text} dozen` : `${text} ${n === 1 ? 'docena' : 'docenas'}`
  }
  return `${text} kg`
}

// Fecha "AAAA-MM-DD" en palabras, sin desfase de zona horaria. Vacío si no es válida.
export function formatDate(iso, lang = 'es') {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''))
  if (!match) return ''
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

// Teléfono para mostrar: ("56974543692") -> "+56 9 7454 3692". Si no tiene el formato de un
// celular chileno, se muestra con el + delante y sin más cambios.
export function formatPhone(digits) {
  const d = String(digits ?? '').replace(/\D/g, '')
  if (!d) return ''
  const match = /^(\d{2})(\d)(\d{4})(\d{4})$/.exec(d)
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : `+${d}`
}

// Fecha de hoy en Chile como "AAAA-MM-DD" (a las 23:30 de Chile ya es el día siguiente en UTC).
export function todayISO(date = new Date(), timeZone = 'America/Santiago') {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
