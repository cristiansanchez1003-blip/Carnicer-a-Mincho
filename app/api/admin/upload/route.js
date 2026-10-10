import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { githubConfig } from '@/lib/menuStore'
import { describeImageError, detectImageType, imageUrl, saveImage } from '@/lib/imageStore'
import { MAX_UPLOAD_BYTES } from '@/lib/uploadErrors'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const fail = (error, status) => NextResponse.json({ error }, { status })

// Guarda una foto de producto en el repositorio (data/images) y devuelve la dirección
// con la que el sitio la entrega (/api/img/<nombre>).
export async function POST(request) {
  const session = getSession(request)
  if (!session) return fail('No autorizado', 401)

  let formData
  try {
    formData = await request.formData()
  } catch {
    return fail('El archivo no se pudo leer. Inténtalo de nuevo.', 400)
  }

  const file = formData.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return fail('No se recibió ningún archivo', 400)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return fail('La foto pesa más de 4 MB. Usa una más pequeña.', 413)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  // El formato se decide por el contenido real, no por lo que declara el navegador.
  const ext = detectImageType(buffer)
  if (!ext) return fail('El archivo debe ser una imagen JPG, PNG o WebP.', 415)

  try {
    const name = await saveImage(buffer, ext, { cfg: githubConfig() })
    return NextResponse.json({ ok: true, url: imageUrl(name) })
  } catch (err) {
    console.error('No se pudo guardar la foto:', err?.status ?? '', err?.message)
    if (err?.status) return fail(describeImageError(err.status), 502)
    return fail('No se pudo guardar la foto. Reintenta en un momento.', 500)
  }
}
