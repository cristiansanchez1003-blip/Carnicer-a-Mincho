import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { readMenu, writeMenu, validateMenu } from '../lib/menuStore.js'

const base = () => ({
  settings: {
    name: 'Carnicería',
    whatsapp: '56974543692',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=x',
    mapsEmbed: 'https://www.google.com/maps?q=x&output=embed',
    instagram: '',
  },
  categories: [{ id: 'vacuno', name: 'Vacuno', emoji: '🥩', sort: 1 }],
  products: [
    { id: 'a', categoryId: 'vacuno', name: 'Lomo', price: 1000, unit: 'kg', image: 'https://x.test/a.jpg', available: true, sort: 1 },
  ],
})

// ---------- validateMenu ----------

test('acepta un menú válido', () => {
  assert.equal(validateMenu(base()), null)
})

test('acepta el menú real guardado en data/menu.json', () => {
  const real = JSON.parse(fs.readFileSync(new URL('../data/menu.json', import.meta.url), 'utf8'))
  assert.equal(validateMenu(real), null)
})

test('rechaza precios negativos, NaN o infinitos', () => {
  for (const price of [-1, NaN, Infinity]) {
    const m = base()
    m.products[0].price = price
    assert.match(validateMenu(m), /precio/i, `precio ${price}`)
  }
})

test('rechaza ids de producto repetidos', () => {
  const m = base()
  m.products.push({ ...m.products[0] })
  assert.match(validateMenu(m), /repetid|duplicad/i)
})

test('rechaza productos que apuntan a una categoría que no existe', () => {
  const m = base()
  m.products[0].categoryId = 'fantasma'
  assert.match(validateMenu(m), /categor/i)
})

test('rechaza unidades de venta desconocidas pero acepta vacío', () => {
  const m = base()
  m.products[0].unit = 'tonelada'
  assert.match(validateMenu(m), /unidad/i)
  m.products[0].unit = ''
  assert.equal(validateMenu(m), null)
})

test('rechaza imágenes con esquemas peligrosos o http plano', () => {
  for (const image of ['javascript:alert(1)', 'data:text/html;base64,AAAA', 'http://x.test/a.jpg']) {
    const m = base()
    m.products[0].image = image
    assert.match(validateMenu(m), /imagen/i, image)
  }
})

test('acepta imágenes https y rutas locales del sitio', () => {
  const m = base()
  m.products[0].image = '/images/products/lomo.jpg'
  assert.equal(validateMenu(m), null)
})

test('rechaza URLs de mapa o Instagram que no sean https', () => {
  for (const field of ['mapsUrl', 'mapsEmbed', 'instagram']) {
    const m = base()
    m.settings[field] = 'javascript:alert(1)'
    assert.match(validateMenu(m), new RegExp(field), field)
  }
})

test('rechaza un WhatsApp que no sean solo dígitos', () => {
  const m = base()
  m.settings.whatsapp = '+56 9 7454 3692'
  assert.match(validateMenu(m), /whatsapp/i)
})

test('rechaza nombres de producto desmesurados', () => {
  const m = base()
  m.products[0].name = 'x'.repeat(200)
  assert.match(validateMenu(m), /nombre/i)
})

// ---------- acceso a GitHub (con fetch simulado) ----------

const resp = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
})

async function withGithub(fetchImpl, fn) {
  const saved = { fetch: globalThis.fetch, env: { ...process.env } }
  process.env.GITHUB_TOKEN = '  ghp_test\n'
  process.env.GITHUB_REPO = 'dueno/repo\n'
  process.env.GITHUB_BRANCH = ' master '
  globalThis.fetch = fetchImpl
  try {
    return await fn()
  } finally {
    globalThis.fetch = saved.fetch
    for (const k of ['GITHUB_TOKEN', 'GITHUB_REPO', 'GITHUB_BRANCH']) {
      if (saved.env[k] === undefined) delete process.env[k]
      else process.env[k] = saved.env[k]
    }
  }
}

test('recorta espacios y saltos de línea de las variables de GitHub', async () => {
  const urls = []
  await withGithub(
    async (url, opts) => {
      urls.push({ url, auth: opts.headers.Authorization })
      return resp(200, base())
    },
    () => readMenu()
  )
  assert.equal(urls[0].url, 'https://api.github.com/repos/dueno/repo/contents/data/menu.json?ref=master')
  assert.equal(urls[0].auth, 'Bearer ghp_test')
})

test('lectura normal: si GitHub falla, cae a la copia local del repositorio', async () => {
  const menu = await withGithub(async () => resp(500, 'boom'), () => readMenu())
  assert.ok(Array.isArray(menu.products))
})

test('lectura estricta: si GitHub falla, lanza error en vez de servir datos viejos', async () => {
  await assert.rejects(
    withGithub(async () => resp(500, 'boom'), () => readMenu({ strict: true })),
    /GitHub/
  )
})

test('lectura estricta devuelve de dónde vino el dato', async () => {
  const out = await withGithub(async () => resp(200, base()), () => readMenu({ strict: true, withSource: true }))
  assert.equal(out.source, 'github')
  assert.equal(out.menu.products.length, 1)
})

test('escritura: reintenta una vez si GitHub responde 409 por un cambio concurrente', async () => {
  const puts = []
  let metaCalls = 0
  const result = await withGithub(
    async (url, opts) => {
      if (!opts || opts.method === 'GET' || !opts.method) {
        metaCalls++
        return resp(200, { sha: metaCalls === 1 ? 'sha-viejo' : 'sha-nuevo' })
      }
      puts.push(JSON.parse(opts.body).sha)
      return puts.length === 1 ? resp(409, 'conflict') : resp(200, { ok: true })
    },
    () => writeMenu(base())
  )
  assert.deepEqual(puts, ['sha-viejo', 'sha-nuevo'])
  assert.equal(result.source, 'github')
})

test('escritura: si el conflicto persiste tras el reintento, falla con el detalle', async () => {
  await assert.rejects(
    withGithub(
      async (url, opts) =>
        !opts?.method || opts.method === 'GET' ? resp(200, { sha: 's' }) : resp(409, 'conflict'),
      () => writeMenu(base())
    ),
    /409/
  )
})
