'use client'

import { useState } from 'react'
import { optimizedImage } from '@/lib/imageSrc'

// Imagen de producto con fallback elegante: si no hay imagen o falla la carga,
// muestra una baldosa de marca con el emoji de la categoría.
// Las fotos subidas desde el panel se piden en una versión del tamaño justo (`sizes` dice
// cuánto mide en pantalla); si esa versión falla, se prueba con la foto original.
export default function ProductImage({ src, alt, emoji, className = '', sizes }) {
  const optimized = optimizedImage(src)
  const variants = optimized ? [optimized, { src }] : src ? [{ src }] : []

  // El intento actual se guarda junto con la foto a la que corresponde: si el producto
  // cambia de foto, se empieza de nuevo desde la primera variante.
  const [attempt, setAttempt] = useState({ src, index: 0 })
  const index = attempt.src === src ? attempt.index : 0
  const current = variants[index]

  if (!current) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-mintsoft to-mint/60 dark:from-carddark dark:to-forest/30 ${className}`}
        aria-hidden="true"
      >
        <span className="select-none text-3xl drop-shadow-sm">{emoji || '🥩'}</span>
      </div>
    )
  }

  return (
    <img
      src={current.src}
      srcSet={current.srcSet}
      sizes={current.srcSet ? sizes : undefined}
      alt={alt}
      loading="lazy"
      onError={() => setAttempt({ src, index: index + 1 })}
      className={`object-cover ${className}`}
    />
  )
}
