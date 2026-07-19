import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  apiBase,
  describeCloudinaryError,
  readCloudinaryConfig,
  signParams,
} from '@/lib/cloudinary'
import { MAX_UPLOAD_BYTES } from '@/lib/uploadErrors'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const FOLDER = 'carniceria-mincho'

const fail = (error, status) => NextResponse.json({ error }, { status })

// Sube una imagen de producto a Cloudinary (subida firmada en el servidor).
export async function POST(request) {
  const session = getSession(request)
  if (!session) return fail('No autorizado', 401)

  const { config, missing } = readCloudinaryConfig()
  if (!config) {
    return fail(
      `Cloudinary no está configurado: faltan ${missing.join(', ')} en Vercel. Mientras tanto puedes pegar la dirección (URL) de la imagen.`,
      501
    )
  }

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
  if (!String(file.type).startsWith('image/')) {
    return fail('El archivo debe ser una imagen', 415)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signParams({ folder: FOLDER, timestamp }, config.apiSecret)

  const upload = new FormData()
  upload.append('file', dataUri)
  upload.append('api_key', config.apiKey)
  upload.append('timestamp', String(timestamp))
  upload.append('folder', FOLDER)
  upload.append('signature', signature)

  let res
  try {
    res = await fetch(`${apiBase()}/v1_1/${config.cloudName}/image/upload`, {
      method: 'POST',
      body: upload,
      signal: AbortSignal.timeout(25_000),
    })
  } catch (err) {
    console.error('No se pudo contactar a Cloudinary:', err?.name, err?.message)
    return fail('No se pudo conectar con Cloudinary. Reintenta en un momento.', 504)
  }

  const raw = await res.text()
  let data = null
  try {
    data = JSON.parse(raw)
  } catch {}

  if (!res.ok) {
    const message = describeCloudinaryError(res.status, data?.error?.message || raw, {
      secret: config.apiSecret,
    })
    console.error('Cloudinary rechazó la subida:', res.status, message)
    return fail(message, 502)
  }
  if (!data?.secure_url) {
    console.error('Cloudinary respondió sin secure_url:', res.status)
    return fail('Cloudinary no devolvió la dirección de la imagen. Reintenta.', 502)
  }

  // URL optimizada: ancho 800, calidad y formato automáticos
  const optimized = data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/')
  return NextResponse.json({ ok: true, url: optimized })
}
