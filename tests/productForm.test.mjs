import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProductForm, normalizeProductForm } from '../lib/productForm.js'

const cats = [{ id: 'vacuno', name: 'Vacuno' }]

test('al abrir un producto existente se conservan los campos extra, como la traducción al inglés', () => {
  const form = buildProductForm(
    { id: 'a', categoryId: 'vacuno', name: 'Filete', price: 1000, name_en: 'Tenderloin (Filete)', description_en: 'Tender.', campoNuevo: 42 },
    cats
  )
  assert.equal(form.name_en, 'Tenderloin (Filete)')
  assert.equal(form.description_en, 'Tender.')
  assert.equal(form.campoNuevo, 42)
})

test('un producto nuevo parte con valores por defecto razonables', () => {
  const form = buildProductForm({}, cats)
  assert.match(form.id, /^n\d+$/)
  assert.equal(form.categoryId, 'vacuno')
  assert.equal(form.unit, 'kg')
  assert.equal(form.available, true)
  assert.equal(form.price, '')
  assert.equal(form.name_en, '')
})

test('al guardar, el precio queda entero y los textos sin espacios sobrantes', () => {
  const out = normalizeProductForm({ id: 'a', name: '  Lomo  ', description: ' rico ', price: '12990.4', name_en: '', description_en: '' })
  assert.equal(out.price, 12990)
  assert.equal(out.name, 'Lomo')
  assert.equal(out.description, 'rico')
})

test('los campos en inglés vacíos no se guardan, pero los completos sí', () => {
  const vacio = normalizeProductForm({ id: 'a', name: 'x', price: 1, name_en: '  ', description_en: '' })
  assert.equal('name_en' in vacio, false)
  assert.equal('description_en' in vacio, false)
  const lleno = normalizeProductForm({ id: 'a', name: 'x', price: 1, name_en: ' Ribeye ', description_en: ' Juicy. ' })
  assert.equal(lleno.name_en, 'Ribeye')
  assert.equal(lleno.description_en, 'Juicy.')
})

test('un precio ilegible se guarda como 0 en vez de NaN', () => {
  assert.equal(normalizeProductForm({ id: 'a', name: 'x', price: 'abc' }).price, 0)
})

test('el destacado se conserva al editar y un producto sin destacar no guarda el campo', () => {
  const form = buildProductForm({ id: 'a', categoryId: 'vacuno', name: 'Filete', price: 1, highlight: 'star' }, cats)
  assert.equal(form.highlight, 'star')
  assert.equal(normalizeProductForm(form).highlight, 'star')

  const plain = buildProductForm({ id: 'b', categoryId: 'vacuno', name: 'Lomo', price: 1 }, cats)
  assert.equal(plain.highlight, '')
  assert.equal('highlight' in normalizeProductForm(plain), false)
  // el usuario elige "Sin destacar" en un producto que antes lo estaba
  assert.equal('highlight' in normalizeProductForm({ ...form, highlight: '' }), false)
})
