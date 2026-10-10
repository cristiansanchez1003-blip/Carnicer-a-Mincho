'use client'

// Guía corta para Nicolás y Gloria: las tareas de todos los días, paso a paso.
// Los nombres de botones coinciden con los del panel; si se renombra uno, cambiarlo aquí.
const TOPICS = [
  {
    title: '📸 Cambiar la foto de un producto',
    steps: [
      'En Productos, toca el producto.',
      'Toca “Subir foto” (o “Cambiar foto” si ya tiene una) y elige una foto de la galería o toma una nueva.',
      'Espera el mensaje “✓ Foto lista”. Aunque la foto pese mucho, el sistema la ajusta solo.',
      'Toca “Guardar producto” y luego “Guardar cambios” (arriba, o en la barra negra de abajo).',
    ],
    tip: 'Consejo: una foto con luz natural, desde arriba y sobre una tabla o fondo limpio se ve mejor.',
  },
  {
    title: '💲 Cambiar el precio de un producto',
    steps: [
      'En Productos, toca el producto y cambia el campo “Precio (CLP)”.',
      'Toca “Guardar producto” y luego “Guardar cambios”.',
    ],
    tip: 'La portada del menú muestra “Precios actualizados el…” con la fecha del último cambio.',
  },
  {
    title: '📈 Subir o bajar muchos precios de una vez',
    steps: [
      'En Productos, toca “💲 Ajustar precios en bloque”.',
      'Elige todo el menú o una categoría, y si el cambio es en porcentaje o en pesos.',
      'Escribe cuánto (usa un valor negativo para bajar) y revisa la vista previa: ahí ves cómo quedaría cada precio.',
      'Toca “Aplicar” y luego “Guardar cambios”. Nada se publica hasta que guardes.',
    ],
  },
  {
    title: '🚫 Marcar un producto como agotado hoy',
    steps: [
      'En Productos, usa el interruptor de la derecha del producto: apagado = “No disponible” en el menú.',
      'Toca “Guardar cambios”. Cuando llegue de nuevo, enciéndelo y guarda otra vez.',
    ],
  },
  {
    title: '⭐ Destacar un producto',
    steps: [
      'En Productos, toca el producto y elige una opción en “Destacar en el menú” (Recién llegado, Del día o Recomendado).',
      'Toca “Guardar producto” y luego “Guardar cambios”.',
      'Los destacados disponibles aparecen primero en el menú, en la pestaña “⭐ Destacados”. Para quitarlo, elige “No destacar”.',
    ],
  },
  {
    title: '📢 Poner un aviso en la portada (feriados, hoy cerrado)',
    steps: [
      'Ve a Ajustes → “Aviso en la portada” y escribe el mensaje.',
      'Si quieres, elige “Mostrar hasta el día”: después de esa fecha el aviso se esconde solo.',
      'Toca “Guardar cambios”. Para quitarlo, usa “Borrar aviso” y guarda.',
    ],
  },
  {
    title: '🕘 Cambiar el horario',
    steps: [
      'Ve a Ajustes → “Horario de atención”.',
      'Activa o apaga cada día y ajusta las horas. Si cierran a mediodía, agrega un segundo tramo.',
      'Toca “Guardar cambios”. El menú muestra “Abierto ahora” según este horario.',
    ],
  },
  {
    title: '📞 Mostrar el botón “Llamar” o “Dejar una reseña”',
    steps: [
      'Ve a Ajustes y completa “Teléfono para llamadas” y/o “Link para dejar reseñas en Google”.',
      'Toca “Guardar cambios”. Si dejas un campo vacío, ese botón no se muestra.',
    ],
  },
  {
    title: '🛟 Algo no funciona',
    steps: [
      'Ve a Ajustes → “Probar conexiones”. Si algo sale en rojo, el mensaje dice qué hacer.',
      'Los cambios se ven en el menú en unos segundos después de guardar. Si no, actualiza la página del menú.',
      'Si sales del panel con cambios sin guardar, el navegador te avisa antes de perderlos.',
    ],
  },
]

export default function HelpSection() {
  return (
    <section className="rounded-2xl border border-linen bg-card p-5 shadow-card">
      <h2 className="font-playfair text-lg font-bold text-ink">Ayuda rápida</h2>
      <p className="mt-1 text-[13px] text-muted">
        Toca un tema para ver los pasos. Recuerda: los cambios se publican al presionar
        “Guardar cambios”.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {TOPICS.map((topic) => (
          <details key={topic.title} className="group rounded-xl border border-linen bg-paper">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[14px] font-bold text-ink [&::-webkit-details-marker]:hidden">
              {topic.title}
              <span aria-hidden="true" className="text-ink/40 transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <div className="px-4 pb-4">
              <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-snug text-ink/85">
                {topic.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {topic.tip && <p className="mt-3 text-[12.5px] text-muted">{topic.tip}</p>}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
