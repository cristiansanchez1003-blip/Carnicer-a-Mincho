'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdmin } from '@/hooks/useAdmin'
import AdminHeader from '@/components/admin/AdminHeader'
import ProductForm from '@/components/admin/ProductForm'
import ProductTable from '@/components/admin/ProductTable'
import SettingsForm from '@/components/admin/SettingsForm'
import CategoryManager from '@/components/admin/CategoryManager'
import QRSection from '@/components/admin/QRSection'

const TABS = [
  { id: 'productos', label: 'Productos', emoji: '🍽️' },
  { id: 'ajustes', label: 'Ajustes', emoji: '⚙️' },
  { id: 'qr', label: 'Código QR', emoji: '🔳' },
]

export default function DashboardPage() {
  const {
    menu,
    loading,
    saving,
    dirty,
    error,
    save,
    uploadImage,
    saveProduct,
    deleteProduct,
    toggleAvailable,
    moveProduct,
    saveCategory,
    deleteCategory,
    saveSettings,
  } = useAdmin()

  const [tab, setTab] = useState('productos')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [editing, setEditing] = useState(null) // producto en edición o {} para nuevo
  const [toast, setToast] = useState(null)

  const categories = useMemo(
    () => [...(menu?.categories || [])].sort((a, b) => (a.sort || 0) - (b.sort || 0)),
    [menu]
  )

  const filteredByCategory = useMemo(() => {
    const products = menu?.products || []
    const q = search.trim().toLowerCase()
    const visibleCats = categories.filter((c) => filterCat === 'all' || c.id === filterCat)
    return visibleCats
      .map((cat) => ({
        cat,
        items: products
          .filter((p) => p.categoryId === cat.id)
          .filter((p) => !q || p.name.toLowerCase().includes(q))
          .sort((a, b) => (a.sort || 0) - (b.sort || 0)),
      }))
      .filter(({ items }) => items.length > 0)
  }, [menu, categories, search, filterCat])

  function showToast(message, ok = true) {
    setToast({ message, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSave() {
    const result = await save()
    if (result.ok) {
      showToast('✓ Cambios guardados. Visibles en el menú en unos segundos.')
    } else {
      showToast(result.error || 'No se pudo guardar', false)
    }
  }

  function handleDelete(product) {
    if (window.confirm(`¿Eliminar "${product.name}" del menú?`)) {
      deleteProduct(product.id)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-linen border-t-forest" />
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <p className="text-muted">No se pudo cargar el menú. Recarga la página.</p>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-xl border border-linen bg-card px-4 py-2.5 text-[14.5px] text-ink shadow-card outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'

  return (
    <div className="min-h-screen bg-paper pb-24">
      <AdminHeader dirty={dirty} saving={saving} onSave={handleSave} />

      <div className="mx-auto max-w-3xl px-4">
        {/* Pestañas */}
        <div className="mt-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold transition active:scale-95 ${
                tab === t.id
                  ? 'bg-ink text-mint shadow-nav'
                  : 'border border-linen bg-card text-ink/60'
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'productos' && (
          <div className="mt-5">
            <div className="flex gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto…"
                className={inputCls}
              />
              <button
                onClick={() => setEditing({})}
                className="shrink-0 rounded-xl bg-forest px-4 text-[13.5px] font-bold text-white shadow-nav active:scale-95"
              >
                + Nuevo
              </button>
            </div>

            {/* Filtro por categoría */}
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterCat('all')}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                  filterCat === 'all'
                    ? 'bg-ink text-mint'
                    : 'border border-linen bg-card text-ink/60'
                }`}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(c.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                    filterCat === c.id
                      ? 'bg-ink text-mint'
                      : 'border border-linen bg-card text-ink/60'
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-6">
              {filteredByCategory.length === 0 && (
                <p className="py-10 text-center text-[14px] text-muted">
                  No hay productos que coincidan con la búsqueda.
                </p>
              )}
              {filteredByCategory.map(({ cat, items }) => (
                <div key={cat.id}>
                  <h3 className="mb-2 px-1 font-playfair text-[16px] font-bold text-ink">
                    {cat.emoji} {cat.name}
                    <span className="ml-2 text-[12px] font-normal text-muted">
                      {items.length} productos
                    </span>
                  </h3>
                  <ProductTable
                    products={items}
                    onEdit={setEditing}
                    onToggle={toggleAvailable}
                    onMove={moveProduct}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ajustes' && (
          <div className="mt-5 flex flex-col gap-5">
            <SettingsForm settings={menu.settings} onSave={saveSettings} />
            <CategoryManager
              categories={categories}
              products={menu.products}
              onSave={saveCategory}
              onDelete={deleteCategory}
            />
          </div>
        )}

        {tab === 'qr' && (
          <div className="mt-5">
            <QRSection />
          </div>
        )}
      </div>

      {/* Barra flotante de cambios sin guardar */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="safe-bottom fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 shadow-sheet">
              <span className="text-[13px] font-bold text-white">Tienes cambios sin guardar</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-mint px-4 py-2 text-[13px] font-bold text-ink active:scale-95 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-16 z-50 flex justify-center px-4"
          >
            <div
              className={`rounded-full px-5 py-2.5 text-[13.5px] font-bold shadow-cardHover ${
                toast.ok ? 'bg-forest text-white' : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductForm
        product={editing}
        categories={categories}
        onSave={saveProduct}
        onClose={() => setEditing(null)}
        uploadImage={uploadImage}
      />
    </div>
  )
}
