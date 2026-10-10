import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeQty,
  stepFor,
  addItem,
  changeQty,
  removeItem,
  sanitizeItems,
  summarize,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '../lib/order.js'

const products = [
  { id: 'lomo', name: 'Lomo vetado', name_en: 'Ribeye (Lomo Vetado)', price: 19798, unit: 'kg', available: true },
  { id: 'longa', name: 'Longanizas', name_en: 'Longaniza Sausages', price: 7998, unit: 'kg', available: true },
  { id: 'huevos', name: 'Huevos', price: 3490, unit: 'docena', available: true },
  { id: 'agotado', name: 'Prieta', price: 6000, unit: 'kg', available: false },
]

test('el paso de cantidad es de 0,5 kg y de 1 para unidades y docenas', () => {
  assert.equal(stepFor('kg'), 0.5)
  assert.equal(stepFor('un'), 1)
  assert.equal(stepFor('docena'), 1)
})

test('normalizeQty redondea al paso y respeta mínimo y máximo', () => {
  assert.equal(normalizeQty(0.3, 'kg'), 0.5)
  assert.equal(normalizeQty(0.76, 'kg'), 1)
  assert.equal(normalizeQty(1.25, 'kg'), 1.5)
  assert.equal(normalizeQty(1000, 'kg'), 50)
  assert.equal(normalizeQty('abc', 'kg'), 0.5)
  assert.equal(normalizeQty(2.4, 'un'), 2)
  assert.equal(normalizeQty(0, 'un'), 1)
})

test('addItem agrega un producto nuevo y acumula si ya estaba', () => {
  let items = addItem([], 'lomo', 1, 'kg')
  assert.deepEqual(items, [{ id: 'lomo', qty: 1 }])
  items = addItem(items, 'lomo', 1.5, 'kg')
  assert.deepEqual(items, [{ id: 'lomo', qty: 2.5 }])
})

test('addItem no modifica la lista original', () => {
  const original = [{ id: 'lomo', qty: 1 }]
  addItem(original, 'longa', 1, 'kg')
  assert.deepEqual(original, [{ id: 'lomo', qty: 1 }])
})

test('changeQty sube y baja de a un paso y quita el producto al bajar del mínimo', () => {
  let items = [{ id: 'lomo', qty: 1 }]
  items = changeQty(items, 'lomo', 1, 'kg') // +1 paso = +0,5
  assert.deepEqual(items, [{ id: 'lomo', qty: 1.5 }])
  items = changeQty(items, 'lomo', -1, 'kg')
  items = changeQty(items, 'lomo', -1, 'kg')
  assert.deepEqual(items, [{ id: 'lomo', qty: 0.5 }])
  items = changeQty(items, 'lomo', -1, 'kg')
  assert.deepEqual(items, [])
})

test('changeQty respeta el máximo', () => {
  assert.deepEqual(changeQty([{ id: 'lomo', qty: 50 }], 'lomo', 1, 'kg'), [{ id: 'lomo', qty: 50 }])
})

test('removeItem quita solo ese producto', () => {
  assert.deepEqual(removeItem([{ id: 'a', qty: 1 }, { id: 'b', qty: 2 }], 'a'), [{ id: 'b', qty: 2 }])
})

test('sanitizeItems descarta datos corruptos que pudieran venir del navegador', () => {
  const raw = [
    { id: 'lomo', qty: 2 },
    { id: 'lomo', qty: 5 }, // repetido
    { id: '', qty: 1 },
    { id: 'x', qty: -3 },
    { id: 'y', qty: 'mucho' },
    null,
    'texto',
    { id: 'longa', qty: '1.5' },
  ]
  assert.deepEqual(sanitizeItems(raw), [{ id: 'lomo', qty: 2 }, { id: 'longa', qty: 1.5 }])
  assert.deepEqual(sanitizeItems('no es lista'), [])
  assert.deepEqual(sanitizeItems(undefined), [])
})

test('sanitizeItems limita el largo de la lista', () => {
  const raw = Array.from({ length: 500 }, (_, i) => ({ id: `p${i}`, qty: 1 }))
  assert.equal(sanitizeItems(raw).length, 100)
})

test('summarize calcula subtotales, total y cantidad de productos', () => {
  const s = summarize([{ id: 'lomo', qty: 2 }, { id: 'longa', qty: 1.5 }], products)
  assert.equal(s.lines.length, 2)
  assert.equal(s.lines[0].subtotal, 39596)
  assert.equal(s.lines[1].subtotal, 11997) // 7998 * 1,5
  assert.equal(s.total, 51593)
  assert.equal(s.count, 2)
})

test('summarize deja fuera de la cuenta los productos no disponibles y avisa de los que ya no existen', () => {
  const s = summarize([{ id: 'agotado', qty: 1 }, { id: 'lomo', qty: 1 }, { id: 'fantasma', qty: 1 }], products)
  assert.equal(s.total, 19798)
  assert.equal(s.count, 1)
  assert.equal(s.lines.find((l) => l.product.id === 'agotado').unavailable, true)
  assert.deepEqual(s.missing, ['fantasma'])
})

test('summarize funciona con docenas', () => {
  const s = summarize([{ id: 'huevos', qty: 2 }], products)
  assert.equal(s.total, 6980)
})

const shop = 'Carnicería Mincho'

test('el mensaje en español lista cantidad, nombre y subtotal, y el total estimado', () => {
  const s = summarize([{ id: 'lomo', qty: 2 }, { id: 'longa', qty: 1.5 }], products)
  const msg = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'es' })
  assert.match(msg, /Hola Carnicería Mincho/)
  assert.match(msg, /• 2 kg Lomo vetado — \$39\.596/)
  assert.match(msg, /• 1,5 kg Longanizas — \$11\.997/)
  assert.match(msg, /Total estimado: \$51\.593/)
  assert.match(msg, /se confirma al pesar/)
})

test('el mensaje en inglés usa formato inglés pero los nombres de los productos siguen en español', () => {
  const s = summarize([{ id: 'lomo', qty: 1.5 }], products)
  const msg = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'en' })
  assert.match(msg, /Hello Carnicería Mincho/)
  assert.match(msg, /• 1\.5 kg Lomo vetado — \$29\.697/)
  assert.doesNotMatch(msg, /Ribeye/)
  assert.match(msg, /Estimated total: \$29\.697/)
})

test('el mensaje incluye nombre y comentarios solo si se escribieron', () => {
  const s = summarize([{ id: 'lomo', qty: 1 }], products)
  const sin = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'es' })
  assert.doesNotMatch(sin, /Nombre:|Comentarios:/)
  const con = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'es', name: ' Juan ', note: ' corte grueso ' })
  assert.match(con, /Nombre: Juan/)
  assert.match(con, /Comentarios: corte grueso/)
})

test('el mensaje acota nombre y comentarios muy largos', () => {
  const s = summarize([{ id: 'lomo', qty: 1 }], products)
  const msg = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'es', name: 'n'.repeat(500), note: 'c'.repeat(2000) })
  assert.ok(msg.length < 800, `largo ${msg.length}`)
})

test('el mensaje no incluye productos no disponibles', () => {
  const s = summarize([{ id: 'agotado', qty: 1 }, { id: 'lomo', qty: 1 }], products)
  const msg = buildWhatsAppMessage({ ...s, shopName: shop, lang: 'es' })
  assert.doesNotMatch(msg, /Prieta/)
  assert.match(msg, /Lomo vetado/)
})

test('buildWhatsAppUrl codifica el mensaje y se puede decodificar de vuelta', () => {
  const msg = 'Hola 👋\n• 2 kg Lomo & más — $39.596'
  const url = buildWhatsAppUrl('56974543692', msg)
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=56974543692&text='))
  assert.equal(decodeURIComponent(url.split('&text=')[1]), msg)
})

test('buildWhatsAppUrl solo deja números en el teléfono', () => {
  assert.ok(buildWhatsAppUrl('+56 9 7454 3692', 'x').includes('phone=56974543692'))
})
