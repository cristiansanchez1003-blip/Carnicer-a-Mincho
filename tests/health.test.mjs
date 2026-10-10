import test from 'node:test'
import assert from 'node:assert/strict'
import { checkGithub, checkImages, checkSite, tokenAlert, tokenDaysLeft } from '../lib/health.js'

const res = (status, { body = '', headers = {} } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
})

test('tokenDaysLeft calcula los días que faltan según el encabezado de GitHub', () => {
  const now = Date.UTC(2026, 9, 8, 12, 0, 0)
  assert.equal(tokenDaysLeft('2026-11-02 12:00:00 UTC', now), 25)
})

test('tokenDaysLeft devuelve null si no hay encabezado o es ilegible', () => {
  assert.equal(tokenDaysLeft(null, Date.now()), null)
  assert.equal(tokenDaysLeft('cualquier cosa', Date.now()), null)
})

const gh = { token: 'ghp_test', repo: 'dueno/repo', branch: 'master' }

test('Fotos: si GitHub permite crear el blob de prueba, está ok y no se hace ningún commit', async () => {
  let seen
  const fetchImpl = async (url, opts) => {
    seen = { url, opts }
    return res(201, { body: { sha: 'abc' } })
  }
  const r = await checkImages(gh, { fetchImpl })
  assert.equal(r.level, 'ok')
  assert.equal(seen.url, 'https://api.github.com/repos/dueno/repo/git/blobs')
  assert.equal(seen.opts.method, 'POST')
  assert.equal(seen.opts.headers.Authorization, 'Bearer ghp_test')
})

test('Fotos: sin permiso de escritura (403/404) explica qué permiso falta', async () => {
  for (const status of [403, 404]) {
    const r = await checkImages(gh, { fetchImpl: async () => res(status, { body: { message: 'x' } }) })
    assert.equal(r.level, 'error', String(status))
    assert.match(r.message, /Contents: Read and write/)
  }
})

test('Fotos: token vencido (401) nombra GITHUB_TOKEN', async () => {
  const r = await checkImages(gh, { fetchImpl: async () => res(401, { body: { message: 'Bad credentials' } }) })
  assert.equal(r.level, 'error')
  assert.match(r.message, /GITHUB_TOKEN/)
})

test('Fotos: sin token avisa que no persisten en Vercel', async () => {
  const r = await checkImages(null)
  assert.equal(r.level, 'warn')
  assert.match(r.message, /GITHUB_TOKEN/)
})

test('Fotos: un fallo de red no lanza excepción ni filtra el token', async () => {
  const r = await checkImages(gh, {
    fetchImpl: async () => {
      throw new Error('network down ghp_test')
    },
  })
  assert.equal(r.level, 'error')
  assert.doesNotMatch(r.message, /ghp_test/)
})

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

// ---------- Aviso de vencimiento del token (para el panel) ----------

test('GitHub: un token rechazado trae un código para poder avisar en el panel', async () => {
  const r = await checkGithub(gh, { fetchImpl: async () => res(401, { body: { message: 'Bad credentials' } }) })
  assert.equal(r.code, 'token-invalid')
})

test('tokenAlert: sin problemas, sin fecha de vencimiento o con mucho margen no avisa', () => {
  assert.equal(tokenAlert(null), null)
  assert.equal(tokenAlert({ level: 'ok', daysLeft: null }), null)
  assert.equal(tokenAlert({ level: 'ok', daysLeft: 16 }), null)
  assert.equal(tokenAlert({ level: 'warn', message: 'Falta GITHUB_TOKEN' }), null) // modo local: no es un vencimiento
  assert.equal(tokenAlert({ level: 'error', message: 'No se pudo conectar' }), null) // una caída de red no es un aviso de token
})

test('tokenAlert: 15 días o menos avisa, y cada vez más urgente', () => {
  assert.equal(tokenAlert({ daysLeft: 15 }).level, 'warn')
  assert.match(tokenAlert({ daysLeft: 15 }).message, /vence en 15 días/)
  assert.match(tokenAlert({ daysLeft: 2 }).message, /vence en 2 días/)
  assert.equal(tokenAlert({ daysLeft: 2 }).level, 'error')
  assert.match(tokenAlert({ daysLeft: 1 }).message, /vence mañana/)
  assert.match(tokenAlert({ daysLeft: 0 }).message, /vence hoy/)
  assert.match(tokenAlert({ daysLeft: -1 }).message, /ya venció/)
})

test('tokenAlert: un token rechazado es un aviso de error y nombra a quién avisar', () => {
  const a = tokenAlert({ level: 'error', code: 'token-invalid' })
  assert.equal(a.level, 'error')
  assert.match(a.message, /no se podrán guardar cambios/)
  assert.match(a.message, /Espíritu Digital/)
})

test('GitHub: el mensaje habla de "1 día" en singular', async () => {
  const now = Date.UTC(2026, 9, 8)
  const fetchImpl = async () => res(200, { headers: { 'github-authentication-token-expiration': '2026-10-09 12:00:00 UTC' } })
  const r = await checkGithub(gh, { fetchImpl, now })
  assert.match(r.message, /vence en 1 día\b/)
})
