import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { readCloudinaryConfig, signParams, describeCloudinaryError } from '../lib/cloudinary.js'

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex')

test('lee la configuración y recorta espacios y saltos de línea pegados por error', () => {
  const { config, missing } = readCloudinaryConfig({
    CLOUDINARY_CLOUD_NAME: ' micloud\n',
    CLOUDINARY_API_KEY: '12345 ',
    CLOUDINARY_API_SECRET: 'abc_secret\r\n',
  })
  assert.deepEqual(missing, [])
  assert.deepEqual(config, { cloudName: 'micloud', apiKey: '12345', apiSecret: 'abc_secret' })
})

test('quita comillas que se copian junto con el valor', () => {
  const { config } = readCloudinaryConfig({
    CLOUDINARY_CLOUD_NAME: '"micloud"',
    CLOUDINARY_API_KEY: "'12345'",
    CLOUDINARY_API_SECRET: 'abc',
  })
  assert.equal(config.cloudName, 'micloud')
  assert.equal(config.apiKey, '12345')
})

test('informa qué variables faltan, solo por nombre', () => {
  const { config, missing } = readCloudinaryConfig({ CLOUDINARY_CLOUD_NAME: 'x', CLOUDINARY_API_KEY: '   ' })
  assert.equal(config, null)
  assert.deepEqual(missing, ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'])
})

test('la firma es SHA-1 de los parámetros ordenados alfabéticamente más el secreto', () => {
  const expected = sha1('folder=carniceria-mincho&timestamp=1700000000' + 'sekret')
  assert.equal(signParams({ timestamp: 1700000000, folder: 'carniceria-mincho' }, 'sekret'), expected)
})

test('la firma ignora parámetros vacíos y no depende del orden de entrada', () => {
  const a = signParams({ b: '2', a: '1', c: '' }, 's')
  const b = signParams({ a: '1', b: '2' }, 's')
  assert.equal(a, b)
  assert.equal(a, sha1('a=1&b=2' + 's'))
})

test('traduce "Invalid cloud_name" señalando la variable correcta', () => {
  assert.match(describeCloudinaryError(401, 'Invalid cloud_name micloud'), /CLOUDINARY_CLOUD_NAME/)
})

test('traduce firma inválida señalando el API Secret', () => {
  const msg = describeCloudinaryError(401, "Invalid Signature abc123. String to sign - 'folder=x&timestamp=1'.")
  assert.match(msg, /CLOUDINARY_API_SECRET/)
})

test('traduce API key inválida o desconocida', () => {
  assert.match(describeCloudinaryError(401, 'Invalid api_key 999'), /CLOUDINARY_API_KEY/)
  assert.match(describeCloudinaryError(401, 'Unknown API key 999'), /CLOUDINARY_API_KEY/)
  assert.match(describeCloudinaryError(400, 'Must supply api_key'), /CLOUDINARY_API_KEY/)
})

test('traduce límites de uso y cuenta deshabilitada', () => {
  assert.match(describeCloudinaryError(420, 'Rate Limit Exceeded'), /límite/i)
  assert.match(describeCloudinaryError(403, 'Account is disabled'), /cuenta/i)
})

test('un 401 sin detalle sugiere revisar las credenciales', () => {
  assert.match(describeCloudinaryError(401, 'Unauthorized'), /credenciales/i)
})

test('mensajes desconocidos se muestran acotados y con el prefijo de Cloudinary', () => {
  const msg = describeCloudinaryError(400, 'x'.repeat(500))
  assert.ok(msg.startsWith('Cloudinary respondió:'))
  assert.ok(msg.length < 260)
})

test('nunca devuelve el API Secret aunque venga dentro del mensaje', () => {
  const msg = describeCloudinaryError(400, 'algo raro con TOPSECRET123 adentro', { secret: 'TOPSECRET123' })
  assert.doesNotMatch(msg, /TOPSECRET123/)
})

test('apiBase usa Cloudinary real salvo en desarrollo, donde puede apuntar a un simulador', async () => {
  const { apiBase, CLOUDINARY_API_BASE } = await import('../lib/cloudinary.js')
  assert.equal(apiBase({ NODE_ENV: 'development' }), CLOUDINARY_API_BASE)
  assert.equal(apiBase({ NODE_ENV: 'development', CLOUDINARY_API_BASE: 'http://localhost:4010' }), 'http://localhost:4010')
  // En producción el override se ignora: nunca se envían firmas ni fotos a otro host.
  assert.equal(apiBase({ NODE_ENV: 'production', CLOUDINARY_API_BASE: 'http://evil.test' }), CLOUDINARY_API_BASE)
})
