// Productos destacados: el dueño marca los que quiere mostrar primero (recién llegado, del día,
// recomendado). En data/menu.json cada producto puede traer highlight: 'new' | 'today' | 'star'.
// Los destacados disponibles aparecen en la pestaña "⭐ Destacados" y con una etiqueta en su
// tarjeta. Nada se destaca por defecto.

export const HIGHLIGHTS = ['new', 'today', 'star']

export const HIGHLIGHT_LABELS = {
  es: { new: 'Recién llegado', today: 'Del día', star: 'Recomendado' },
  en: { new: 'Just arrived', today: "Today's pick", star: 'Recommended' },
}

// Categoría "virtual" que agrupa los destacados (no existe en data/menu.json).
export const FEATURED_ID = '__featured__'
export const FEATURED_CATEGORY = { id: FEATURED_ID, name: 'Destacados', name_en: 'Featured', emoji: '⭐' }

export const isHighlight = (value) => HIGHLIGHTS.includes(value)

export function highlightLabel(value, lang = 'es') {
  return (HIGHLIGHT_LABELS[lang] || HIGHLIGHT_LABELS.es)[value] ?? ''
}

// Destacados disponibles, ordenados como el menú: por categoría y luego por posición.
export function featuredProducts(products, categories) {
  const order = new Map(categories.map((c, i) => [c.id, c.sort ?? i]))
  return products
    .filter((p) => isHighlight(p.highlight) && p.available !== false)
    .sort(
      (a, b) =>
        (order.get(a.categoryId) ?? 999) - (order.get(b.categoryId) ?? 999) ||
        (a.sort || 0) - (b.sort || 0)
    )
}
