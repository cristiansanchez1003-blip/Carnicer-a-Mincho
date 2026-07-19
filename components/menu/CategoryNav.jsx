'use client'

import { useEffect, useRef } from 'react'
import { localizedField } from '@/lib/i18n'
import { useApp } from '@/contexts/AppContext'
import ControlsBar from './ControlsBar'

// Barra de pestañas de categoría, sticky, con scroll horizontal.
// Cada categoría es una "pestaña": tocarla reemplaza el contenido visible,
// no hace scroll a una sección (ver app/menu/page.jsx).
export default function CategoryNav({ categories, activeId, onSelect }) {
  const barRef = useRef(null)
  const pillRefs = useRef({})
  const { lang } = useApp()

  useEffect(() => {
    const pill = pillRefs.current[activeId]
    if (pill && barRef.current) {
      const bar = barRef.current
      const target = pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2
      bar.scrollTo({ left: target, behavior: 'smooth' })
    }
  }, [activeId])

  return (
    <nav className="sticky top-0 z-30 border-b border-linen/70 bg-paper/90 backdrop-blur-md dark:border-linendark/70 dark:bg-paperdark/90">
      <div className="flex items-center gap-2 px-3 py-3">
        <div
          ref={barRef}
          className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Categorías del menú"
        >
          {categories.map((cat) => {
            const active = cat.id === activeId
            return (
              <button
                key={cat.id}
                ref={(el) => (pillRefs.current[cat.id] = el)}
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-bold transition-all duration-200 active:scale-95 ${
                  active
                    ? 'bg-ink text-mint shadow-nav dark:bg-mint dark:text-ink'
                    : 'border border-linen bg-card text-ink/70 dark:border-linendark dark:bg-carddark dark:text-paper/70'
                }`}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                {localizedField(cat, 'name', lang)}
              </button>
            )
          })}
        </div>

        <ControlsBar />
      </div>
    </nav>
  )
}
