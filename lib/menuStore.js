import fs from 'fs/promises'
import path from 'path'

// Almacén del menú.
// - En producción (Vercel): el menú vive en data/menu.json DENTRO del repo de
//   GitHub y se lee/escribe mediante la API de GitHub (gratis, con historial).
// - En desarrollo local sin GITHUB_TOKEN: se usa el archivo local directamente.

const FILE_PATH = 'data/menu.json'

function githubConfig() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO || 'cristiansanchez1003-blip/menucafedepirque'
  const branch = process.env.GITHUB_BRANCH || 'main'
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

export async function readMenu() {
  const cfg = githubConfig()
  if (cfg) {
    try {
      const res = await githubRequest(cfg, 'GET', null, true)
      return await res.json()
    } catch (err) {
      console.error('No se pudo leer desde GitHub, usando copia local:', err.message)
    }
  }
  const text = await fs.readFile(localFile(), 'utf8')
  return JSON.parse(text)
}

export async function writeMenu(menu) {
  const content = JSON.stringify(menu, null, 2)
  const cfg = githubConfig()

  if (cfg) {
    // Obtener el sha actual del archivo (requerido por GitHub para actualizar)
    const metaRes = await githubRequest(cfg, 'GET')
    const meta = await metaRes.json()

    const url = `https://api.github.com/repos/${cfg.repo}/contents/${FILE_PATH}`
    const res = await fetch(url, {
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

// Validación mínima de la estructura antes de guardar.
export function validateMenu(menu) {
  if (!menu || typeof menu !== 'object') return 'Estructura inválida'
  if (!menu.settings || typeof menu.settings !== 'object') return 'Faltan los ajustes'
  if (!Array.isArray(menu.categories) || menu.categories.length === 0)
    return 'Faltan las categorías'
  if (!Array.isArray(menu.products)) return 'Faltan los productos'
  for (const p of menu.products) {
    if (!p.id || !p.name || typeof p.price !== 'number' || !p.categoryId)
      return `Producto inválido: ${p.name || p.id || '?'}`
  }
  return null
}
