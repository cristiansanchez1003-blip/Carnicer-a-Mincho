import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DAY_KEYS,
  emptySchedule,
  validateSchedule,
  getNowInSantiago,
  getOpenStatus,
  describeSchedule,
  scheduleRows,
  formatTime,
  statusLabel,
} from '../lib/hours.js'

// Horario real de la carnicería (según el texto que escribió Nicolás)
const A = [['09:00', '14:00'], ['16:00', '19:00']]
const C = [['09:00', '14:00'], ['16:00', '20:00']]
const schedule = {
  mon: A, tue: A, wed: [['09:00', '14:00']], thu: C, fri: C, sat: A, sun: [],
}
// Octubre de 2026: Chile está en horario de verano (UTC-3). Julio: UTC-4.
const at = (iso) => new Date(iso)

test('convierte un instante UTC a día y minutos en Santiago de Chile', () => {
  // Sábado 10-oct-2026 12:00 en Santiago = 15:00 UTC
  assert.deepEqual(getNowInSantiago(at('2026-10-10T15:00:00Z')), { dayKey: 'sat', minutes: 12 * 60 })
})

test('cerca de medianoche el día es el de Santiago, no el de UTC', () => {
  // 02:30 UTC del domingo = sábado 23:30 en Santiago
  assert.deepEqual(getNowInSantiago(at('2026-10-11T02:30:00Z')), { dayKey: 'sat', minutes: 23 * 60 + 30 })
})

test('en invierno el desfase es de 4 horas', () => {
  // Martes 14-jul-2026 13:00 UTC = 09:00 en Santiago
  assert.deepEqual(getNowInSantiago(at('2026-07-14T13:00:00Z')), { dayKey: 'tue', minutes: 9 * 60 })
})

test('abierto en medio de un tramo, informa a qué hora cierra', () => {
  const s = getOpenStatus(schedule, at('2026-10-10T15:00:00Z')) // sábado 12:00
  assert.equal(s.state, 'open')
  assert.equal(s.closesAt, '14:00')
})

test('el minuto exacto de apertura ya está abierto y el de cierre ya está cerrado', () => {
  assert.equal(getOpenStatus(schedule, at('2026-10-10T12:00:00Z')).state, 'open') // sáb 09:00
  assert.equal(getOpenStatus(schedule, at('2026-10-10T11:59:00Z')).state, 'closed') // sáb 08:59
  assert.equal(getOpenStatus(schedule, at('2026-10-10T17:00:00Z')).state, 'closed') // sáb 14:00
})

test('en el descanso de mediodía cerrado, abre hoy a las 16:00', () => {
  const s = getOpenStatus(schedule, at('2026-10-10T18:30:00Z')) // sáb 15:30
  assert.equal(s.state, 'closed')
  assert.deepEqual(s.next, { when: 'today', dayKey: 'sat', time: '16:00' })
})

test('después del último tramo y con domingo cerrado, abre el lunes', () => {
  const s = getOpenStatus(schedule, at('2026-10-10T22:00:00Z')) // sáb 19:00
  assert.equal(s.state, 'closed')
  assert.deepEqual(s.next, { when: 'day', dayKey: 'mon', time: '09:00' })
})

test('el miércoles cierra a las 14:00 y abre mañana temprano', () => {
  const s = getOpenStatus(schedule, at('2026-10-07T17:00:00Z')) // miércoles 14:00
  assert.equal(s.state, 'closed')
  assert.deepEqual(s.next, { when: 'tomorrow', dayKey: 'thu', time: '09:00' })
})

test('un día cerrado entero indica que abre mañana', () => {
  const s = getOpenStatus(schedule, at('2026-10-11T15:00:00Z')) // domingo 12:00
  assert.equal(s.state, 'closed')
  assert.deepEqual(s.next, { when: 'tomorrow', dayKey: 'mon', time: '09:00' })
})

test('con todos los días cerrados no hay próxima apertura', () => {
  const s = getOpenStatus(emptySchedule(), at('2026-10-10T15:00:00Z'))
  assert.equal(s.state, 'closed')
  assert.equal(s.next, null)
})

test('sin horario configurado el estado es desconocido (no se muestra "abierto")', () => {
  assert.equal(getOpenStatus(undefined, at('2026-10-10T15:00:00Z')).state, 'unknown')
  assert.equal(getOpenStatus(null, at('2026-10-10T15:00:00Z')).state, 'unknown')
})

test('formatTime: 24 horas en español y AM/PM en inglés', () => {
  assert.equal(formatTime('09:00', 'es'), '09:00')
  assert.equal(formatTime('09:00', 'en'), '9:00 AM')
  assert.equal(formatTime('14:00', 'en'), '2:00 PM')
  assert.equal(formatTime('00:30', 'en'), '12:30 AM')
  assert.equal(formatTime('12:00', 'en'), '12:00 PM')
})

test('describeSchedule agrupa los días con el mismo horario (español)', () => {
  assert.equal(
    describeSchedule(schedule, 'es'),
    'Lun, Mar y Sáb: 09:00–14:00 y 16:00–19:00 · Mié: 09:00–14:00 · Jue y Vie: 09:00–14:00 y 16:00–20:00 · Dom: cerrado'
  )
})

test('describeSchedule en inglés usa AM/PM', () => {
  assert.equal(
    describeSchedule(schedule, 'en'),
    'Mon, Tue & Sat: 9:00 AM–2:00 PM and 4:00 PM–7:00 PM · Wed: 9:00 AM–2:00 PM · Thu & Fri: 9:00 AM–2:00 PM and 4:00 PM–8:00 PM · Sun: closed'
  )
})

test('describeSchedule compacta tres o más días seguidos', () => {
  const todos = { ...emptySchedule() }
  for (const d of ['mon', 'tue', 'wed', 'thu', 'fri']) todos[d] = [['09:00', '18:00']]
  assert.equal(describeSchedule(todos, 'es'), 'Lun a Vie: 09:00–18:00 · Sáb y Dom: cerrado')
})

test('scheduleRows entrega filas para mostrar en el pie de página', () => {
  const rows = scheduleRows(schedule, 'es')
  assert.equal(rows.length, 4)
  assert.deepEqual(rows[0], { days: 'Lun, Mar y Sáb', text: '09:00–14:00 y 16:00–19:00', closed: false })
  assert.deepEqual(rows[3], { days: 'Dom', text: 'cerrado', closed: true })
})

test('statusLabel arma el texto según el estado y el idioma', () => {
  const abierto = getOpenStatus(schedule, at('2026-10-10T15:00:00Z'))
  assert.equal(statusLabel(abierto, 'es'), 'Abierto ahora · cierra a las 14:00')
  assert.equal(statusLabel(abierto, 'en'), 'Open now · closes at 2:00 PM')
  const descanso = getOpenStatus(schedule, at('2026-10-10T18:30:00Z'))
  assert.equal(statusLabel(descanso, 'es'), 'Cerrado · abre hoy a las 16:00')
  const manana = getOpenStatus(schedule, at('2026-10-07T17:00:00Z'))
  assert.equal(statusLabel(manana, 'en'), 'Closed · opens tomorrow at 9:00 AM')
  const lunes = getOpenStatus(schedule, at('2026-10-10T22:00:00Z'))
  assert.equal(statusLabel(lunes, 'es'), 'Cerrado · abre el lunes a las 09:00')
  assert.equal(statusLabel(lunes, 'en'), 'Closed · opens Monday at 9:00 AM')
  assert.equal(statusLabel({ state: 'unknown' }, 'es'), '')
})

test('validateSchedule acepta el horario real y el vacío', () => {
  assert.equal(validateSchedule(schedule), null)
  assert.equal(validateSchedule(emptySchedule()), null)
})

test('validateSchedule rechaza horas inválidas, tramos invertidos o superpuestos', () => {
  assert.match(validateSchedule({ ...schedule, mon: [['9', '14:00']] }), /hora/i)
  assert.match(validateSchedule({ ...schedule, mon: [['25:00', '26:00']] }), /hora/i)
  assert.match(validateSchedule({ ...schedule, mon: [['14:00', '09:00']] }), /antes/i)
  assert.match(validateSchedule({ ...schedule, mon: [['09:00', '14:00'], ['13:00', '18:00']] }), /superpone|solap/i)
  assert.match(validateSchedule({ ...schedule, mon: 'abierto' }), /horario/i)
  assert.match(validateSchedule({ ...schedule, lunes: A }), /día/i)
})

test('los 7 días existen en el orden de la semana chilena', () => {
  assert.deepEqual(DAY_KEYS, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
})
