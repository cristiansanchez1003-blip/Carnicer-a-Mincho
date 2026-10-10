import crypto from 'crypto'

const COOKIE_NAME = 'mincho_admin_session'
const SESSION_HOURS = 24 * 7 // 7 días

const DEV_SECRET = 'dev-secret-cambiar-en-produccion'
const MIN_SECRET_LENGTH = 16

// En producción NO se usa un secreto por defecto: si AUTH_SECRET falta o es muy corto,
// nadie puede iniciar sesión (mejor un panel bloqueado que sesiones falsificables).
function getSecret() {
  const secret = String(process.env.AUTH_SECRET ?? '').trim()
  if (process.env.NODE_ENV === 'production') {
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(`AUTH_SECRET no está configurado o es demasiado corto (mínimo ${MIN_SECRET_LENGTH} caracteres)`)
    }
    return secret
  }
  return secret || DEV_SECRET
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

// Crea un token firmado HMAC-SHA256: base64url(payload).firma
export function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600 * 1000 })
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  let expected
  try {
    expected = sign(payload)
  } catch {
    return null // sin secreto válido en producción nunca hay sesión
  }
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

// Comparación en tiempo constante que soporta cualquier largo y caracteres
// multibyte (tildes, eñes): se comparan los SHA-256, que siempre miden igual.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a), 'utf8').digest()
  const hb = crypto.createHash('sha256').update(String(b), 'utf8').digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function checkCredentials(username, password) {
  const validUser = String(process.env.ADMIN_USER ?? '').trim() || 'Gloria'
  const validPass = String(process.env.ADMIN_PASSWORD ?? '').trim()
  if (!validPass) return false // sin contraseña configurada no hay acceso
  return safeEqual(username, validUser) && safeEqual(password, validPass)
}

// Lee y verifica la sesión desde las cookies de un Request.
export function getSession(request) {
  const cookie = request.cookies.get(COOKIE_NAME)
  return verifyToken(cookie?.value)
}

export function sessionCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  }
}

export function clearSessionCookie() {
  return { ...sessionCookie(''), maxAge: 0 }
}

export { COOKIE_NAME }
