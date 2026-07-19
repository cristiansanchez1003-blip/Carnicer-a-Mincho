import { apiBase, describeCloudinaryError } from './cloudinary.js'

const WARN_DAYS = 15
const TIMEOUT_MS = 8000

function timeoutSignal() {
  return typeof AbortSignal !== 'undefined' && AbortSignal.timeout
    ? AbortSignal.timeout(TIMEOUT_MS)
    : undefined
}

// GitHub informa el vencimiento del token en un encabezado: "2026-11-27 12:00:00 UTC".
export function tokenDaysLeft(headerValue, now = Date.now()) {
  if (!headerValue) return null
  const match = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/.exec(String(headerValue).trim())
  if (!match) return null
  const expires = Date.parse(`${match[1]}T${match[2]}Z`)
  if (Number.isNaN(expires)) return null
  return Math.floor((expires - now) / 86_400_000)
}

// Comprueba que las credenciales de Cloudinary funcionan sin subir nada: el endpoint
// "usage" exige credenciales válidas y no crea ni modifica archivos.
export async function checkCloudinary(config, { fetchImpl = fetch, missing = [], base = apiBase() } = {}) {
  if (!config) {
    const names = missing.length ? missing.join(', ') : 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    return { level: 'error', message: `Faltan variables en Vercel: ${names}.` }
  }
  try {
    const res = await fetchImpl(`${base}/v1_1/${config.cloudName}/usage`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64'),
      },
      signal: timeoutSignal(),
      cache: 'no-store',
    })
    if (res.ok) return { level: 'ok', message: 'Conectado: las credenciales de Cloudinary funcionan.' }
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.error?.message || ''
    } catch {}
    return {
      level: 'error',
      message: describeCloudinaryError(res.status, detail, { secret: config.apiSecret }),
    }
  } catch {
    return { level: 'error', message: 'No se pudo conectar con Cloudinary. Reintenta en un momento.' }
  }
}

// Comprueba que el token puede leer data/menu.json en el repositorio y la rama configurados,
// y avisa si el token está por vencer (un token vencido deja el panel sin poder guardar).
export async function checkGithub(cfg, { fetchImpl = fetch, now = Date.now() } = {}) {
  if (!cfg) {
    return {
      level: 'warn',
      message: 'Falta GITHUB_TOKEN: los cambios solo se guardarían en un archivo local, que en Vercel no persiste.',
    }
  }
  const url = `https://api.github.com/repos/${cfg.repo}/contents/data/menu.json?ref=${encodeURIComponent(cfg.branch)}`
  try {
    const res = await fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: timeoutSignal(),
      cache: 'no-store',
    })
    if (res.status === 401) {
      return { level: 'error', message: 'GitHub rechazó el token: venció o es inválido. Genera uno nuevo y actualiza GITHUB_TOKEN en Vercel.' }
    }
    if (res.status === 403) {
      return { level: 'error', message: 'GitHub negó el acceso: el token no tiene permiso de contenido sobre este repositorio o se alcanzó el límite de uso.' }
    }
    if (res.status === 404) {
      return {
        level: 'error',
        message: `No se encuentra data/menu.json en ${cfg.repo} (rama ${cfg.branch}). Revisa GITHUB_REPO, GITHUB_BRANCH o los permisos del token.`,
      }
    }
    if (!res.ok) return { level: 'error', message: `GitHub respondió con error ${res.status}.` }

    const days = tokenDaysLeft(res.headers.get('github-authentication-token-expiration'), now)
    if (days !== null && days <= WARN_DAYS) {
      return {
        level: 'warn',
        message: days < 0
          ? 'El token de GitHub ya venció.'
          : `Conectado, pero el token de GitHub vence en ${days} días. Renuévalo antes para no perder la edición.`,
        daysLeft: days,
      }
    }
    const extra = days !== null ? ` El token vence en ${days} días.` : ''
    return { level: 'ok', message: `Conectado a ${cfg.repo} (rama ${cfg.branch}).${extra}`, daysLeft: days }
  } catch {
    return { level: 'error', message: 'No se pudo conectar con GitHub. Reintenta en un momento.' }
  }
}

// Compara de qué rama sale el código desplegado con la rama donde el panel guarda el menú.
// Si difieren, los arreglos de código que se suban a la rama de datos no llegan al sitio real.
export function checkSite({ vercelEnv, deployBranch, dataBranch } = {}) {
  if (!vercelEnv) return { level: 'ok', message: 'Ejecutándose en tu computador (modo local).' }
  if (vercelEnv === 'preview') {
    return {
      level: 'warn',
      message: 'Estás en una versión de prueba (vista previa), no en el sitio real que ven los clientes.',
    }
  }
  if (deployBranch && dataBranch && deployBranch !== dataBranch) {
    return {
      level: 'warn',
      message: `El sitio real se construye desde la rama "${deployBranch}", pero el panel guarda el menú en "${dataBranch}". Los cambios de código en "${dataBranch}" no llegan al sitio hasta que Vercel use esa rama como producción.`,
    }
  }
  return {
    level: 'ok',
    message: deployBranch ? `Sitio real construido desde la rama "${deployBranch}".` : 'Sitio real en Vercel.',
  }
}
