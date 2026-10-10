'use client'

import { useState } from 'react'

const ROWS = [
  { key: 'images', label: 'Subida de fotos' },
  { key: 'github', label: 'Guardado del menú (GitHub)' },
  { key: 'site', label: 'Sitio publicado (Vercel)' },
]

const ICONS = { ok: '✅', warn: '⚠️', error: '❌' }
const TONES = {
  ok: 'text-ink',
  warn: 'text-amber-700',
  error: 'text-red-600',
}

// Prueba, con las credenciales reales del servidor, que las fotos y el guardado funcionan.
// Sirve para saber en un clic por qué falla algo, sin revisar Vercel ni los registros.
export default function ConnectionStatus() {
  const [state, setState] = useState({ phase: 'idle' })

  async function run() {
    setState({ phase: 'loading' })
    try {
      const res = await fetch('/api/admin/health', { cache: 'no-store' })
      if (res.status === 401) {
        setState({ phase: 'error', message: 'Tu sesión expiró. Vuelve a ingresar al panel.' })
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`)
      setState({ phase: 'done', data })
    } catch (err) {
      setState({ phase: 'error', message: err.message || 'No se pudo hacer la prueba.' })
    }
  }

  return (
    <section className="rounded-2xl border border-linen bg-card p-5 shadow-card">
      <h2 className="font-playfair text-lg font-bold text-ink">Estado de las conexiones</h2>
      <p className="mt-1 text-[13px] text-muted">
        Comprueba si se pueden subir fotos y guardar cambios. No modifica nada.
      </p>

      <button
        type="button"
        onClick={run}
        disabled={state.phase === 'loading'}
        className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-[13.5px] font-bold text-mint shadow-nav transition active:scale-95 disabled:opacity-60"
      >
        {state.phase === 'loading' ? 'Probando…' : 'Probar conexiones'}
      </button>

      <div aria-live="polite">
        {state.phase === 'error' && (
          <p className="mt-4 text-[13px] font-semibold text-red-600">{state.message}</p>
        )}

        {state.phase === 'done' && (
          <ul className="mt-4 flex flex-col gap-3">
            {ROWS.map(({ key, label }) => {
              const item = state.data[key]
              if (!item) return null
              return (
                <li key={key} className="flex gap-2.5">
                  <span aria-hidden="true">{ICONS[item.level] || '•'}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-ink">{label}</p>
                    <p className={`text-[12.5px] leading-snug ${TONES[item.level] || 'text-ink'}`}>
                      {item.message}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
