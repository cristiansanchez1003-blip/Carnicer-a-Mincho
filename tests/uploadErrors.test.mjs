import test from 'node:test'
import assert from 'node:assert/strict'
import { readBody, uploadErrorMessage, MAX_UPLOAD_BYTES } from '../lib/uploadErrors.js'

const fakeResponse = (text) => ({ text: async () => text })

test('el límite de subida queda por debajo del tope de 4,5 MB de Vercel', () => {
  assert.ok(MAX_UPLOAD_BYTES < 4.5 * 1024 * 1024)
})

test('readBody interpreta JSON válido', async () => {
  const { data } = await readBody(fakeResponse('{"error":"x"}'))
  assert.deepEqual(data, { error: 'x' })
})

test('readBody no revienta con el texto plano que devuelve Vercel en un 413', async () => {
  const { data, text } = await readBody(
    fakeResponse('Request Entity Too Large\n\nFUNCTION_PAYLOAD_TOO_LARGE')
  )
  assert.equal(data, null)
  assert.match(text, /FUNCTION_PAYLOAD_TOO_LARGE/)
})

test('un 413 de la plataforma se explica en español claro', () => {
  const msg = uploadErrorMessage(413, null)
  assert.match(msg, /pesada|grande/i)
  assert.doesNotMatch(msg, /JSON|token|Unexpected/i)
})

test('el mensaje del servidor tiene prioridad cuando existe', () => {
  assert.equal(uploadErrorMessage(502, { error: 'GitHub rechazó el token.' }), 'GitHub rechazó el token.')
})

test('sesión vencida pide volver a ingresar', () => {
  assert.match(uploadErrorMessage(401, null), /sesión/i)
})

test('timeouts piden revisar la conexión', () => {
  assert.match(uploadErrorMessage(504, null), /conexión/i)
})

test('un error 5xx genérico incluye el código para poder reportarlo', () => {
  assert.match(uploadErrorMessage(500, null), /500/)
})
