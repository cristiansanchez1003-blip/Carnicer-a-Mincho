'use client'

import { NOTICE_MAX } from '@/lib/notice'
import { todayISO } from '@/lib/format'

// Aviso destacado en la portada del menú (feriados, "hoy cerrado", llegada de producto).
// Parte vacío: solo aparece lo que Nicolás escribe. La fecha es opcional y sirve para que el
// aviso se esconda solo y no quede un mensaje viejo.
export default function NoticeEditor({ settings, onChange }) {
  const notice = settings.notice || ''
  const noticeEn = settings.notice_en || ''
  const until = settings.noticeUntil || ''
  const hasAny = notice || noticeEn || until

  const inputCls =
    'w-full rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'

  return (
    <div className="mt-6 border-t border-linen pt-5">
      <h3 className="font-playfair text-[16px] font-bold text-ink">Aviso en la portada</h3>
      <p className="mt-1 text-[12.5px] text-muted">
        Aparece destacado arriba del menú. Úsalo para feriados, “hoy cerrado” o cuando llegue un
        producto. Si lo dejas vacío, no se muestra nada.
      </p>

      <div className="mt-3 flex flex-col gap-3.5">
        <label className="block">
          <span className="mb-1 flex justify-between text-[12.5px] font-bold text-ink/70">
            <span>Aviso</span>
            <span className="font-normal text-muted">
              {notice.length}/{NOTICE_MAX}
            </span>
          </span>
          <textarea
            rows={3}
            maxLength={NOTICE_MAX}
            value={notice}
            onChange={(e) => onChange({ notice: e.target.value })}
            placeholder="Ej: Este lunes feriado estaremos cerrados."
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
            Aviso en inglés (opcional — si queda vacío, los turistas ven el de español)
          </span>
          <textarea
            rows={2}
            maxLength={NOTICE_MAX}
            value={noticeEn}
            onChange={(e) => onChange({ notice_en: e.target.value })}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-ink/70">
            Mostrar hasta el día (opcional — después de esa fecha el aviso se esconde solo)
          </span>
          <input
            type="date"
            min={todayISO()}
            value={until}
            onChange={(e) => onChange({ noticeUntil: e.target.value })}
            className={inputCls}
          />
        </label>

        {hasAny && (
          <button
            type="button"
            onClick={() => onChange({ notice: '', notice_en: '', noticeUntil: '' })}
            className="self-start rounded-full border border-linen px-4 py-2 text-[12.5px] font-bold text-ink/70 active:scale-95"
          >
            Borrar aviso
          </button>
        )}
      </div>
    </div>
  )
}
