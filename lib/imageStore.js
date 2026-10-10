import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { IMAGE_URL_PREFIX } from './imageSrc.js'

// Almacén de fotos de productos, sin servicios externos.
// - En producción (Vercel): cada foto es un archivo dentro del mismo repositorio de GitHub
//   (data/images/) que ya guarda el menú. Se escribe con la API de GitHub y el sitio la
//   entrega desde /api/img/<nombre>, así que no hace falta otra cuenta ni otras claves.
// - En desarrollo local sin GITHUB_TOKEN: se guardan en la carpeta data/images del proyecto.
// El nombre del archivo sale del contenido (hash), por eso nunca cambia y se puede cachear
// "para siempre": subir la misma foto dos veces no duplica nada.

export const IMAGES_DIR = 'data/images'
export { IMAGE_URL_PREFIX }

const TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const NAME_PATTERN = /^[a-f0-9]{16}\.(jpg|png|webp)$/

// Reconoce el formato por los primeros bytes (el tipo que declara el navegador no es fiable).
export function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'webp'
  }
  return null
}

export function imageName(buffer, ext) {
  return `${createHash('sha256').update(buffer).digest('hex').slice(0, 16)}.${ext}`
}

export const isImageName = (name) => typeof name === 'string' && NAME_PATTERN.test(name)

export const imageMime = (name) => TYPES[String(name).split('.').pop()] ?? null

export const imageUrl = (name) => `${IMAGE_URL_PREFIX}${name}`

function githubHeaders(cfg, { raw = false, json = false } = {}) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

const contentsUrl = (cfg, name) => `https://api.github.com/repos/${cfg.repo}/contents/${IMAGES_DIR}/${name}`

function githubError(action, status) {
  const err = new Error(`GitHub ${action} ${status}`)
  err.status = status
  return err
}

// Solo se usa en desarrollo local; el comentario evita que el empaquetador incluya todo el
// proyecto en la función por esta ruta dinámica.
const localDir = (dir) => dir ?? path.join(/*turbopackIgnore: true*/ process.cwd(), IMAGES_DIR)

// Guarda la foto y devuelve su nombre de archivo. `cfg` es la configuración de GitHub
// (null = modo local). Subir una foto idéntica a una ya guardada no es un error.
export async function saveImage(buffer, ext, { cfg = null, fetchImpl = fetch, dir } = {}) {
  const name = imageName(buffer, ext)

  if (!cfg) {
    const target = localDir(dir)
    await fs.mkdir(target, { recursive: true })
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ target, name), buffer)
    return name
  }

  const put = () =>
    fetchImpl(contentsUrl(cfg, name), {
      method: 'PUT',
      headers: githubHeaders(cfg, { json: true }),
      body: JSON.stringify({
        message: `Foto subida desde el panel admin (${name})`,
        content: buffer.toString('base64'),
        branch: cfg.branch,
      }),
      cache: 'no-store',
    })

  let res = await put()
  // 409 = otro guardado (p. ej. el del menú) se coló entre medio; basta con reintentar.
  if (res.status === 409) res = await put()
  if (res.ok) return name
  // 422 con "sha" = el archivo ya existe (el nombre sale del contenido, así que es la
  // misma foto): ya está guardada. Cualquier otro 422 sí es un error.
  if (res.status === 422) {
    const detail = await res.text().catch(() => '')
    if (/\bsha\b/i.test(detail)) return name
  }
  throw githubError('PUT', res.status)
}

// Lee una foto guardada. Devuelve { buffer, mime }, o null si no existe.
export async function readImage(name, { cfg = null, fetchImpl = fetch, dir } = {}) {
  if (!isImageName(name)) return null
  const mime = imageMime(name)

  if (!cfg) {
    try {
      return { buffer: await fs.readFile(path.join(/*turbopackIgnore: true*/ localDir(dir), name)), mime }
    } catch (err) {
      if (err?.code === 'ENOENT') return null
      throw err
    }
  }

  const res = await fetchImpl(`${contentsUrl(cfg, name)}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: githubHeaders(cfg, { raw: true }),
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw githubError('GET', res.status)
  return { buffer: Buffer.from(await res.arrayBuffer()), mime }
}

// Mensaje en español claro para quien administra, según por qué falló el guardado.
export function describeImageError(status) {
  if (status === 401) {
    return 'GitHub rechazó el token: venció o es inválido. Genera uno nuevo y actualiza GITHUB_TOKEN en Vercel.'
  }
  if (status === 403 || status === 404) {
    return 'GitHub no permite guardar la foto: el token necesita el permiso "Contents: Read and write" sobre el repositorio.'
  }
  if (status === 429) return 'GitHub pidió esperar un momento. Reintenta en un minuto.'
  return `GitHub no pudo guardar la foto (error ${status}). Reintenta en un momento.`
}
