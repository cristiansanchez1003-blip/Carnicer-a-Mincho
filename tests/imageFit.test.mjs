import test from 'node:test'
import assert from 'node:assert/strict'
import { fitWithin } from '../lib/imageFit.js'

test('reduce una foto horizontal al lado máximo manteniendo proporción', () => {
  assert.deepEqual(fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 })
})

test('reduce una foto vertical al lado máximo manteniendo proporción', () => {
  assert.deepEqual(fitWithin(3000, 4000, 1600), { width: 1200, height: 1600 })
})

test('no agranda fotos que ya son más chicas que el máximo', () => {
  assert.deepEqual(fitWithin(800, 600, 1600), { width: 800, height: 600 })
})

test('redondea a píxeles enteros', () => {
  assert.deepEqual(fitWithin(4001, 3001, 1600), { width: 1600, height: 1200 })
})

test('una foto cuadrada grande queda cuadrada', () => {
  assert.deepEqual(fitWithin(5000, 5000, 1600), { width: 1600, height: 1600 })
})

test('dimensiones inválidas lanzan error en vez de producir un canvas vacío', () => {
  assert.throws(() => fitWithin(0, 100, 1600), /dimensiones/i)
  assert.throws(() => fitWithin(NaN, 100, 1600), /dimensiones/i)
})
