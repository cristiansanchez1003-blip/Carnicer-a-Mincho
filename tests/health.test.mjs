import test from 'node:test'
import assert from 'node:assert/strict'
import { checkCloudinary, checkGithub, checkSite, tokenDaysLeft } from '../lib/health.js'

const res = (status, { body = '', headers = {} } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
})

const cloud = { cloudName: 'micloud', apiKey: 'key123', apiSecret: 'sec456' }

test('tokenDaysLeft calcula los días que faltan según el encabezado de GitHub', () => {
  const now = Date.UTC(2026, 9, 8, 12, 0, 0)
  assert.equal(tokenDaysLeft('2026-11-02 12:00:00 UTC', now), 25)
})

test('tokenDaysLeft devuelve null si no hay encabezado o es ilegible', () => {
  assert.equal(tokenDaysLeft(null, Date.now()), null)
  assert.equal(tokenDaysLeft('cualquier cosa', Date.now()), null)
})

test('Cloudinary: credenciales correctas dan nivel ok y se consulta con Basic auth', async () => {
  let seen
  const fetchImpl = async (url, opts) => {
    seen = { url, opts }
    return res(200, { body: { plan: 'Free' } })
  }
  const r = await checkCloudinary(cloud, { fetchImpl })
  assert.equal(r.level, 'ok')
  assert.equal(seen.url, 'https://api.cloudinary.com/v1_1/micloud/usage')
  assert.equal(seen.opts.headers.Authorization, 'Basic ' + Buffer.from('key123:sec456').toString('base64'))
})

test('Cloudinary: sin configuración es un error que nombra las variables que faltan', async () => {
  const r = await checkCloudinary(null, { missing: ['CLOUDINARY_API_KEY'] })
  assert.equal(r.level, 'error')
  assert.match(r.message, /CLOUDINARY_API_KEY/)
})

test('Cloudinary: cloud name inválido se explica con la variable correcta', async () => {
  const fetchImpl = async () => res(401, { body: { error: { message: 'Invalid cloud_name micloud' } } })
  const r = await checkCloudinary(cloud, { fetchImpl })
  assert.equal(r.level, 'error')
  assert.match(r.message, /CLOUDINARY_CLOUD_NAME/)
})

test('Cloudinary: un fallo de red no lanza excepción', async () => {
  const fetchImpl = async () => {
    throw new Error('getaddrinfo ENOTFOUND')
  }
  const r = await checkCloudinary(cloud, { fetchImpl })
  assert.equal(r.level, 'error')
  assert.match(r.message, /conectar/i)
})

test('Cloudinary: el mensaje nunca incluye el API Secret', async () => {
  const fetchImpl = async () => res(400, { body: { error: { message: 'rarísimo sec456 rarísimo' } } })
  const r = await checkCloudinary(cloud, { fetchImpl })
  assert.doesNotMatch(r.message, /sec456/)
})

const gh = { token: 'ghp_test', repo: 'dueno/repo', branch: 'master' }

test('GitHub: lectura correcta con vencimiento lejano es ok', async () => {
  const now = Date.UTC(2026, 9, 8)
  let seen
  const fetchImpl = async (url, opts) => {
    seen = { url, opts }
    return res(200, { headers: { 'github-authentication-token-expiration': '2026-11-27 12:00:00 UTC' } })
  }
  const r = await checkGithub(gh, { fetchImpl, now })
  assert.equal(r.level, 'ok')
  assert.match(r.message, /50 días/)
  assert.equal(seen.url, 'https://api.github.com/repos/dueno/repo/contents/data/menu.json?ref=master')
  assert.equal(seen.opts.headers.Authorization, 'Bearer ghp_test')
})

test('GitHub: un token que vence en menos de 15 días es una advertencia', async () => {
  const now = Date.UTC(2026, 9, 8)
  const fetchImpl = async () =>
    res(200, { headers: { 'github-authentication-token-expiration': '2026-10-15 12:00:00 UTC' } })
  const r = await checkGithub(gh, { fetchImpl, now })
  assert.equal(r.level, 'warn')
  assert.match(r.message, /vence/i)
})

test('GitHub: token rechazado o vencido es un error que nombra GITHUB_TOKEN', async () => {
  const fetchImpl = async () => res(401, { body: { message: 'Bad credentials' } })
  const r = await checkGithub(gh, { fetchImpl })
  assert.equal(r.level, 'error')
  assert.match(r.message, /GITHUB_TOKEN/)
})

test('GitHub: 404 apunta a repositorio, rama o permisos', async () => {
  const fetchImpl = async () => res(404, { body: { message: 'Not Found' } })
  const r = await checkGithub(gh, { fetchImpl })
  assert.equal(r.level, 'error')
  assert.match(r.message, /dueno\/repo/)
  assert.match(r.message, /master/)
})

test('GitHub: sin token avisa que los cambios no persisten en Vercel', async () => {
  const r = await checkGithub(null)
  assert.equal(r.level, 'warn')
  assert.match(r.message, /GITHUB_TOKEN/)
})

test('GitHub: un fallo de red no lanza excepción', async () => {
  const fetchImpl = async () => {
    throw new Error('network down')
  }
  const r = await checkGithub(gh, { fetchImpl })
  assert.equal(r.level, 'error')
})

// ---------- Despliegue ----------

test('Sitio: producción construida desde otra rama que la que edita el panel es una advertencia', () => {
  const r = checkSite({ vercelEnv: 'production', deployBranch: 'main', dataBranch: 'master' })
  assert.equal(r.level, 'warn')
  assert.match(r.message, /main/)
  assert.match(r.message, /master/)
})

test('Sitio: producción y panel en la misma rama está bien', () => {
  const r = checkSite({ vercelEnv: 'production', deployBranch: 'master', dataBranch: 'master' })
  assert.equal(r.level, 'ok')
})

test('Sitio: una versión de vista previa avisa que no es el sitio real', () => {
  const r = checkSite({ vercelEnv: 'preview', deployBranch: 'master', dataBranch: 'master' })
  assert.equal(r.level, 'warn')
  assert.match(r.message, /prueba|vista previa/i)
})

test('Sitio: en local no hay nada que advertir', () => {
  const r = checkSite({ vercelEnv: undefined, deployBranch: undefined, dataBranch: 'master' })
  assert.equal(r.level, 'ok')
})
