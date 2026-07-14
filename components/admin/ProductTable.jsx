'use client'

import { formatCLP } from '@/lib/format'

// Lista de productos de una categoría con acciones rápidas:
// editar, disponibilidad, reordenar y eliminar.
export default function ProductTable({
  products,
  onEdit,
  onToggle,
  onMove,
  onDelete,
}) {
  return (
    <div className="flex flex-col gap-2">
      {products.map((p, idx) => (
        <div
          key={p.id}
          className={`flex items-center gap-2.5 rounded-xl border border-linen bg-card p-2.5 ${
            p.available === false ? 'opacity-55' : ''
          }`}
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-mintsoft">
            {p.image ? (
              <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
            )}
          </div>

          <button onClick={() => onEdit(p)} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13.5px] font-bold text-ink">{p.name}</span>
            <span className="block text-[12.5px] font-semibold text-forest">
              {formatCLP(p.price)}
              {p.available === false && (
                <span className="ml-2 text-[11px] font-bold uppercase text-ink/40">
                  No disponible
                </span>
              )}
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <div className="flex flex-col">
              <button
                onClick={() => onMove(p.id, -1)}
                disabled={idx === 0}
                aria-label="Subir"
                className="flex h-5 w-7 items-center justify-center rounded text-ink/40 disabled:opacity-25"
              >
                ▲
              </button>
              <button
                onClick={() => onMove(p.id, 1)}
                disabled={idx === products.length - 1}
                aria-label="Bajar"
                className="flex h-5 w-7 items-center justify-center rounded text-ink/40 disabled:opacity-25"
              >
                ▼
              </button>
            </div>

            <button
              onClick={() => onToggle(p.id)}
              role="switch"
              aria-checked={p.available !== false}
              aria-label="Disponibilidad"
              className={`relative h-6 w-10 rounded-full transition-colors ${
                p.available !== false ? 'bg-forest' : 'bg-ink/20'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  p.available !== false ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>

            <button
              onClick={() => onDelete(p)}
              aria-label={`Eliminar ${p.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 active:bg-red-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
