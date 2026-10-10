// Vercel rechaza cuerpos de más de 4,5 MB antes de llegar a nuestro código, y lo hace
// con texto plano (no JSON). Dejamos margen para el encabezado multipart.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

// Lee la respuesta una sola vez y la interpreta como JSON si se puede.
export async function readBody(res) {
  const text = await res.text()
  try {
    return { data: JSON.parse(text), text }
  } catch {
    return { data: null, text }
  }
}

// Mensaje en español claro para el administrador según lo que respondió el servidor.
export function uploadErrorMessage(status, data) {
  if (data && typeof data.error === 'string' && data.error) return data.error
  if (status === 413) return 'La foto es demasiado pesada para subirla. Prueba con una más pequeña.'
  if (status === 401) return 'Tu sesión expiró. Vuelve a ingresar al panel.'
  if (status === 408 || status === 504) {
    return 'La subida tardó demasiado. Revisa tu conexión e inténtalo de nuevo.'
  }
  if (status >= 500) return `El servidor no pudo procesar la foto (error ${status}).`
  return `No se pudo subir la imagen (error ${status}).`
}
