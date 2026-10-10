// Módulo sin dependencias de Node: lo usa el navegador (ProductImage) y también el servidor.
// No debe importar imageStore.js, que usa fs/crypto y no se puede empaquetar para el navegador.

// Dirección con la que el sitio entrega las fotos subidas desde el panel.
export const IMAGE_URL_PREFIX = '/api/img/'

// Las fotos subidas desde el panel se guardan reducidas a 1600 px, pero una miniatura de la
// lista mide 76 px: cargarla completa gasta datos móviles para nada. Para esas fotos se
// piden a /_next/image (el optimizador de Next/Vercel) versiones del tamaño justo, en WebP,
// y el navegador elige la que corresponde a su pantalla.
// Los anchos deben estar entre los que Next permite (imageSizes + deviceSizes por defecto).
export const IMAGE_WIDTHS = [256, 384, 640, 828]
const QUALITY = 75 // la única calidad que Next 16 permite por defecto

export function optimizedImage(src, widths = IMAGE_WIDTHS) {
  if (typeof src !== 'string' || !src.startsWith(IMAGE_URL_PREFIX)) return null
  const url = (w) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY}`
  return {
    src: url(widths[widths.length - 1]),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(', '),
  }
}
