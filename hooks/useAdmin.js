'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Hook del panel admin: mantiene una copia editable del menú en memoria
// y la guarda completa mediante PUT /api/admin/menu (commit a GitHub).
export function useAdmin() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState(null)
  const savedSnapshot = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' })
      if (!res.ok) throw new Error('No se pudo cargar el menú')
      const data = await res.json()
      setMenu(data)
      savedSnapshot.current = JSON.stringify(data)
      setDirty(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Aplica un cambio inmutable sobre el menú y marca el estado como "sin guardar".
  const update = useCallback((updater) => {
    setMenu((prev) => {
      const next = updater(structuredClone(prev))
      setDirty(JSON.stringify(next) !== savedSnapshot.current)
      return next
    })
  }, [])

  const save = useCallback(async () => {
    if (!menu) return { ok: false, error: 'Nada que guardar' }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      savedSnapshot.current = JSON.stringify(menu)
      setDirty(false)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }, [menu])

  const uploadImage = useCallback(async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen')
    return data.url
  }, [])

  // --- Operaciones sobre productos ---

  const saveProduct = useCallback(
    (product) => {
      update((m) => {
        const idx = m.products.findIndex((p) => p.id === product.id)
        if (idx >= 0) {
          m.products[idx] = product
        } else {
          const siblings = m.products.filter((p) => p.categoryId === product.categoryId)
          product.sort = Math.max(0, ...siblings.map((p) => p.sort || 0)) + 1
          m.products.push(product)
        }
        return m
      })
    },
    [update]
  )

  const deleteProduct = useCallback(
    (id) => {
      update((m) => {
        m.products = m.products.filter((p) => p.id !== id)
        return m
      })
    },
    [update]
  )

  const toggleAvailable = useCallback(
    (id) => {
      update((m) => {
        const p = m.products.find((x) => x.id === id)
        if (p) p.available = p.available === false ? true : false
        return m
      })
    },
    [update]
  )

  const moveProduct = useCallback(
    (id, direction) => {
      update((m) => {
        const product = m.products.find((p) => p.id === id)
        if (!product) return m
        const siblings = m.products
          .filter((p) => p.categoryId === product.categoryId)
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        const idx = siblings.findIndex((p) => p.id === id)
        const swapWith = siblings[idx + direction]
        if (!swapWith) return m
        const tmp = product.sort
        product.sort = swapWith.sort
        swapWith.sort = tmp
        return m
      })
    },
    [update]
  )

  // --- Operaciones sobre categorías y ajustes ---

  const saveCategory = useCallback(
    (category) => {
      update((m) => {
        const idx = m.categories.findIndex((c) => c.id === category.id)
        if (idx >= 0) {
          m.categories[idx] = category
        } else {
          category.sort = Math.max(0, ...m.categories.map((c) => c.sort || 0)) + 1
          m.categories.push(category)
        }
        return m
      })
    },
    [update]
  )

  const deleteCategory = useCallback(
    (id) => {
      update((m) => {
        m.categories = m.categories.filter((c) => c.id !== id)
        m.products = m.products.filter((p) => p.categoryId !== id)
        return m
      })
    },
    [update]
  )

  const saveSettings = useCallback(
    (settings) => {
      update((m) => {
        m.settings = { ...m.settings, ...settings }
        return m
      })
    },
    [update]
  )

  return {
    menu,
    loading,
    saving,
    dirty,
    error,
    reload: load,
    save,
    uploadImage,
    saveProduct,
    deleteProduct,
    toggleAvailable,
    moveProduct,
    saveCategory,
    deleteCategory,
    saveSettings,
  }
}
