import test from 'node:test'
import assert from 'node:assert/strict'
import { activeNotice, validateNotice, isValidISODate, NOTICE_MAX } from '../lib/notice.js'

test('isValidISODate acepta solo fechas reales del calendario', () => {
  assert.equal(isValidISODate('2026-12-25'), true)
  assert.equal(isValidISODate('2028-02-29'), true) // bisiesto
  for (const bad of ['2026-02-30', '2027-02-29', '2026-13-01', '2026-00-10', '25/12/2026', '', null, undefined, 20261225]) {
    assert.equal(isValidISODate(bad), false, String(bad))
  }
})

test('validateNotice: todo vacío es válido; texto largo y fechas falsas no', () => {
  assert.equal(validateNotice({}), null)
  assert.equal(validateNotice({ notice: '', notice_en: '', noticeUntil: '' }), null)
  assert.equal(validateNotice({ notice: 'x'.repeat(NOTICE_MAX) }), null)
  assert.match(validateNotice({ notice: 'x'.repeat(NOTICE_MAX + 1) }), /demasiado largo/)
  assert.match(validateNotice({ notice_en: 'x'.repeat(NOTICE_MAX + 1) }), /inglés/)
  assert.match(validateNotice({ notice: 42 }), /texto/)
  assert.match(validateNotice({ noticeUntil: '2026-02-30' }), /fecha/i)
})

test('activeNotice: sin texto no hay aviso, aunque haya fecha', () => {
  assert.equal(activeNotice({}, 'es', '2026-10-10'), '')
  assert.equal(activeNotice({ notice: '   ', noticeUntil: '2026-12-31' }, 'es', '2026-10-10'), '')
})

test('activeNotice: sin fecha límite se muestra siempre; con fecha, hasta ese día inclusive', () => {
  const s = { notice: 'Hoy cerrado' }
  assert.equal(activeNotice(s, 'es', '2030-01-01'), 'Hoy cerrado')
  const t = { notice: 'Feriado', noticeUntil: '2026-10-12' }
  assert.equal(activeNotice(t, 'es', '2026-10-11'), 'Feriado')
  assert.equal(activeNotice(t, 'es', '2026-10-12'), 'Feriado') // último día: aún se ve
  assert.equal(activeNotice(t, 'es', '2026-10-13'), '')
})

test('activeNotice: en inglés usa notice_en y, si falta, el español', () => {
  const both = { notice: 'Cerrado hoy', notice_en: 'Closed today' }
  assert.equal(activeNotice(both, 'en', '2026-10-10'), 'Closed today')
  assert.equal(activeNotice(both, 'es', '2026-10-10'), 'Cerrado hoy')
  assert.equal(activeNotice({ notice: 'Cerrado hoy', notice_en: '  ' }, 'en', '2026-10-10'), 'Cerrado hoy')
})

test('activeNotice: una fecha límite inválida no oculta el aviso', () => {
  assert.equal(activeNotice({ notice: 'Aviso', noticeUntil: 'basura' }, 'es', '2026-10-10'), 'Aviso')
})
