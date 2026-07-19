// Calcula el tamaño final de una foto para que su lado mayor no pase de maxSide,
// manteniendo la proporción. Nunca agranda.
export function fitWithin(width, height, maxSide) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('La imagen tiene dimensiones inválidas')
  }
  const longest = Math.max(width, height)
  if (longest <= maxSide) return { width, height }
  const scale = maxSide / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}
