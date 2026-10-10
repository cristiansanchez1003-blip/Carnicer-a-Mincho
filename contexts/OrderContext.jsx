'use client'

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react'
import { getItems, getServerItems, setItems, subscribe } from '@/lib/orderStore'
import { addItem, changeQty, normalizeQty, removeItem } from '@/lib/order'

const OrderContext = createContext(null)

// Pedido del cliente (producto + cantidad), guardado en su navegador, y el estado del panel
// "Mi pedido". Los precios no se guardan: se calculan siempre con el menú vigente.
export function OrderProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getItems, getServerItems)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const value = useMemo(() => {
    // Fija la cantidad exacta de un producto (agrega o reemplaza)
    const setQty = (id, qty, unit) => {
      const current = getItems()
      const q = normalizeQty(qty, unit)
      setItems(
        current.some((i) => i.id === id)
          ? current.map((i) => (i.id === id ? { ...i, qty: q } : i))
          : [...current, { id, qty: q }]
      )
    }
    return {
      items,
      count: items.length,
      qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
      add: (id, qty, unit) => setItems(addItem(getItems(), id, qty, unit)),
      setQty,
      setMany: (entries) => entries.forEach((e) => setQty(e.id, e.qty, e.unit)),
      change: (id, deltaSteps, unit) => setItems(changeQty(getItems(), id, deltaSteps, unit)),
      remove: (id) => setItems(removeItem(getItems(), id)),
      clear: () => setItems([]),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }
  }, [items, drawerOpen])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder debe usarse dentro de <OrderProvider>')
  return ctx
}
