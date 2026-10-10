'use client'

import { useEffect, useState } from 'react'

// Aviso en la parte de arriba del panel cuando el acceso a GitHub (el que permite guardar
// cambios) está por vencer o ya falló. Si todo está bien no muestra nada. Se consulta una vez
// al abrir el panel; cualquier error de red se ignora en silencio (no debe molestar).
export default function TokenAlert() {
  const [alert, setAlert] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/admin/health?only=token', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.alert) setAlert(data.alert)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (!alert || dismissed) return null
  const isError = alert.level === 'error'

  return (
    <div
      role="alert"
      className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-snug ${
        isError
          ? 'border-red-300 bg-red-50 text-red-800'
          : 'border-amber-300 bg-amber-50 text-amber-900'
      }`}
    >
      <span aria-hidden="true" className="mt-px text-[16px] leading-none">
        {isError ? '⛔' : '⚠️'}
      </span>
      <p className="min-w-0 flex-1 font-semibold">{alert.message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Ocultar aviso"
        className="shrink-0 rounded-full px-2 text-[16px] leading-none opacity-60 active:scale-90"
      >
        ✕
      </button>
    </div>
  )
}
