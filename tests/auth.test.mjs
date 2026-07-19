import test, { mock } from 'node:test'
import assert from 'node:assert/strict'
import { createToken, verifyToken, checkCredentials } from '../lib/auth.js'

function withEnv(vars, fn) {
  const saved = {}
  for (const k of Object.keys(vars)) saved[k] = process.env[k]
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  try {
    return fn()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  }
}

const SECRET = 'un-secreto-de-prueba-bien-largo-1234567890'

test('un token firmado con el secreto verifica y devuelve el usuario', () => {
  withEnv({ AUTH_SECRET: SECRET, NODE_ENV: 'production' }, () => {
    const data = verifyToken(createToken('Gloria'))
    assert.equal(data.u, 'Gloria')
  })
})

test('un token con la firma alterada se rechaza', () => {
  withEnv({ AUTH_SECRET: SECRET, NODE_ENV: 'production' }, () => {
    const [payload, sig] = createToken('Gloria').split('.')
    const forged = `${payload}.${sig.slice(0, -2)}AA`
    assert.equal(verifyToken(forged), null)
  })
})

test('un token firmado con otro secreto se rechaza', () => {
  const token = withEnv({ AUTH_SECRET: SECRET, NODE_ENV: 'production' }, () => createToken('Gloria'))
  withEnv({ AUTH_SECRET: SECRET + 'x', NODE_ENV: 'production' }, () => {
    assert.equal(verifyToken(token), null)
  })
})

test('un token vencido se rechaza', () => {
  withEnv({ AUTH_SECRET: SECRET, NODE_ENV: 'production' }, () => {
    const t = mock.method(Date, 'now', () => 0)
    const old = createToken('Gloria')
    t.mock.restore()
    assert.equal(verifyToken(old), null)
  })
})

test('en producción sin AUTH_SECRET no se pueden emitir ni aceptar sesiones', () => {
  withEnv({ AUTH_SECRET: undefined, NODE_ENV: 'production' }, () => {
    assert.throws(() => createToken('Gloria'), /AUTH_SECRET/)
    // Un token forjado con el secreto por defecto del código también debe fallar
    const forged = withEnv({ AUTH_SECRET: 'dev-secret-cambiar-en-produccion', NODE_ENV: 'development' }, () =>
      createToken('Gloria')
    )
    assert.equal(verifyToken(forged), null)
  })
})

test('en producción un AUTH_SECRET demasiado corto se trata como no configurado', () => {
  withEnv({ AUTH_SECRET: 'corto', NODE_ENV: 'production' }, () => {
    assert.throws(() => createToken('Gloria'), /AUTH_SECRET/)
  })
})

test('en desarrollo funciona sin AUTH_SECRET para no estorbar el trabajo local', () => {
  withEnv({ AUTH_SECRET: undefined, NODE_ENV: 'development' }, () => {
    assert.equal(verifyToken(createToken('Gloria')).u, 'Gloria')
  })
})

test('credenciales: acepta contraseñas con tildes y rechaza las incorrectas', () => {
  withEnv({ ADMIN_USER: 'Gloria', ADMIN_PASSWORD: 'carnicería mincho 2026' }, () => {
    assert.equal(checkCredentials('Gloria', 'carnicería mincho 2026'), true)
    assert.equal(checkCredentials('Gloria', 'carniceria mincho 2026'), false)
    assert.equal(checkCredentials('gloria', 'carnicería mincho 2026'), false)
  })
})

test('credenciales: sin ADMIN_PASSWORD nadie entra', () => {
  withEnv({ ADMIN_USER: 'Gloria', ADMIN_PASSWORD: undefined }, () => {
    assert.equal(checkCredentials('Gloria', ''), false)
  })
})

test('credenciales: recorta espacios y saltos de línea de las variables', () => {
  withEnv({ ADMIN_USER: ' Gloria\n', ADMIN_PASSWORD: 'clave-segura\r\n' }, () => {
    assert.equal(checkCredentials('Gloria', 'clave-segura'), true)
  })
})
