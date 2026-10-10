import { translate } from './i18n.js'

// Horario semanal estructurado. Formato en data/menu.json -> settings.schedule:
//   { mon: [["09:00","14:00"],["16:00","19:00"]], tue: [...], ..., sun: [] }
// Un día sin tramos está cerrado. Las horas son de Chile continental (America/Santiago).

export const TIME_ZONE = 'America/Santiago'
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DAY_NAMES = {
  es: { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' },
  en: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
}
export const DAY_SHORT = {
  es: { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' },
  en: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const MAX_RANGES_PER_DAY = 3
const WEEKDAY_FROM_INTL = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' }

export const emptySchedule = () => Object.fromEntries(DAY_KEYS.map((d) => [d, []]))

export function timeToMinutes(hhmm) {
  if (!TIME_RE.test(String(hhmm))) return NaN
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// "14:00" -> "14:00" (es) o "2:00 PM" (en)
export function formatTime(hhmm, lang = 'es') {
  if (lang !== 'en') return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

// Devuelve un mensaje de error en español, o null si el horario es válido.
export function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    return 'El horario no tiene un formato válido'
  }
  for (const [day, ranges] of Object.entries(schedule)) {
    if (!DAY_KEYS.includes(day)) return `Día desconocido en el horario: ${day}`
    const name = DAY_NAMES.es[day]
    if (!Array.isArray(ranges)) return `El horario de ${name} no es válido`
    if (ranges.length > MAX_RANGES_PER_DAY) return `El horario de ${name} tiene demasiados tramos`
    const parsed = []
    for (const range of ranges) {
      if (!Array.isArray(range) || range.length !== 2) return `El horario de ${name} no es válido`
      const [start, end] = range.map(timeToMinutes)
      if (Number.isNaN(start) || Number.isNaN(end)) {
        return `Hora inválida en el horario de ${name}: usa el formato HH:MM`
      }
      if (start >= end) {
        return `En el horario de ${name}, la hora de apertura debe ser antes de la de cierre`
      }
      parsed.push([start, end])
    }
    parsed.sort((a, b) => a[0] - b[0])
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i][0] < parsed[i - 1][1]) return `Los tramos del horario de ${name} se superponen`
    }
  }
  return null
}

// Día de la semana y minutos desde la medianoche en Santiago para un instante dado.
export function getNowInSantiago(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value
  return {
    dayKey: WEEKDAY_FROM_INTL[get('weekday')],
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

const rangesOf = (schedule, day) => (Array.isArray(schedule?.[day]) ? schedule[day] : [])

// Estado actual:
//  { state: 'open', closesAt }
//  { state: 'closed', next: { when: 'today'|'tomorrow'|'day', dayKey, time } | null }
//  { state: 'unknown' }  (sin horario configurado: no se afirma nada)
export function getOpenStatus(schedule, date = new Date()) {
  if (!schedule || typeof schedule !== 'object') return { state: 'unknown' }
  const { dayKey, minutes } = getNowInSantiago(date)

  for (const [start, end] of rangesOf(schedule, dayKey)) {
    if (timeToMinutes(start) <= minutes && minutes < timeToMinutes(end)) {
      return { state: 'open', closesAt: end }
    }
  }

  const laterToday = rangesOf(schedule, dayKey).find(([start]) => timeToMinutes(start) > minutes)
  if (laterToday) return { state: 'closed', next: { when: 'today', dayKey, time: laterToday[0] } }

  const index = DAY_KEYS.indexOf(dayKey)
  for (let ahead = 1; ahead <= 7; ahead++) {
    const nextKey = DAY_KEYS[(index + ahead) % 7]
    const ranges = rangesOf(schedule, nextKey)
    if (ranges.length) {
      return {
        state: 'closed',
        next: { when: ahead === 1 ? 'tomorrow' : 'day', dayKey: nextKey, time: ranges[0][0] },
      }
    }
  }
  return { state: 'closed', next: null }
}

// Texto del estado: "Abierto ahora · cierra a las 14:00", "Cerrado · abre hoy a las 16:00"…
export function statusLabel(status, lang = 'es') {
  if (status?.state === 'open') {
    return `${translate(lang, 'openNow')} · ${translate(lang, 'closesAt', { time: formatTime(status.closesAt, lang) })}`
  }
  if (status?.state !== 'closed') return ''
  const closed = translate(lang, 'closedNow')
  const next = status.next
  if (!next) return closed
  const time = formatTime(next.time, lang)
  if (next.when === 'today') return `${closed} · ${translate(lang, 'opensToday', { time })}`
  if (next.when === 'tomorrow') return `${closed} · ${translate(lang, 'opensTomorrow', { time })}`
  const name = DAY_NAMES[lang]?.[next.dayKey] ?? DAY_NAMES.es[next.dayKey]
  const day = lang === 'en' ? name : name.toLowerCase()
  return `${closed} · ${translate(lang, 'opensDay', { day, time })}`
}

// ---- Descripción en texto (para la portada, el pie y los campos hours / hours_en) ----

const rangesText = (ranges, lang) => {
  if (!ranges.length) return translate(lang, 'closedAllDay')
  const parts = ranges.map(([s, e]) => `${formatTime(s, lang)}–${formatTime(e, lang)}`)
  return parts.join(lang === 'en' ? ' and ' : ' y ')
}

function joinDays(keys, lang) {
  const short = DAY_SHORT[lang] || DAY_SHORT.es
  const idx = keys.map((k) => DAY_KEYS.indexOf(k))
  const tokens = []
  for (let i = 0; i < keys.length; ) {
    let j = i
    while (j + 1 < keys.length && idx[j + 1] === idx[j] + 1) j++
    if (j - i >= 2) {
      tokens.push(`${short[keys[i]]} ${lang === 'en' ? 'to' : 'a'} ${short[keys[j]]}`)
    } else {
      for (let k = i; k <= j; k++) tokens.push(short[keys[k]])
    }
    i = j + 1
  }
  if (tokens.length === 1) return tokens[0]
  const and = lang === 'en' ? '&' : 'y'
  return `${tokens.slice(0, -1).join(', ')} ${and} ${tokens[tokens.length - 1]}`
}

// Filas agrupadas por horario idéntico, en el orden en que aparecen en la semana.
export function scheduleRows(schedule, lang = 'es') {
  const groups = []
  for (const day of DAY_KEYS) {
    const ranges = rangesOf(schedule, day)
    const sig = JSON.stringify(ranges)
    const group = groups.find((g) => g.sig === sig)
    if (group) group.days.push(day)
    else groups.push({ sig, ranges, days: [day] })
  }
  return groups.map((g) => ({
    days: joinDays(g.days, lang),
    text: rangesText(g.ranges, lang),
    closed: g.ranges.length === 0,
  }))
}

export function describeSchedule(schedule, lang = 'es') {
  return scheduleRows(schedule, lang)
    .map((r) => `${r.days}: ${r.text}`)
    .join(' · ')
}
