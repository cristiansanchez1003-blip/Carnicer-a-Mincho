import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCLP, formatPrice, formatQuantity, formatDate } from '../lib/format.js'

test('formatCLP usa punto de miles chileno', () => {
  assert.equal(formatCLP(12990), '$12.990')
  assert.equal(formatCLP(0), '$0')
})

test('formatPrice con unidad, en español y en inglés', () => {
  assert.equal(formatPrice(12990, 'kg'), '$12.990 /kg')
  assert.equal(formatPrice(7990, 'un'), '$7.990 c/u')
  assert.equal(formatPrice(7990, 'un', 'en'), '$7.990 each')
  assert.equal(formatPrice(3490, 'docena'), '$3.490 /docena')
  assert.equal(formatPrice(3490, 'docena', 'en'), '$3.490 /dozen')
  assert.equal(formatPrice(5000), '$5.000')
})

test('formatQuantity de kilos usa coma en español y punto en inglés', () => {
  assert.equal(formatQuantity(1.5, 'kg', 'es'), '1,5 kg')
  assert.equal(formatQuantity(1.5, 'kg', 'en'), '1.5 kg')
  assert.equal(formatQuantity(2, 'kg', 'es'), '2 kg')
  assert.equal(formatQuantity(0.5, 'kg', 'es'), '0,5 kg')
})

test('formatQuantity de unidades y docenas', () => {
  assert.equal(formatQuantity(3, 'un', 'es'), '3 un.')
  assert.equal(formatQuantity(3, 'un', 'en'), '3 pcs')
  assert.equal(formatQuantity(1, 'docena', 'es'), '1 docena')
  assert.equal(formatQuantity(2, 'docena', 'es'), '2 docenas')
  assert.equal(formatQuantity(2, 'docena', 'en'), '2 dozen')
})

test('formatDate muestra la fecha sin desfase de zona horaria', () => {
  assert.equal(formatDate('2026-10-10', 'es'), '10 de octubre de 2026')
  assert.equal(formatDate('2026-10-10', 'en'), 'October 10, 2026')
  assert.equal(formatDate('2026-01-01', 'es'), '1 de enero de 2026')
})

test('formatDate devuelve vacío si la fecha no es válida', () => {
  assert.equal(formatDate('', 'es'), '')
  assert.equal(formatDate('no es fecha', 'es'), '')
  assert.equal(formatDate(undefined, 'en'), '')
})

import { todayISO } from '../lib/format.js'

test('todayISO entrega la fecha de hoy en Chile, no la de UTC', () => {
  // 02:30 UTC del 11 de octubre = 23:30 del 10 de octubre en Santiago
  assert.equal(todayISO(new Date('2026-10-11T02:30:00Z')), '2026-10-10')
  assert.equal(todayISO(new Date('2026-10-11T15:00:00Z')), '2026-10-11')
})
