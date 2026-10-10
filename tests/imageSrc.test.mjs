import test from 'node:test'
import assert from 'node:assert/strict'
import { optimizedImage, IMAGE_WIDTHS } from '../lib/imageSrc.js'

test('las fotos subidas desde el panel se piden al optimizador en varios anchos', () => {
  const r = optimizedImage('/api/img/0123456789abcdef.jpg')
  assert.match(r.src, /^\/_next\/image\?url=%2Fapi%2Fimg%2F0123456789abcdef\.jpg&w=828&q=75$/)
  const parts = r.srcSet.split(', ')
  assert.equal(parts.length, IMAGE_WIDTHS.length)
  for (const [i, w] of IMAGE_WIDTHS.entries()) {
    assert.equal(parts[i], `/_next/image?url=%2Fapi%2Fimg%2F0123456789abcdef.jpg&w=${w}&q=75 ${w}w`)
  }
})

test('los anchos son los que Next permite por defecto (si no, el optimizador responde 400)', () => {
  const allowed = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  for (const w of IMAGE_WIDTHS) assert.ok(allowed.includes(w), String(w))
})

test('otras imágenes (rutas del sitio, Unsplash, vacías) no se tocan', () => {
  for (const src of ['/images/products/filete.jpg', 'https://images.unsplash.com/x.jpg', '', null, undefined, 42]) {
    assert.equal(optimizedImage(src), null, String(src))
  }
})
