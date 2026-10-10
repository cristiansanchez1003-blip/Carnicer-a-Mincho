import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeText, isSearching, searchProducts } from '../lib/search.js'

const P = (id, name, extra = {}) => ({ id, name, ...extra })
const products = [
  P('lomo-vetado', 'Lomo vetado', { name_en: 'Ribeye', description: 'Marmoleado, ideal para parrilla', description_en: 'Marbled, great for grilling' }),
  P('lomo-liso', 'Lomo liso', { name_en: 'Strip Loin', description: 'Tierno, con poca grasa' }),
  P('costillar', 'Costillar de cerdo', { name_en: 'Pork ribs', description: 'Para el horno o la parrilla' }),
  P('longaniza', 'Longaniza de Chillán', { description: 'Embutido ahumado' }),
  P('pollo-ganso', 'Pollo ganso', { name_en: 'Eye of Round', description: 'Corte magro para el horno' }),
]
const ids = (r) => r.map((p) => p.id)

test('normalizeText ignora tildes, mayúsculas y espacios de más', () => {
  assert.equal(normalizeText('  LONGANIZA   de Chillán '), 'longaniza de chillan')
  assert.equal(normalizeText('Ñandú'), 'nandu')
  assert.equal(normalizeText(null), '')
  assert.equal(normalizeText(undefined), '')
})

test('isSearching exige al menos 2 letras', () => {
  assert.equal(isSearching(''), false)
  assert.equal(isSearching(' a '), false)
  assert.equal(isSearching('lo'), true)
})

test('sin texto suficiente no hay resultados', () => {
  assert.deepEqual(searchProducts(products, ''), [])
  assert.deepEqual(searchProducts(products, 'l'), [])
})

test('encuentra por nombre sin importar tildes ni mayúsculas', () => {
  assert.deepEqual(ids(searchProducts(products, 'CHILLAN')), ['longaniza'])
  assert.deepEqual(ids(searchProducts(products, 'longaníza')), ['longaniza'])
})

test('encuentra por el nombre en inglés', () => {
  assert.deepEqual(ids(searchProducts(products, 'ribeye')), ['lomo-vetado'])
  assert.deepEqual(ids(searchProducts(products, 'eye of round')), ['pollo-ganso'])
})

test('encuentra por la descripción', () => {
  assert.deepEqual(ids(searchProducts(products, 'ahumado')), ['longaniza'])
})

test('todas las palabras deben aparecer (en cualquier orden)', () => {
  assert.deepEqual(ids(searchProducts(products, 'vetado lomo')), ['lomo-vetado'])
  assert.deepEqual(ids(searchProducts(products, 'lomo ahumado')), [])
})

test('los que coinciden en el nombre salen antes que los que solo coinciden en la descripción', () => {
  // "parrilla" está en la descripción de dos productos; "lomo" en el nombre de dos
  assert.deepEqual(ids(searchProducts(products, 'parrilla')), ['lomo-vetado', 'costillar'])
  // "horno": costillar y pollo ganso solo por descripción → orden original
  assert.deepEqual(ids(searchProducts(products, 'horno')), ['costillar', 'pollo-ganso'])
  const mixed = [P('a', 'Carne para guiso', { description: 'sin lomo' }), P('b', 'Lomo liso')]
  assert.deepEqual(ids(searchProducts(mixed, 'lomo')), ['b', 'a'])
})

test('una búsqueda sin coincidencias devuelve vacío', () => {
  assert.deepEqual(searchProducts(products, 'sushi'), [])
})

test('productos sin descripción ni nombre en inglés no rompen la búsqueda', () => {
  assert.deepEqual(ids(searchProducts([P('x', 'Chorizo')], 'chori')), ['x'])
})
