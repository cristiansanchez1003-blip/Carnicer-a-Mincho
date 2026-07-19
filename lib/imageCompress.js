import { fitWithin } from './imageFit.js'
import { MAX_UPLOAD_BYTES } from './uploadErrors.js'

// Las fotos de celular pesan entre 3 y 10 MB, y Vercel rechaza cuerpos de más de 4,5 MB.
// Antes de subir, se reducen a un máximo de 1600 px por lado y se recomprimen como JPEG:
// el menú las muestra a 800 px de ancho como mucho, así que no se pierde calidad visible.
const MAX_SIDE = 1600
const QUALITIES = [0.85, 0.72, 0.6, 0.5]
const TARGET_BYTES = Math.floor(MAX_UPLOAD_BYTES * 0.9)
const SKIP_BELOW_BYTES = 700 * 1024
const PASSTHROUGH_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const UNREADABLE =
  'No se pudo leer esta foto. Usa una imagen JPG o PNG (en iPhone: Ajustes → Cámara → Formatos → Más compatible).'

function toBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return { source: await createImageBitmap(file, { imageOrientation: 'from-image' }), cleanup() {} }
    } catch {
      // Safari antiguo no acepta las opciones; se prueba el decodificador clásico.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { source: img, cleanup: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new Error(UNREADABLE)
  }
}

export async function compressImage(file) {
  // Las fotos ya livianas se suben tal cual.
  if (file.size <= SKIP_BELOW_BYTES && PASSTHROUGH_TYPES.includes(file.type)) return file

  const { source, cleanup } = await decode(file)
  try {
    const srcW = source.width || source.naturalWidth
    const srcH = source.height || source.naturalHeight
    let side = MAX_SIDE

    for (let attempt = 0; attempt < 2; attempt++) {
      const { width, height } = fitWithin(srcW, srcH, side)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      // Fondo blanco: los PNG con transparencia no deben quedar negros al pasar a JPEG.
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(source, 0, 0, width, height)

      for (const quality of QUALITIES) {
        const blob = await toBlob(canvas, quality)
        if (blob && blob.size <= TARGET_BYTES) {
          const base = file.name.replace(/\.[^.]+$/, '') || 'foto'
          return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
        }
      }
      side = Math.round(side * 0.7) // sigue pesando demasiado: se reduce más el tamaño
    }
    throw new Error('La foto sigue siendo demasiado pesada. Prueba con otra o más pequeña.')
  } finally {
    cleanup()
  }
}
