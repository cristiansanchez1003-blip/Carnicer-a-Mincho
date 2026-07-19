'use client'

import { useState } from 'react'

// Gestión simple de categorías: renombrar, cambiar emoji, agregar y eliminar.
export default function CategoryManager({ categories, products, onSave, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🍽️')

  function slugify(name) {
    return (
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `cat-${Date.now()}`
    )
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    onSave({ id: slugify(newName), name: newName.trim(), emoji: newEmoji || '🍽️' })
    setNewName('')
    setNewEmoji('🍽️')
    setAdding(false)
  }

  const inputCls =
    'rounded-xl border border-linen bg-paper px-3 py-2 text-[14px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'

  return (
    <section className="rounded-2xl border border-linen bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-lg font-bold text-ink">Categorías</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full bg-ink px-3.5 py-2 text-[12.5px] font-bold text-mint active:scale-95"
        >
          {adding ? 'Cancelar' : '+ Nueva'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            className={`${inputCls} w-14 text-center`}
            aria-label="Emoji"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la categoría"
            required
            className={`${inputCls} flex-1`}
          />
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 text-[13px] font-bold text-white active:scale-95"
          >
            Crear
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length
          return (
            <div
              key={cat.id}
              className="flex items-center gap-2 rounded-xl border border-linen bg-paper p-2"
            >
              <input
                type="text"
                value={cat.emoji || ''}
                onChange={(e) => onSave({ ...cat, emoji: e.target.value })}
                className={`${inputCls} w-12 shrink-0 border-transparent bg-transparent text-center`}
                aria-label="Emoji"
              />
              <input
                type="text"
                value={cat.name}
                onChange={(e) => onSave({ ...cat, name: e.target.value })}
                className={`${inputCls} min-w-0 flex-1 border-transparent bg-transparent font-bold`}
                aria-label="Nombre de categoría"
              />
              <span className="shrink-0 rounded-full bg-ink/5 px-2 py-1 text-[11px] font-bold text-muted">
                {count}
              </span>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      count > 0
                        ? `"${cat.name}" tiene ${count} productos que también se eliminarán. ¿Continuar?`
                        : `¿Eliminar la categoría "${cat.name}"?`
                    )
                  ) {
                    onDelete(cat.id)
                  }
                }}
                aria-label={`Eliminar ${cat.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 active:bg-red-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
