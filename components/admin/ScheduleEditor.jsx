'use client'

import { DAY_KEYS, DAY_NAMES, emptySchedule, validateSchedule } from '@/lib/hours'

const FIRST_RANGE = ['09:00', '14:00']
const NEXT_RANGE = ['16:00', '19:00']
const MAX_RANGES = 3

// Editor del horario semanal: un día por fila, con interruptor "Abierto" y hasta 3 tramos.
// De este horario salen el indicador "Abierto ahora" y los textos de horario del menú.
export default function ScheduleEditor({ schedule, onChange }) {
  const current = { ...emptySchedule(), ...(schedule || {}) }
  const problem = validateSchedule(current)

  const update = (day, ranges) => {
    const sorted = [...ranges].sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    onChange({ ...current, [day]: sorted })
  }

  const timeCls =
    'rounded-lg border border-linen bg-paper px-2.5 py-1.5 text-[14px] text-ink outline-none focus:border-forest focus:ring-2 focus:ring-mint'

  return (
    <div className="mt-5">
      <h3 className="font-playfair text-[16px] font-bold text-ink">Horario de atención</h3>
      <p className="mt-1 text-[12.5px] text-muted">
        Activa los días en que abren y pon la hora de apertura y de cierre. Si cierran a mediodía,
        agrega un segundo tramo. Con esto el menú muestra “Abierto ahora” automáticamente.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {DAY_KEYS.map((day, index) => {
          const ranges = current[day]
          const open = ranges.length > 0
          const previous = DAY_KEYS[index - 1]
          return (
            <div key={day} className="rounded-xl border border-linen bg-paper p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-ink">{DAY_NAMES.es[day]}</span>
                <div className="flex items-center gap-3">
                  {previous && (
                    <button
                      type="button"
                      onClick={() => update(day, current[previous].map((r) => [...r]))}
                      className="text-[12px] font-bold text-forest underline underline-offset-2"
                    >
                      Copiar del {DAY_NAMES.es[previous].toLowerCase()}
                    </button>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={open}
                    aria-label={`${DAY_NAMES.es[day]}: ${open ? 'abierto' : 'cerrado'}`}
                    onClick={() => update(day, open ? [] : [[...FIRST_RANGE]])}
                    className={`relative h-6 w-10 rounded-full transition-colors ${open ? 'bg-forest' : 'bg-ink/30'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        open ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {open ? (
                <div className="mt-2 flex flex-col gap-2">
                  {ranges.map((range, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={range[0]}
                        aria-label={`${DAY_NAMES.es[day]}, tramo ${i + 1}: apertura`}
                        onChange={(e) =>
                          update(day, ranges.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))
                        }
                        className={timeCls}
                      />
                      <span className="text-[13px] text-ink/70">a</span>
                      <input
                        type="time"
                        value={range[1]}
                        aria-label={`${DAY_NAMES.es[day]}, tramo ${i + 1}: cierre`}
                        onChange={(e) =>
                          update(day, ranges.map((r, j) => (j === i ? [r[0], e.target.value] : r)))
                        }
                        className={timeCls}
                      />
                      <button
                        type="button"
                        aria-label={`Quitar el tramo ${i + 1} del ${DAY_NAMES.es[day].toLowerCase()}`}
                        onClick={() => update(day, ranges.filter((_, j) => j !== i))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/70 active:bg-ink/5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {ranges.length < MAX_RANGES && (
                    <button
                      type="button"
                      onClick={() => update(day, [...ranges, [...NEXT_RANGE]])}
                      className="self-start text-[12.5px] font-bold text-forest underline underline-offset-2"
                    >
                      + Agregar otro tramo (por ejemplo, la tarde)
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-[12.5px] text-ink/70">Cerrado todo el día</p>
              )}
            </div>
          )
        })}
      </div>

      {problem && (
        <p role="alert" className="mt-3 text-[13px] font-semibold text-red-600">
          {problem}
        </p>
      )}
    </div>
  )
}
