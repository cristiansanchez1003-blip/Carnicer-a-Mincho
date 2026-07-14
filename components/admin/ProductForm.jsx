'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Formulario de crear/editar producto en modal bottom-sheet.
// La imagen se puede subir a Cloudinary o pegar una URL directa.
export default function ProductForm({ product, categories, onSave, onClose, uploadImage }) {
  const isNew = !product?.id
  const [form, setForm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (product) {
      setForm({
        id: product.id || `n${Date.now()}`,
        categoryId: product.categoryId || categories[0]?.id || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        image: product.image || '',
        available: product.available !== false,
        sort: product.sort || 0,
      })
      setUploadError(null)
    } else {
      setForm(null)
    }
  }, [product, categories])

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [product])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadImage(file)
      set('image', url)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, price: Math.round(Number(form.price) || 0) })
    onClose()
  }

  const inputCls =
    'w-full rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'

  return (
    <AnimatePresence>
      {product && form && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-ink/60" onClick={onClose} />

          <motion.form
            onSubmit={handleSubmit}
            className="safe-bottom relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-sheet sm:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-playfair text-lg font-bold text-ink">
                {isNew ? 'Nuevo producto' : 'Editar producto'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Imagen */}
              <div className="flex items-center gap-3.5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-linen bg-mintsoft">
                  {form.image ? (
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🖼️</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                    id="product-image-file"
                  />
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="product-image-file"
                      className="cursor-pointer rounded-full bg-ink px-3.5 py-2 text-[12.5px] font-bold text-mint active:scale-95"
                    >
                      {uploading ? 'Subiendo…' : 'Subir foto'}
                    </label>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => set('image', '')}
                        className="rounded-full border border-linen px-3.5 py-2 text-[12.5px] font-bold text-ink/60"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  {uploadError && (
                    <p className="mt-1.5 text-[12px] font-semibold text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                  URL de imagen (opcional)
                </span>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Nombre *</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Descripción</span>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className={inputCls}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                    Precio (CLP) *
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70">Categoría *</span>
                  <select
                    value={form.categoryId}
                    onChange={(e) => set('categoryId', e.target.value)}
                    className={inputCls}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-linen bg-paper px-4 py-3">
                <span className="text-[14px] font-bold text-ink">Disponible</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.available}
                  onClick={() => set('available', !form.available)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    form.available ? 'bg-forest' : 'bg-ink/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      form.available ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="mt-1 rounded-xl bg-forest py-3.5 text-[15px] font-bold text-white shadow-nav active:scale-[0.98] disabled:opacity-60"
              >
                {isNew ? 'Agregar producto' : 'Guardar producto'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
