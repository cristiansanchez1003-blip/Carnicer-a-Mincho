'use client'

import { useState, useEffect } from 'react'
import { describeSchedule, validateSchedule } from '@/lib/hours'
import ScheduleEditor from './ScheduleEditor'
import NoticeEditor from './NoticeEditor'

// Editor de los datos del local: horario, dirección y canales de contacto.
export default function SettingsForm({ settings, onSave }) {
  const [form, setForm] = useState(settings || {})

  useEffect(() => {
    setForm(settings || {})
  }, [settings])

  function set(field, value) {
    const next = { ...form, [field]: value }
    setForm(next)
    onSave(next)
  }

  // Cambia varios campos a la vez (el aviso de portada tiene tres).
  function patch(changes) {
    const next = { ...form, ...changes }
    setForm(next)
    onSave(next)
  }

  // El horario por día es la fuente de verdad: de él salen los textos de horario (es / en).
  function setSchedule(schedule) {
    const next = { ...form, schedule }
    if (!validateSchedule(schedule)) {
      next.hours = describeSchedule(schedule, 'es')
      next.hours_en = describeSchedule(schedule, 'en')
    }
    setForm(next)
    onSave(next)
  }

  const inputCls =
    'w-full rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint'

  const fields = [
    { key: 'slogan', label: 'Eslogan', type: 'text' },
    { key: 'slogan_en', label: 'Eslogan en inglés', type: 'text' },
    { key: 'address', label: 'Dirección', type: 'text' },
    { key: 'mapsUrl', label: 'Link de Google Maps (botón "Cómo llegar")', type: 'url' },
    {
      key: 'mapsEmbed',
      label: 'Mapa embebido (URL de Google Maps terminada en &output=embed)',
      type: 'url',
    },
    { key: 'whatsapp', label: 'WhatsApp (solo números, ej: 56912345678)', type: 'text' },
    {
      key: 'phone',
      label: 'Teléfono para llamadas (solo números, ej: 56912345678 — si queda vacío no se muestra el botón "Llamar")',
      type: 'text',
    },
    {
      key: 'instagram',
      label: 'Link de Instagram (opcional — si queda vacío no se muestra)',
      type: 'url',
    },
    { key: 'instagramHandle', label: 'Usuario de Instagram (ej: @carniceriamincho)', type: 'text' },
    {
      key: 'email',
      label: 'Correo de contacto (opcional — si queda vacío no se muestra)',
      type: 'email',
    },
    {
      key: 'reviewUrl',
      label: 'Link para dejar reseñas en Google (opcional — si queda vacío no se muestra el botón)',
      type: 'url',
    },
  ]

  return (
    <section className="rounded-2xl border border-linen bg-card p-5 shadow-card">
      <h2 className="font-playfair text-lg font-bold text-ink">Datos del local</h2>
      <p className="mt-1 text-[13px] text-muted">
        Estos datos aparecen en la portada y el pie del menú. Recuerda presionar
        “Guardar cambios” arriba cuando termines.
      </p>

      <div className="mt-4 flex flex-col gap-3.5">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[12.5px] font-bold text-ink/70">{f.label}</span>
            <input
              type={f.type}
              value={form[f.key] || ''}
              onChange={(e) => set(f.key, e.target.value)}
              className={inputCls}
            />
          </label>
        ))}
      </div>

      <NoticeEditor settings={form} onChange={patch} />

      <ScheduleEditor schedule={form.schedule} onChange={setSchedule} />
    </section>
  )
}
