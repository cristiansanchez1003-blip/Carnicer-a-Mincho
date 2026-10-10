'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImage } from '@/lib/imageCompress'
import { buildProductForm, normalizeProductForm } from '@/lib/productForm'
import { HIGHLIGHTS, HIGHLIGHT_LABELS } from '@/lib/highlights'

// Formulario de crear/editar producto en modal bottom-sheet.
// La imagen se sube desde el celular (no se pega ninguna dirección).
export default function ProductForm({ product, categories, onSave, onClose, uploadImage }) {
  const isNew = !product?.id
  const [form, setForm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState('Subiendo…')
  const [uploadError, setUploadError] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (product) {
      setForm(buildProductForm(product, categories))
      setUploadError(null)
      setUploaded(false)
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
    setUploaded(false)
    try {
      setUploadStage('Optimizando…')
      const prepared = await compressImage(file)
      setUploadStage('Subiendo…')
      const url = await uploadImage(prepared)
      set('image', url)
      setUploaded(true)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(normalizeProductForm(form))
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70"
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
                      {uploading ? uploadStage : form.image ? 'Cambiar foto' : 'Subir foto'}
                    </label>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => set('image', '')}
                        className="rounded-full border border-linen px-3.5 py-2 text-[12.5px] font-bold text-ink/70"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  {uploaded && !uploadError && (
                    <p role="status" className="mt-1.5 text-[12px] font-semibold text-forest">
                      ✓ Foto lista. Presiona “Guardar producto” para usarla.
                    </p>
                  )}
                  {uploadError && (
                    <p role="alert" className="mt-1.5 text-[12px] font-semibold text-red-600">
                      {uploadError}
                      <span className="mt-0.5 block font-normal text-ink/70">
                        Si sigue fallando, revisa la conexión: Ajustes → Estado de las conexiones.
                      </span>
                    </p>
                  )}
                </div>
              </div>

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

              <details
                className="rounded-xl border border-linen bg-paper px-3.5 py-2.5"
                open={Boolean(form.name_en || form.description_en)}
              >
                <summary className="cursor-pointer text-[13px] font-bold text-ink/80">
                  🇬🇧 Inglés (para turistas){' '}
                  {!form.name_en && (
                    <span className="font-normal text-amber-700">· falta la traducción</span>
                  )}
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                      Nombre en inglés
                    </span>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => set('name_en', e.target.value)}
                      placeholder="Ej: Ribeye (Lomo Vetado)"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                      Descripción en inglés
                    </span>
                    <textarea
                      rows={2}
                      value={form.description_en}
                      onChange={(e) => set('description_en', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>
              </details>

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
                  <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                    Se vende *
                  </span>
                  <select
                    value={form.unit}
                    onChange={(e) => set('unit', e.target.value)}
                    className={inputCls}
                  >
                    <option value="kg">Por kilo ($/kg)</option>
                    <option value="un">Por unidad (c/u)</option>
                    <option value="docena">Por docena</option>
                  </select>
                </label>
              </div>

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

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
                  Destacar en el menú (opcional)
                </span>
                <select
                  value={form.highlight || ''}
                  onChange={(e) => set('highlight', e.target.value)}
                  className={inputCls}
                >
                  <option value="">No destacar</option>
                  {HIGHLIGHTS.map((key) => (
                    <option key={key} value={key}>
                      ⭐ {HIGHLIGHT_LABELS.es[key]}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[12px] text-muted">
                  Los destacados disponibles aparecen primero, en la pestaña “⭐ Destacados”.
                </span>
              </label>

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
