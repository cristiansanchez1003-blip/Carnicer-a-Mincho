import test from 'node:test'
import assert from 'node:assert/strict'
import { GRAMS, targetKg, planAsado } from '../lib/asado.js'

const P = (id, name, price, categoryId, extra = {}) => ({ id, name, price, categoryId, unit: 'kg', available: true, ...extra })
const menu = [
  P('tira', 'Asado de tira', 12998, 'vacuno'),
  P('vetado', 'Lomo vetado', 19798, 'vacuno'),
  P('entrana', 'Entraña', 17998, 'vacuno'),
  P('costillar', 'Costillar', 8998, 'cerdo'),
  P('longa', 'Longanizas', 7998, 'embutidos'),
  P('trutro', 'Trutro entero', 4498, 'pollo-ave'),
  P('prieta', 'Prieta', 6998, 'embutidos'),
]

const kgOf = (plan) => plan.items.reduce((s, i) => s + i.kg, 0)

test('los gramos de referencia por persona', () => {
  assert.deepEqual(GRAMS, { adult: 400, adultBig: 500, kid: 200 })
})

test('targetKg: 10 adultos con apetito normal necesitan 4 kg', () => {
  assert.equal(targetKg({ adults: 10, kids: 0, appetite: 'normal' }), 4)
})

test('targetKg: apetito grande sube a 500 g por adulto', () => {
  assert.equal(targetKg({ adults: 10, kids: 0, appetite: 'big' }), 5)
})

test('targetKg: los niños cuentan 200 g', () => {
  assert.equal(targetKg({ adults: 8, kids: 4, appetite: 'normal' }), 4)
})

test('targetKg redondea hacia arriba a medio kilo', () => {
  assert.equal(targetKg({ adults: 1, kids: 0, appetite: 'normal' }), 0.5) // 400 g -> 0,5 kg
  assert.equal(targetKg({ adults: 3, kids: 0, appetite: 'normal' }), 1.5) // 1,2 kg -> 1,5 kg
})

test('targetKg con cero personas es cero y no acepta cantidades absurdas', () => {
  assert.equal(targetKg({ adults: 0, kids: 0, appetite: 'normal' }), 0)
  assert.equal(targetKg({ adults: -5, kids: 'x', appetite: 'normal' }), 0)
  assert.equal(targetKg({ adults: 100000, kids: 0, appetite: 'normal' }), targetKg({ adults: 100, kids: 0, appetite: 'normal' }))
})

test('la sugerencia para 10 adultos suma exactamente 4 kg en múltiplos de 0,5', () => {
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, menu)
  assert.equal(plan.totalKg, 4)
  assert.equal(kgOf(plan), 4)
  for (const item of plan.items) assert.equal(item.kg % 0.5, 0, `${item.product.name}: ${item.kg}`)
})

test('la sugerencia reparte entre vacuno, cerdo, embutido y pollo con los cortes preferidos', () => {
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, menu)
  const ids = plan.items.map((i) => i.product.id)
  assert.deepEqual(ids, ['tira', 'vetado', 'costillar', 'longa', 'trutro'])
  const vacuno = plan.items.filter((i) => ['tira', 'vetado'].includes(i.product.id)).reduce((s, i) => s + i.kg, 0)
  assert.ok(vacuno >= 2 && vacuno <= 3, `vacuno ${vacuno} kg`)
})

test('el total estimado es la suma de los subtotales', () => {
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, menu)
  assert.equal(plan.estimatedTotal, plan.items.reduce((s, i) => s + i.subtotal, 0))
  const tira = plan.items.find((i) => i.product.id === 'tira')
  assert.equal(tira.subtotal, Math.round(12998 * tira.kg))
})

test('con pocas personas solo se sugieren los cortes principales', () => {
  const plan = planAsado({ adults: 2, kids: 0, appetite: 'normal' }, menu) // 0,8 kg -> 1 kg
  assert.equal(plan.totalKg, 1)
  assert.equal(kgOf(plan), 1)
  assert.ok(plan.items.length <= 2)
})

test('no sugiere productos no disponibles: pasa al siguiente corte preferido', () => {
  const sinTira = menu.map((p) => (p.id === 'tira' ? { ...p, available: false } : p))
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, sinTira)
  const ids = plan.items.map((i) => i.product.id)
  assert.ok(!ids.includes('tira'))
  assert.ok(ids.includes('vetado') && ids.includes('entrana'))
})

test('reconoce los nombres aunque cambien tildes y mayúsculas', () => {
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, [P('x', 'ENTRAÑA', 1000, 'vacuno')])
  assert.equal(plan.items[0].product.id, 'x')
})

test('si no hay ningún corte preferido usa el primer producto disponible de la categoría', () => {
  const raro = [P('a', 'Corte raro', 5000, 'vacuno'), P('b', 'Otro', 5000, 'cerdo')]
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, raro)
  assert.ok(plan.items.length >= 1)
  assert.equal(kgOf(plan), 4)
})

test('un menú sin productos útiles no entrega sugerencia', () => {
  const plan = planAsado({ adults: 10, kids: 0, appetite: 'normal' }, [P('a', 'Huevos', 3000, 'otros', { unit: 'docena' })])
  assert.deepEqual(plan.items, [])
  assert.equal(plan.estimatedTotal, 0)
})

test('sin personas no hay sugerencia', () => {
  const plan = planAsado({ adults: 0, kids: 0, appetite: 'normal' }, menu)
  assert.equal(plan.totalKg, 0)
  assert.deepEqual(plan.items, [])
})

test('no modifica el menú recibido', () => {
  const copia = JSON.parse(JSON.stringify(menu))
  planAsado({ adults: 10, kids: 2, appetite: 'big' }, menu)
  assert.deepEqual(menu, copia)
})
