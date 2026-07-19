'use client'

import { useState } from 'react'

// Imagen de producto con fallback elegante: si no hay imagen o falla la carga,
// muestra una baldosa de marca con el emoji de la categoría.
export default function ProductImage({ src, alt, emoji, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-mintsoft to-mint/60 dark:from-carddark dark:to-forest/30 ${className}`}
        aria-hidden="true"
      >
        <span className="select-none text-3xl drop-shadow-sm">{emoji || '☕'}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
