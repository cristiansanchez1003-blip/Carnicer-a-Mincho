import { formatCLP, formatQuantity } from './format.js'

// Pedido por WhatsApp: el cliente arma una lista (producto + cantidad), ve el total estimado y se
// abre WhatsApp con el mensaje ya escrito. Todo vive en el navegador; no hay pagos ni servidor.
// El carrito guarda solo { id, qty }; los precios se toman siempre del menú vigente.

export const ORDER_STORAGE_KEY = 'mincho-order'

const MAX_LINES = 100
const MAX_NAME = 60
const MAX_NOTE = 300
const MAX_QTY = { kg: 50, un: 99, docena: 20 }

// kilos: de a 0,5 kg; unidades y docenas: de a 1
export const stepFor = (unit) => (unit === 'kg' || !unit ? 0.5 : 1)
const maxFor = (unit) => MAX_QTY[unit] ?? MAX_QTY.kg

// Cantidad válida: múltiplo del paso, mínimo un paso, máximo según la unidad.
export function normalizeQty(qty, unit = 'kg') {
  const step = stepFor(unit)
  const n = Number(qty)
  if (!Number.isFinite(n)) return step
  const stepped = Math.round(n / step) * step
  return Math.min(maxFor(unit), Math.max(step, stepped))
}

export function addItem(items, id, qty, unit = 'kg') {
  const existing = items.find((i) => i.id === id)
  if (existing) {
    return items.map((i) => (i.id === id ? { ...i, qty: normalizeQty(i.qty + qty, unit) } : i))
  }
  return [...items, { id, qty: normalizeQty(qty, unit) }]
}

// Sube (+1) o baja (-1) un paso; al bajar del mínimo el producto sale del pedido.
export function changeQty(items, id, deltaSteps, unit = 'kg') {
  const step = stepFor(unit)
  const existing = items.find((i) => i.id === id)
  if (!existing) {
    return deltaSteps > 0 ? [...items, { id, qty: normalizeQty(deltaSteps * step, unit) }] : items
  }
  const next = existing.qty + deltaSteps * step
  if (next < step - 1e-9) return removeItem(items, id)
  return items.map((i) => (i.id === id ? { ...i, qty: normalizeQty(next, unit) } : i))
}

export const removeItem = (items, id) => items.filter((i) => i.id !== id)

// Lo que vuelve desde localStorage no es de fiar: se descarta lo que no sirva.
export function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const out = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const id = typeof entry.id === 'string' ? entry.id.trim() : ''
    const qty = Number(entry.qty)
    if (!id || id.length > 80 || seen.has(id) || !Number.isFinite(qty) || qty <= 0) continue
    seen.add(id)
    out.push({ id, qty })
    if (out.length >= MAX_LINES) break
  }
  return out
}

// Líneas con subtotal, total estimado y cantidad de productos. Los no disponibles se muestran
// pero no suman; los que ya no existen en el menú se informan en `missing`.
export function summarize(items, products) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines = []
  const missing = []
  let total = 0
  let count = 0
  for (const item of items) {
    const product = byId.get(item.id)
    if (!product) {
      missing.push(item.id)
      continue
    }
    const unavailable = product.available === false
    const subtotal = Math.round(Number(product.price) * item.qty)
    lines.push({ product, qty: item.qty, unit: product.unit || 'kg', subtotal, unavailable })
    if (!unavailable) {
      total += subtotal
      count += 1
    }
  }
  return { lines, total, count, missing }
}

// Textos del mensaje. Los nombres de los productos van SIEMPRE en español: lo lee quien despacha.
const MESSAGE = {
  es: {
    intro: (shop) => `Hola ${shop} 👋 Quiero hacer este pedido:`,
    total: 'Total estimado',
    note: '(El valor final se confirma al pesar.)',
    name: 'Nombre',
    comments: 'Comentarios',
  },
  en: {
    intro: (shop) => `Hello ${shop} 👋 I'd like to place this order:`,
    total: 'Estimated total',
    note: '(The final amount is confirmed when weighed.)',
    name: 'Name',
    comments: 'Notes',
  },
}

const clean = (text, max) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

export function buildWhatsAppMessage({ lines, total, shopName = 'Carnicería Mincho', lang = 'es', name, note }) {
  const m = MESSAGE[lang] || MESSAGE.es
  const rows = lines
    .filter((l) => !l.unavailable)
    .map((l) => `• ${formatQuantity(l.qty, l.unit, lang)} ${l.product.name} — ${formatCLP(l.subtotal)}`)

  const parts = [m.intro(shopName), '', ...rows, '', `${m.total}: ${formatCLP(total)}`, m.note]
  const who = clean(name, MAX_NAME)
  const comments = clean(note, MAX_NOTE)
  if (who || comments) parts.push('')
  if (who) parts.push(`${m.name}: ${who}`)
  if (comments) parts.push(`${m.comments}: ${comments}`)
  return parts.join('\n')
}

export function buildWhatsAppUrl(phone, message) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`
}
