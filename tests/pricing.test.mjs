import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ROUNDING_STEPS,
  adjustPrice,
  previewAdjustment,
  applyAdjustment,
  validateAdjustment,
} from '../lib/pricing.js'

const products = [
  { id: 'a', name: 'Filete', categoryId: 'vacuno', price: 20798, unit: 'kg', available: true, name_en: 'Tenderloin' },
  { id: 'b', name: 'Lomo', categoryId: 'vacuno', price: 18798, unit: 'kg', available: true },
  { id: 'c', name: 'Costillar', categoryId: 'cerdo', price: 9000, unit: 'kg', available: false },
  { id: 'd', name: 'Pollo', categoryId: 'pollo', price: 300, unit: 'kg', available: true },
]

test('los pasos de redondeo permitidos', () => {
  assert.deepEqual(ROUNDING_STEPS, [1, 10, 50, 100])
})

test('subir un porcentaje', () => {
  assert.equal(adjustPrice(10000, { mode: 'percent', value: 5 }), 10500)
})

test('bajar un porcentaje', () => {
  assert.equal(adjustPrice(20000, { mode: 'percent', value: -10 }), 18000)
})

test('el resultado se redondea al paso elegido', () => {
  // 20798 + 5 % = 21837,9
  assert.equal(adjustPrice(20798, { mode: 'percent', value: 5, step: 1 }), 21838)
  assert.equal(adjustPrice(20798, { mode: 'percent', value: 5, step: 10 }), 21840)
  assert.equal(adjustPrice(20798, { mode: 'percent', value: 5, step: 100 }), 21800)
  assert.equal(adjustPrice(20798, { mode: 'percent', value: 5, step: 50 }), 21850)
})

test('sumar o restar un monto fijo', () => {
  assert.equal(adjustPrice(9000, { mode: 'amount', value: 500 }), 9500)
  assert.equal(adjustPrice(9000, { mode: 'amount', value: -1000 }), 8000)
})

test('un descuento nunca deja un precio negativo', () => {
  assert.equal(adjustPrice(300, { mode: 'amount', value: -500 }), 0)
})

test('acepta el valor como texto (viene de un campo del formulario)', () => {
  assert.equal(adjustPrice(10000, { mode: 'percent', value: '10' }), 11000)
})

test('la vista previa solo incluye los productos del alcance elegido', () => {
  const todos = previewAdjustment(products, { scope: 'all', mode: 'percent', value: 10 })
  assert.equal(todos.rows.length, 4)
  const vacuno = previewAdjustment(products, { scope: 'vacuno', mode: 'percent', value: 10 })
  assert.deepEqual(vacuno.rows.map((r) => r.id), ['a', 'b'])
})

test('la vista previa informa precio anterior, nuevo y diferencia', () => {
  const { rows } = previewAdjustment(products, { scope: 'cerdo', mode: 'percent', value: 10 })
  assert.deepEqual(rows[0], { id: 'c', name: 'Costillar', categoryId: 'cerdo', oldPrice: 9000, newPrice: 9900, delta: 900 })
})

test('la vista previa cuenta cuántos precios cambian de verdad', () => {
  // +1 % sobre 300 con paso 100 sigue en 300: no cambia
  const r = previewAdjustment(products, { scope: 'all', mode: 'percent', value: 1, step: 100 })
  assert.ok(r.unchanged >= 1)
  assert.equal(r.changed + r.unchanged, 4)
})

test('aplicar devuelve productos nuevos sin modificar la lista original', () => {
  const copia = JSON.parse(JSON.stringify(products))
  const out = applyAdjustment(products, { scope: 'vacuno', mode: 'percent', value: 10, step: 10 })
  assert.deepEqual(products, copia, 'la entrada no debe cambiar')
  assert.equal(out.find((p) => p.id === 'a').price, 22880)
  assert.equal(out.find((p) => p.id === 'c').price, 9000, 'otra categoría no se toca')
})

test('aplicar conserva todos los demás campos del producto', () => {
  const out = applyAdjustment(products, { scope: 'all', mode: 'percent', value: 10, step: 10 })
  const a = out.find((p) => p.id === 'a')
  assert.equal(a.name_en, 'Tenderloin')
  assert.equal(a.unit, 'kg')
  assert.equal(out.find((p) => p.id === 'c').available, false)
})

test('validateAdjustment acepta ajustes razonables', () => {
  assert.equal(validateAdjustment({ scope: 'all', mode: 'percent', value: 5, step: 10 }), null)
  assert.equal(validateAdjustment({ scope: 'all', mode: 'amount', value: -500, step: 1 }), null)
})

test('validateAdjustment rechaza valores vacíos, cero, ilegibles o absurdos', () => {
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: 0 }), /valor/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: '' }), /valor/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: 'abc' }), /valor/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: -95 }), /porcentaje/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: 500 }), /porcentaje/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'amount', value: 9999999 }), /monto/i)
})

test('validateAdjustment rechaza modos y redondeos desconocidos', () => {
  assert.match(validateAdjustment({ scope: 'all', mode: 'magia', value: 5 }), /tipo/i)
  assert.match(validateAdjustment({ scope: 'all', mode: 'percent', value: 5, step: 7 }), /redondeo/i)
})
