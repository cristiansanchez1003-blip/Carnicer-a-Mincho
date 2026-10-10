import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  detectImageType,
  imageName,
  isImageName,
  imageMime,
  imageUrl,
  saveImage,
  readImage,
  describeImageError,
} from '../lib/imageStore.js'

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16]), Buffer.from('JFIF\0datos de prueba')])
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('xxxx')])
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 2, 3, 4]), Buffer.from('WEBPVP8 ')])
const CFG = { token: 'tok', repo: 'dueño/repo', branch: 'main' }

const response = (status, body = '') =>
  new Response(body, { status, headers: { 'content-type': 'application/json' } })

// ---------- detectImageType ----------

test('reconoce JPEG, PNG y WebP por sus primeros bytes', () => {
  assert.equal(detectImageType(JPEG), 'jpg')
  assert.equal(detectImageType(PNG), 'png')
  assert.equal(detectImageType(WEBP), 'webp')
})

test('rechaza lo que no es una imagen admitida (SVG, HTML, GIF, vacío)', () => {
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null)
  assert.equal(detectImageType(Buffer.from('<html><script>alert(1)</script></html>')), null)
  assert.equal(detectImageType(Buffer.from('GIF89a......')), null)
  assert.equal(detectImageType(Buffer.alloc(0)), null)
  assert.equal(detectImageType(null), null)
})

// ---------- nombres ----------

test('el nombre sale del contenido: misma foto, mismo nombre', () => {
  assert.equal(imageName(JPEG, 'jpg'), imageName(Buffer.from(JPEG), 'jpg'))
  assert.notEqual(imageName(JPEG, 'jpg'), imageName(PNG, 'png'))
  assert.match(imageName(JPEG, 'jpg'), /^[a-f0-9]{16}\.jpg$/)
})

test('isImageName solo acepta nombres generados por nosotros (sin rutas ni extensiones raras)', () => {
  assert.equal(isImageName('0123456789abcdef.jpg'), true)
  assert.equal(isImageName('0123456789abcdef.png'), true)
  assert.equal(isImageName('0123456789abcdef.webp'), true)
  for (const bad of [
    '../menu.json',
    '..%2Fmenu.json',
    'menu.json',
    '0123456789abcdef.svg',
    '0123456789abcdef.jpg/extra',
    '0123456789ABCDEF.jpg',
    '0123456789abcde.jpg',
    '0123456789abcdef.jpg ',
    '',
    undefined,
    null,
    42,
  ]) {
    assert.equal(isImageName(bad), false, String(bad))
  }
})

test('imageMime e imageUrl', () => {
  assert.equal(imageMime('0123456789abcdef.jpg'), 'image/jpeg')
  assert.equal(imageMime('0123456789abcdef.png'), 'image/png')
  assert.equal(imageMime('0123456789abcdef.webp'), 'image/webp')
  assert.equal(imageUrl('0123456789abcdef.jpg'), '/api/img/0123456789abcdef.jpg')
})

// ---------- modo local ----------

test('modo local: guarda la foto en la carpeta y la vuelve a leer igual', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mincho-img-'))
  try {
    const name = await saveImage(JPEG, 'jpg', { dir: path.join(dir, 'nueva', 'carpeta') })
    assert.equal(name, imageName(JPEG, 'jpg'))
    const back = await readImage(name, { dir: path.join(dir, 'nueva', 'carpeta') })
    assert.equal(back.mime, 'image/jpeg')
    assert.ok(back.buffer.equals(JPEG))
    // Repetir la subida no falla.
    assert.equal(await saveImage(JPEG, 'jpg', { dir: path.join(dir, 'nueva', 'carpeta') }), name)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('modo local: una foto que no existe devuelve null; un nombre inválido ni toca el disco', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mincho-img-'))
  try {
    assert.equal(await readImage('0123456789abcdef.jpg', { dir }), null)
    assert.equal(await readImage('../../etc/passwd', { dir }), null)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

// ---------- modo GitHub ----------

test('GitHub: sube el archivo con PUT en data/images, en la rama configurada y en base64', async () => {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init })
    return response(201, '{}')
  }
  const name = await saveImage(JPEG, 'jpg', { cfg: CFG, fetchImpl })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, `https://api.github.com/repos/dueño/repo/contents/data/images/${name}`)
  assert.equal(calls[0].init.method, 'PUT')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok')
  const body = JSON.parse(calls[0].init.body)
  assert.equal(body.branch, 'main')
  assert.equal(body.content, JPEG.toString('base64'))
  assert.equal(body.sha, undefined)
  assert.match(body.message, /Foto subida/)
})

test('GitHub: reintenta una vez si hubo un conflicto (409)', async () => {
  const statuses = [409, 201]
  const fetchImpl = async () => response(statuses.shift(), '{}')
  const name = await saveImage(JPEG, 'jpg', { cfg: CFG, fetchImpl })
  assert.equal(name, imageName(JPEG, 'jpg'))
  assert.equal(statuses.length, 0)
})

test('GitHub: si la foto ya estaba guardada (422 por sha) se considera subida', async () => {
  const fetchImpl = async () => response(422, '{"message":"Invalid request.\\n\\n\\"sha\\" wasn\'t supplied."}')
  assert.equal(await saveImage(JPEG, 'jpg', { cfg: CFG, fetchImpl }), imageName(JPEG, 'jpg'))
})

test('GitHub: otros 422 y los errores de permisos sí fallan con el estado', async () => {
  for (const [status, body] of [[422, '{"message":"Branch not found"}'], [401, ''], [403, ''], [404, ''], [500, '']]) {
    await assert.rejects(
      saveImage(JPEG, 'jpg', { cfg: CFG, fetchImpl: async () => response(status, body) }),
      (err) => err.status === status,
      `estado ${status}`
    )
  }
})

test('GitHub: lee la foto en bruto desde la rama configurada', async () => {
  const name = imageName(JPEG, 'jpg')
  let seen
  const fetchImpl = async (url, init) => {
    seen = { url, init }
    return new Response(JPEG, { status: 200 })
  }
  const back = await readImage(name, { cfg: CFG, fetchImpl })
  assert.equal(seen.url, `https://api.github.com/repos/dueño/repo/contents/data/images/${name}?ref=main`)
  assert.equal(seen.init.headers.Accept, 'application/vnd.github.raw+json')
  assert.ok(back.buffer.equals(JPEG))
  assert.equal(back.mime, 'image/jpeg')
})

test('GitHub: 404 devuelve null y otros errores se propagan; un nombre inválido no consulta a GitHub', async () => {
  const name = '0123456789abcdef.png'
  assert.equal(await readImage(name, { cfg: CFG, fetchImpl: async () => response(404) }), null)
  await assert.rejects(readImage(name, { cfg: CFG, fetchImpl: async () => response(502) }), (err) => err.status === 502)
  let called = false
  assert.equal(
    await readImage('../data/menu.json', { cfg: CFG, fetchImpl: async () => ((called = true), response(200)) }),
    null
  )
  assert.equal(called, false)
})

// ---------- mensajes ----------

test('describeImageError explica en español qué hacer', () => {
  assert.match(describeImageError(401), /token/)
  assert.match(describeImageError(403), /Contents: Read and write/)
  assert.match(describeImageError(404), /Contents: Read and write/)
  assert.match(describeImageError(429), /esperar/)
  assert.match(describeImageError(500), /500/)
})
