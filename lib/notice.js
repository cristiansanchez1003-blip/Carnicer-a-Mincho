import { todayISO } from './format.js'

// Aviso editable en la portada (feriados, "hoy cerrado", llegada de producto).
// En data/menu.json -> settings: notice (es), notice_en (en, opcional) y noticeUntil
// ("AAAA-MM-DD", opcional: el último día en que se muestra, para que no quede un aviso viejo).
// Parte vacío: el texto lo define el dueño, nunca el sistema.

export const NOTICE_MAX = 280

// Fecha real del calendario ("2026-02-30" no existe).
export function isValidISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!match) return false
  const [y, m, d] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

// Devuelve un mensaje de error en español, o null si los campos del aviso son válidos.
export function validateNotice(settings) {
  const { notice, notice_en: noticeEn, noticeUntil } = settings ?? {}
  for (const [value, label] of [[notice, 'El aviso'], [noticeEn, 'El aviso en inglés']]) {
    if (value === undefined || value === null || value === '') continue
    if (typeof value !== 'string') return `${label} debe ser un texto`
    if (value.length > NOTICE_MAX) return `${label} es demasiado largo (máximo ${NOTICE_MAX} caracteres)`
  }
  if (noticeUntil !== undefined && noticeUntil !== null && noticeUntil !== '' && !isValidISODate(noticeUntil)) {
    return 'La fecha del aviso no es válida (usa AAAA-MM-DD)'
  }
  return null
}

// Texto del aviso que se debe mostrar hoy, o '' si no hay ninguno vigente.
// En inglés se usa notice_en y, si falta, el texto en español (mejor eso que ocultar un aviso).
export function activeNotice(settings, lang = 'es', today = todayISO()) {
  const es = typeof settings?.notice === 'string' ? settings.notice.trim() : ''
  if (!es) return ''
  const until = settings.noticeUntil
  if (until && isValidISODate(until) && today > until) return ''
  if (lang === 'en') {
    const en = typeof settings.notice_en === 'string' ? settings.notice_en.trim() : ''
    if (en) return en
  }
  return es
}
