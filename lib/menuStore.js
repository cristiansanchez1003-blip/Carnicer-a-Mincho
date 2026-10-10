import fs from 'fs/promises'
import path from 'path'
import { validateSchedule } from './hours.js'
import { validateNotice } from './notice.js'
import { isHighlight } from './highlights.js'

// Almacén del menú.
// - En producción (Vercel): el menú vive en data/menu.json DENTRO del repo de
//   GitHub y se lee/escribe mediante la API de GitHub (gratis, con historial).
// - En desarrollo local sin GITHUB_TOKEN: se usa el archivo local directamente.

const FILE_PATH = 'data/menu.json'

// Los valores pegados en Vercel suelen traer espacios o saltos de línea al final.
const env = (name) => String(process.env[name] ?? '').trim()

export function githubConfig() {
  const token = env('GITHUB_TOKEN')
  const repo = env('GITHUB_REPO') || 'cristiansanchez1003-blip/Carnicer-a-Mincho'
  const branch = env('GITHUB_BRANCH') || 'main'
  if (!token) return null
  return { token, repo, branch }
}

function localFile() {
  return path.join(process.cwd(), FILE_PATH)
}

async function githubRequest(cfg, method = 'GET', body = null, raw = false) {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${FILE_PATH}?ref=${cfg.branch}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`GitHub ${method} ${res.status}: ${detail.slice(0, 200)}`)
  }
  return res
}

// Lee el menú.
// - Por defecto, si GitHub falla, cae a la copia incluida en el despliegue (el público
//   sigue viendo un menú aunque sea algo antiguo).
// - Con { strict: true } un fallo de GitHub se propaga: el panel de administración no
//   debe editar una copia vieja, porque al guardar pisaría los cambios más recientes.
// - Con { withSource: true } devuelve { menu, source } con source = 'github' | 'local' |
//   'local-fallback'.
export async function readMenu({ strict = false, withSource = false } = {}) {
  const done = (menu, source) => (withSource ? { menu, source } : menu)

  const cfg = githubConfig()
  let fellBack = false
  if (cfg) {
    try {
      const res = await githubRequest(cfg, 'GET', null, true)
      return done(await res.json(), 'github')
    } catch (err) {
      if (strict) throw err
      console.error('No se pudo leer desde GitHub, usando copia local:', err.message)
      fellBack = true
    }
  }
  const text = await fs.readFile(localFile(), 'utf8')
  return done(JSON.parse(text), fellBack ? 'local-fallback' : 'local')
}

async function putToGithub(cfg, content) {
  // GitHub exige el sha vigente del archivo para actualizarlo.
  const metaRes = await githubRequest(cfg, 'GET')
  const meta = await metaRes.json()

  const url = `https://api.github.com/repos/${cfg.repo}/contents/${FILE_PATH}`
  return fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Actualización del menú desde el panel admin (${new Date().toISOString()})`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha: meta.sha,
      branch: cfg.branch,
    }),
  })
}

export async function writeMenu(menu) {
  const content = JSON.stringify(menu, null, 2)
  const cfg = githubConfig()

  if (cfg) {
    let res = await putToGithub(cfg, content)
    // 409 = el archivo cambió entre que leímos el sha y escribimos (guardados casi
    // simultáneos). Reintentamos una vez con el sha nuevo.
    if (res.status === 409) res = await putToGithub(cfg, content)
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`GitHub PUT ${res.status}: ${detail.slice(0, 200)}`)
    }
    return { source: 'github' }
  }

  // Modo local (desarrollo)
  await fs.writeFile(localFile(), content, 'utf8')
  return { source: 'local' }
}

// --- Validación de la estructura antes de guardar ---

const UNITS = ['kg', 'un', 'docena']
const MAX_PRODUCTS = 1000
const MAX_CATEGORIES = 100

const isHttps = (v) => typeof v === 'string' && /^https:\/\/[^\s]+$/i.test(v)
// Rutas del propio sitio (/images/...) pero no URLs relativas al protocolo (//otro.sitio).
const isSitePath = (v) => typeof v === 'string' && /^\/(?!\/)[^\s]*$/.test(v)

export function validateMenu(menu) {
  if (!menu || typeof menu !== 'object') return 'Estructura inválida'
  const { settings, categories, products } = menu
  if (!settings || typeof settings !== 'object') return 'Faltan los ajustes'
  if (!Array.isArray(categories) || categories.length === 0) return 'Faltan las categorías'
  if (!Array.isArray(products)) return 'Faltan los productos'
  if (categories.length > MAX_CATEGORIES) return 'Hay demasiadas categorías'
  if (products.length > MAX_PRODUCTS) return 'Hay demasiados productos'

  for (const key of ['mapsUrl', 'mapsEmbed', 'instagram', 'reviewUrl']) {
    const v = settings[key]
    if (v && !isHttps(v)) return `El campo ${key} debe ser un enlace que empiece con https://`
  }
  if (settings.whatsapp && !/^\d{8,15}$/.test(String(settings.whatsapp))) {
    return 'El WhatsApp debe tener solo números, con código de país (ej: 56912345678)'
  }

  if (settings.phone && !/^\d{8,15}$/.test(String(settings.phone))) {
    return 'El teléfono debe tener solo números, con código de país (ej: 56912345678)'
  }
  const noticeProblem = validateNotice(settings)
  if (noticeProblem) return noticeProblem

  if (settings.schedule !== undefined) {
    const problem = validateSchedule(settings.schedule)
    if (problem) return problem
  }
  if (settings.pricesUpdatedAt) {
    const d = String(settings.pricesUpdatedAt)
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`))
    if (!valid) return 'La fecha de actualización de precios no es válida (usa AAAA-MM-DD)'
  }

  const categoryIds = new Set()
  for (const c of categories) {
    if (!c || typeof c.id !== 'string' || !c.id || typeof c.name !== 'string' || !c.name) {
      return `Categoría inválida: ${c?.name || c?.id || '?'}`
    }
    if (categoryIds.has(c.id)) return `Hay categorías con id repetido: ${c.id}`
    categoryIds.add(c.id)
  }

  const productIds = new Set()
  for (const p of products) {
    const label = p?.name || p?.id || '?'
    if (!p || !p.id || typeof p.name !== 'string' || !p.name || !p.categoryId) {
      return `Producto inválido: ${label}`
    }
    if (p.name.length > 120) return `El nombre de "${p.name.slice(0, 30)}…" es demasiado largo`
    if (p.description && String(p.description).length > 1000) {
      return `La descripción de "${p.name}" es demasiado larga`
    }
    if (p.name_en && String(p.name_en).length > 120) {
      return `El nombre en inglés de "${p.name}" es demasiado largo`
    }
    if (p.description_en && String(p.description_en).length > 1000) {
      return `La descripción en inglés de "${p.name}" es demasiado larga`
    }
    if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price < 0) {
      return `Precio inválido en "${p.name}"`
    }
    if (productIds.has(p.id)) return `Hay productos con id repetido: ${p.id}`
    productIds.add(p.id)
    if (!categoryIds.has(p.categoryId)) {
      return `El producto "${p.name}" apunta a una categoría que no existe`
    }
    if (p.unit && !UNITS.includes(p.unit)) return `Unidad de venta inválida en "${p.name}"`
    if (p.highlight && !isHighlight(p.highlight)) return `Etiqueta de destacado inválida en "${p.name}"`
    if (p.image && !isHttps(p.image) && !isSitePath(p.image)) {
      return `Imagen inválida en "${p.name}": debe ser un enlace https o una ruta del sitio`
    }
  }
  return null
}
