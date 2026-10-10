'use client'

import { useSyncExternalStore } from 'react'
import { getOpenStatus, statusLabel } from '@/lib/hours'
import { useApp } from '@/contexts/AppContext'

// Se vuelve a evaluar cada 30 s. En el servidor el "minuto" es 0 y no se dibuja nada,
// así que el primer render coincide con el del navegador (sin diferencias de hidratación).
function subscribe(callback) {
  const id = setInterval(callback, 30_000)
  return () => clearInterval(id)
}
const getSnapshot = () => Math.floor(Date.now() / 60_000)
const getServerSnapshot = () => 0

const TONES = {
  light: {
    open: 'border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-carddark dark:text-emerald-300',
    closed: 'border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-carddark dark:text-amber-300',
  },
  onDark: {
    open: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    closed: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  },
}

// "● Abierto ahora · cierra a las 14:00" / "● Cerrado · abre hoy a las 16:00"
export default function OpenStatus({ schedule, tone = 'light' }) {
  const { lang } = useApp()
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  if (!minute) return null

  const status = getOpenStatus(schedule, new Date(minute * 60_000))
  const label = statusLabel(status, lang)
  if (!label) return null

  const open = status.state === 'open'
  const colors = TONES[tone][open ? 'open' : 'closed']

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${colors}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${open ? 'bg-emerald-500' : 'bg-amber-500'}`}
      />
      {label}
    </span>
  )
}
