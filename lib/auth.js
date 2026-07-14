import crypto from 'crypto'

const COOKIE_NAME = 'cafe_admin_session'
const SESSION_HOURS = 24 * 7 // 7 días

function getSecret() {
  return process.env.AUTH_SECRET || 'dev-secret-cambiar-en-produccion'
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
  const expected = sign(payload)
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

export function checkCredentials(username, password) {
  const validUser = process.env.ADMIN_USER || 'marcela'
  const validPass = process.env.ADMIN_PASSWORD
  if (!validPass) return false // sin contraseña configurada no hay acceso
  const userOk =
    username.length === validUser.length &&
    crypto.timingSafeEqual(Buffer.from(username), Buffer.from(validUser))
  const passOk =
    password.length === validPass.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(validPass))
  return userOk && passOk
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
