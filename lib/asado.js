// Calculadora de asado: según cuántas personas son, sugiere cuántos kilos pedir y cómo repartirlos
// entre cortes que EXISTEN y están disponibles en el menú. No inventa productos ni ofertas.
//
// Los supuestos de abajo (gramos por persona, reparto y cortes preferidos) son una referencia
// editorial pensada para validar con la carnicería; se cambian aquí, en un solo lugar.

export const GRAMS = { adult: 400, adultBig: 500, kid: 200 }
const MAX_PEOPLE = 100
const HALF_KG_IN_GRAMS = 500

// Reparto del total y cortes preferidos (en orden). `pick` = cuántos cortes del grupo se sugieren.
const MIX = [
  {
    key: 'vacuno',
    share: 0.6,
    pick: 2,
    pickWeights: [0.6, 0.4],
    prefer: ['asado de tira', 'lomo vetado', 'entrana', 'punta picana', 'tapabarriga', 'punta de ganso'],
    categories: ['vacuno'],
  },
  { key: 'cerdo', share: 0.15, pick: 1, prefer: ['costillar', 'chuleta vetada'], categories: ['cerdo'] },
  { key: 'embutidos', share: 0.15, pick: 1, prefer: ['longaniza', 'prieta', 'chunchules'], categories: ['embutidos'] },
  { key: 'pollo', share: 0.1, pick: 1, prefer: ['trutro entero', 'pechuga entera'], categories: ['pollo-ave', 'pollo'] },
]

// Para comparar nombres sin importar tildes ni mayúsculas ("Entraña" = "ENTRANA")
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const people = (n) => {
  const v = Math.floor(Number(n))
  return Number.isFinite(v) && v > 0 ? Math.min(v, MAX_PEOPLE) : 0
}

// Kilos totales de carne, redondeados hacia arriba a medio kilo. 0 si no hay personas.
export function targetKg({ adults, kids, appetite }) {
  const perAdult = appetite === 'big' ? GRAMS.adultBig : GRAMS.adult
  const grams = people(adults) * perAdult + people(kids) * GRAMS.kid
  if (grams === 0) return 0
  return Math.ceil(grams / HALF_KG_IN_GRAMS) * 0.5
}

// Reparte `units` medios kilos entre los pesos dados (método del mayor resto).
function allocate(weights, units) {
  const total = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / total) * units)
  const out = raw.map(Math.floor)
  let left = units - out.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, rest: r - Math.floor(r) }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
  for (const { i } of order) {
    if (left <= 0) break
    out[i] += 1
    left -= 1
  }
  return out
}

// { totalKg, items: [{ product, group, kg, subtotal }], estimatedTotal }
export function planAsado(input, products) {
  const totalKg = targetKg(input)
  const empty = { totalKg, items: [], estimatedTotal: 0 }
  if (!totalKg) return empty

  const candidates = products.filter((p) => p.available !== false && (!p.unit || p.unit === 'kg'))
  const used = new Set()
  const picks = []

  for (const group of MIX) {
    const chosen = []
    for (const term of group.prefer) {
      if (chosen.length >= group.pick) break
      const found = candidates.find((p) => !used.has(p.id) && norm(p.name).includes(norm(term)))
      if (found) {
        used.add(found.id)
        chosen.push(found)
      }
    }
    if (!chosen.length) {
      const fallback = candidates.find((p) => !used.has(p.id) && group.categories.includes(p.categoryId))
      if (fallback) {
        used.add(fallback.id)
        chosen.push(fallback)
      }
    }
    const rel = chosen.map((_, i) => group.pickWeights?.[i] ?? 1)
    const relSum = rel.reduce((a, b) => a + b, 0)
    chosen.forEach((product, i) => {
      picks.push({ product, group: group.key, weight: group.share * (rel[i] / relSum) })
    })
  }
  if (!picks.length) return empty

  const units = allocate(picks.map((p) => p.weight), Math.round(totalKg * 2))
  const items = picks
    .map((p, i) => ({ product: p.product, group: p.group, kg: units[i] / 2 }))
    .filter((item) => item.kg > 0)
    .map((item) => ({ ...item, subtotal: Math.round(Number(item.product.price) * item.kg) }))

  return { totalKg, items, estimatedTotal: items.reduce((sum, i) => sum + i.subtotal, 0) }
}
