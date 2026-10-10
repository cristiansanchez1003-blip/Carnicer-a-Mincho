import crypto from 'node:crypto'

export const CLOUDINARY_API_BASE = 'https://api.cloudinary.com'

const VARS = {
  cloudName: 'CLOUDINARY_CLOUD_NAME',
  apiKey: 'CLOUDINARY_API_KEY',
  apiSecret: 'CLOUDINARY_API_SECRET',
}

// Los valores pegados en el panel de Vercel suelen traer espacios, saltos de línea o
// comillas; cualquiera de esos rompe la firma de Cloudinary sin dar un error obvio.
function clean(value) {
  let v = String(value ?? '').trim()
  if (v.length >= 2 && /^(["']).*\1$/.test(v)) v = v.slice(1, -1).trim()
  return v
}

// Dirección base de la API. Solo en desarrollo se puede apuntar a un servidor simulado
// (CLOUDINARY_API_BASE); en producción se ignora para no enviar nunca firmas ni fotos a
// otro host por una variable mal puesta.
export function apiBase(env = process.env) {
  const override = clean(env.CLOUDINARY_API_BASE)
  if (override && env.NODE_ENV !== 'production') return override.replace(/\/+$/, '')
  return CLOUDINARY_API_BASE
}

// Devuelve { config, missing }. config es null si falta cualquier variable.
export function readCloudinaryConfig(env = process.env) {
  const config = {}
  const missing = []
  for (const [key, name] of Object.entries(VARS)) {
    const value = clean(env[name])
    if (value) config[key] = value
    else missing.push(name)
  }
  return { config: missing.length ? null : config, missing }
}

// Firma de Cloudinary: SHA-1 de los parámetros (sin vacíos) ordenados alfabéticamente
// como k=v unidos por &, seguido del API Secret.
export function signParams(params, secret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + secret).digest('hex')
}

// Traduce el error de Cloudinary a una indicación accionable. Nunca devuelve el secreto.
export function describeCloudinaryError(status, message, { secret } = {}) {
  let text = String(message || '')
  if (secret) text = text.split(secret).join('[oculto]')

  if (/invalid cloud_name/i.test(text)) {
    return 'El nombre de la nube de Cloudinary no es válido: revisa CLOUDINARY_CLOUD_NAME en Vercel.'
  }
  if (/api_secret mismatch/i.test(text)) {
    return 'Cloudinary rechazó las claves (API Key y API Secret no coinciden): revisa CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Vercel.'
  }
  if (/invalid signature/i.test(text)) {
    return 'Cloudinary rechazó la firma: revisa CLOUDINARY_API_SECRET en Vercel (mal copiado o con espacios).'
  }
  if (/invalid api[_ ]?key|unknown api key|must supply api_key/i.test(text)) {
    return 'La API Key de Cloudinary no es válida: revisa CLOUDINARY_API_KEY en Vercel.'
  }
  if (status === 420 || status === 429 || /rate limit/i.test(text)) {
    return 'Cloudinary alcanzó su límite de uso. Espera un rato o revisa el plan de la cuenta.'
  }
  if (/disabled|suspended/i.test(text)) {
    return 'La cuenta de Cloudinary está deshabilitada o suspendida. Revisa su panel en cloudinary.com.'
  }
  if (status === 401 || status === 403) {
    return 'Cloudinary rechazó las credenciales: revisa CLOUDINARY_CLOUD_NAME, API_KEY y API_SECRET en Vercel.'
  }
  return `Cloudinary respondió: ${text.slice(0, 200) || `error ${status}`}`
}
