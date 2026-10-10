import test from 'node:test'
import assert from 'node:assert/strict'
import { translations, translate, localizedField } from '../lib/i18n.js'

test('español e inglés tienen exactamente las mismas claves (nada queda sin traducir)', () => {
  const es = Object.keys(translations.es).sort()
  const en = Object.keys(translations.en).sort()
  assert.deepEqual(en.filter((k) => !es.includes(k)), [], 'claves solo en inglés')
  assert.deepEqual(es.filter((k) => !en.includes(k)), [], 'claves solo en español')
})

test('ningún texto del diccionario está vacío', () => {
  for (const lang of ['es', 'en']) {
    for (const [key, value] of Object.entries(translations[lang])) {
      assert.ok(String(value).trim().length > 0, `${lang}.${key} está vacío`)
    }
  }
})

test('translate reemplaza las variables entre llaves', () => {
  assert.equal(translate('es', 'closesAt', { time: '14:00' }), 'cierra a las 14:00')
  assert.equal(translate('en', 'closesAt', { time: '14:00' }), 'closes at 14:00')
})

test('translate acepta varias variables y números', () => {
  assert.equal(translate('es', 'orderCountMany', { n: 3 }), '3 productos')
  assert.equal(translate('en', 'orderCountMany', { n: 3 }), '3 items')
})

test('translate usa el español si falta la clave en el idioma pedido y la clave si no existe en ninguno', () => {
  assert.equal(translate('fr', 'unavailable'), translations.es.unavailable)
  assert.equal(translate('es', 'clave-que-no-existe'), 'clave-que-no-existe')
})

test('todas las variables usadas en español existen también en inglés', () => {
  const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')
  for (const key of Object.keys(translations.es)) {
    assert.equal(vars(translations.en[key]), vars(translations.es[key]), `variables distintas en "${key}"`)
  }
})

test('localizedField prefiere el inglés cuando existe y cae al español si falta', () => {
  const p = { name: 'Filete', name_en: 'Tenderloin (Filete)', description: 'Rico' }
  assert.equal(localizedField(p, 'name', 'en'), 'Tenderloin (Filete)')
  assert.equal(localizedField(p, 'description', 'en'), 'Rico')
  assert.equal(localizedField(p, 'name', 'es'), 'Filete')
  assert.equal(localizedField(null, 'name', 'en'), '')
})
