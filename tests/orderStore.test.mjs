import test from 'node:test'
import assert from 'node:assert/strict'

// localStorage y window simulados (el almacén solo los usa al ejecutar sus funciones)
function installBrowser(initial = {}) {
  const data = { ...initial }
  const listeners = {}
  globalThis.window = {
    localStorage: {
      getItem: (k) => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v) },
      removeItem: (k) => { delete data[k] },
    },
    addEventListener: (type, fn) => { (listeners[type] ||= new Set()).add(fn) },
    removeEventListener: (type, fn) => { listeners[type]?.delete(fn) },
  }
  return { data, emit: (type, event) => listeners[type]?.forEach((fn) => fn(event)) }
}

// El módulo guarda una caché interna: se importa una instancia nueva por prueba.
let counter = 0
const freshStore = () => import(`../lib/orderStore.js?v=${++counter}`)

test('sin datos guardados el pedido está vacío y es siempre la misma referencia', async () => {
  installBrowser()
  const s = await freshStore()
  assert.deepEqual(s.getItems(), [])
  assert.equal(s.getItems(), s.getItems())
})

test('setItems guarda en localStorage y getItems lo devuelve', async () => {
  const { data } = installBrowser()
  const s = await freshStore()
  s.setItems([{ id: 'lomo', qty: 1.5 }])
  assert.deepEqual(s.getItems(), [{ id: 'lomo', qty: 1.5 }])
  assert.deepEqual(JSON.parse(data['mincho-order']), [{ id: 'lomo', qty: 1.5 }])
})

test('vaciar el pedido borra la clave guardada', async () => {
  const { data } = installBrowser()
  const s = await freshStore()
  s.setItems([{ id: 'lomo', qty: 1 }])
  s.setItems([])
  assert.equal('mincho-order' in data, false)
  assert.deepEqual(s.getItems(), [])
})

test('al cargar, lee lo guardado y descarta lo corrupto', async () => {
  installBrowser({ 'mincho-order': JSON.stringify([{ id: 'a', qty: 2 }, { id: '', qty: 1 }, 'basura']) })
  const s = await freshStore()
  assert.deepEqual(s.getItems(), [{ id: 'a', qty: 2 }])
})

test('un JSON ilegible en localStorage no rompe nada', async () => {
  installBrowser({ 'mincho-order': '{no es json' })
  const s = await freshStore()
  assert.deepEqual(s.getItems(), [])
})

test('si localStorage falla (modo privado) el pedido sigue funcionando en memoria', async () => {
  installBrowser()
  globalThis.window.localStorage.setItem = () => { throw new Error('cuota') }
  const s = await freshStore()
  assert.doesNotThrow(() => s.setItems([{ id: 'a', qty: 1 }]))
  assert.deepEqual(s.getItems(), [{ id: 'a', qty: 1 }])
})

test('los suscriptores se enteran de cada cambio y dejan de enterarse al cancelar', async () => {
  installBrowser()
  const s = await freshStore()
  let llamadas = 0
  const cancelar = s.subscribe(() => { llamadas++ })
  s.setItems([{ id: 'a', qty: 1 }])
  s.setItems([{ id: 'a', qty: 2 }])
  assert.equal(llamadas, 2)
  cancelar()
  s.setItems([])
  assert.equal(llamadas, 2)
})

test('un cambio hecho en otra pestaña actualiza el pedido', async () => {
  const browser = installBrowser()
  const s = await freshStore()
  let llamadas = 0
  s.subscribe(() => { llamadas++ })
  browser.data['mincho-order'] = JSON.stringify([{ id: 'z', qty: 3 }])
  browser.emit('storage', { key: 'mincho-order' })
  assert.equal(llamadas, 1)
  assert.deepEqual(s.getItems(), [{ id: 'z', qty: 3 }])
})

test('en el servidor (sin window) el pedido es vacío', async () => {
  delete globalThis.window
  const s = await freshStore()
  assert.deepEqual(s.getServerItems(), [])
  assert.deepEqual(s.getItems(), [])
})
