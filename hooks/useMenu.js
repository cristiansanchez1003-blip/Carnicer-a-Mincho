'use client'

import { useState, useEffect, useCallback } from 'react'

// Hook para la vista pública del menú: trae ajustes, categorías y productos
// desde /api/menu (que lee data/menu.json desde GitHub o local).
export function useMenu() {
  const [settings, setSettings] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/menu')
      if (!res.ok) throw new Error('No se pudo cargar el menú')
      const data = await res.json()
      setSettings(data.settings || null)
      setCategories(
        [...(data.categories || [])].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      )
      setProducts(
        [...(data.products || [])].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      )
    } catch (err) {
      console.error('Error cargando el menú:', err)
      setError(err.message || 'No se pudo cargar el menú.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  return { settings, categories, products, loading, error, refetch: fetchMenu }
}
