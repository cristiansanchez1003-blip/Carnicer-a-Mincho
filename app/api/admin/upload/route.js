import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 8 * 1024 * 1024 // 8 MB

// Sube una imagen de producto a Cloudinary (subida firmada en el servidor).
export async function POST(request) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          'Cloudinary no está configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Vercel, o pega la URL de la imagen directamente.',
      },
      { status: 501 }
    )
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Formato de archivo inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'La imagen supera los 8 MB' }, { status: 413 })
  }
  if (!String(file.type).startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 415 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'cafe-de-pirque'
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  const upload = new FormData()
  upload.append('file', dataUri)
  upload.append('api_key', apiKey)
  upload.append('timestamp', String(timestamp))
  upload.append('folder', folder)
  upload.append('signature', signature)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: upload,
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error?.message || `Cloudinary ${res.status}`)
    }
    // URL optimizada: ancho 800, calidad y formato automáticos
    const optimized = data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/')
    return NextResponse.json({ ok: true, url: optimized })
  } catch (err) {
    console.error('Error subiendo a Cloudinary:', err)
    return NextResponse.json({ error: 'No se pudo subir la imagen' }, { status: 502 })
  }
}
