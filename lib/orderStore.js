import { ORDER_STORAGE_KEY, sanitizeItems } from './order.js'

// Almacén del pedido en el navegador (localStorage), con el contrato que pide React para
// useSyncExternalStore: getItems devuelve SIEMPRE la misma referencia hasta que algo cambia.
// Si localStorage no está disponible (modo privado) el pedido sigue funcionando en memoria.

const EMPTY = []
const listeners = new Set()
let cache = null

function read() {
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY)
    if (!raw) return EMPTY
    const items = sanitizeItems(JSON.parse(raw))
    return items.length ? items : EMPTY
  } catch {
    return EMPTY
  }
}

export function getItems() {
  if (typeof window === 'undefined') return EMPTY
  if (cache === null) cache = read()
  return cache
}

// En el servidor y durante la hidratación el pedido siempre está vacío.
export const getServerItems = () => EMPTY

export function setItems(items) {
  cache = items.length ? items : EMPTY
  try {
    if (items.length) window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(items))
    else window.localStorage.removeItem(ORDER_STORAGE_KEY)
  } catch {
    // sin almacenamiento persistente: se mantiene solo en memoria
  }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener) {
  listeners.add(listener)
  // Cambios hechos desde otra pestaña
  const onStorage = (event) => {
    if (event.key === ORDER_STORAGE_KEY || event.key === null) {
      cache = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}
