import { githubConfig } from '@/lib/menuStore'
import { readImage } from '@/lib/imageStore'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

const NO_STORE = { 'Cache-Control': 'no-store' }

// Entrega las fotos del menú guardadas en el repositorio. El nombre del archivo depende
// de su contenido, así que una dirección nunca cambia de foto y se puede cachear un año
// (en el navegador y en la red de Vercel): GitHub solo se consulta la primera vez.
export async function GET(_request, { params }) {
  const { name } = await params

  let image
  try {
    image = await readImage(name, { cfg: githubConfig() })
  } catch (err) {
    console.error('No se pudo leer la foto:', name, err?.status ?? '', err?.message)
    return new Response('No se pudo cargar la foto', { status: 502, headers: NO_STORE })
  }
  if (!image) return new Response('Foto no encontrada', { status: 404, headers: NO_STORE })

  return new Response(image.buffer, {
    headers: {
      'Content-Type': image.mime,
      'Content-Length': String(image.buffer.length),
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  })
}
