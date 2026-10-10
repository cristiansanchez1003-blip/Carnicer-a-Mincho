import test from 'node:test'
import assert from 'node:assert/strict'
import { HIGHLIGHTS, HIGHLIGHT_LABELS, FEATURED_ID, FEATURED_CATEGORY, isHighlight, highlightLabel, featuredProducts } from '../lib/highlights.js'

const cats = [
  { id: 'vacuno', sort: 1 },
  { id: 'cerdo', sort: 2 },
]

test('hay tres etiquetas y cada una tiene texto en español e inglés', () => {
  assert.deepEqual(HIGHLIGHTS, ['new', 'today', 'star'])
  for (const key of HIGHLIGHTS) {
    assert.ok(HIGHLIGHT_LABELS.es[key], `es ${key}`)
    assert.ok(HIGHLIGHT_LABELS.en[key], `en ${key}`)
  }
})

test('isHighlight y highlightLabel', () => {
  assert.equal(isHighlight('star'), true)
  assert.equal(isHighlight(''), false)
  assert.equal(isHighlight('oferta'), false)
  assert.equal(highlightLabel('new', 'es'), 'Recién llegado')
  assert.equal(highlightLabel('new', 'en'), 'Just arrived')
  assert.equal(highlightLabel('nada', 'es'), '')
})

test('la categoría virtual tiene nombre en ambos idiomas y un id que no choca con las reales', () => {
  assert.equal(FEATURED_CATEGORY.id, FEATURED_ID)
  assert.ok(FEATURED_CATEGORY.name && FEATURED_CATEGORY.name_en && FEATURED_CATEGORY.emoji)
  assert.ok(!cats.some((c) => c.id === FEATURED_ID))
})

test('featuredProducts: solo los destacados disponibles, ordenados por categoría y posición', () => {
  const products = [
    { id: 'a', categoryId: 'cerdo', sort: 1, highlight: 'star' },
    { id: 'b', categoryId: 'vacuno', sort: 5, highlight: 'new' },
    { id: 'c', categoryId: 'vacuno', sort: 2, highlight: 'today' },
    { id: 'd', categoryId: 'vacuno', sort: 1 }, // sin destacar
    { id: 'e', categoryId: 'vacuno', sort: 3, highlight: 'star', available: false }, // agotado
    { id: 'f', categoryId: 'vacuno', sort: 4, highlight: 'oferta' }, // etiqueta inválida
  ]
  assert.deepEqual(featuredProducts(products, cats).map((p) => p.id), ['c', 'b', 'a'])
})

test('featuredProducts: sin destacados devuelve vacío y no modifica la lista original', () => {
  const products = [{ id: 'a', categoryId: 'vacuno' }]
  assert.deepEqual(featuredProducts(products, cats), [])
  const withOne = [{ id: 'z', categoryId: 'cerdo', highlight: 'star' }, { id: 'y', categoryId: 'vacuno', highlight: 'star' }]
  const copy = [...withOne]
  featuredProducts(withOne, cats)
  assert.deepEqual(withOne, copy)
})
