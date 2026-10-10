// Buscador del menú público: encuentra productos por nombre o descripción, en español e inglés,
// sin importar mayúsculas ni tildes ("lomo vetado", "LOMO", "pollo ganso", "parrilla").

export const MIN_QUERY_LENGTH = 2

// "Cazuela Coluda" -> "cazuela coluda"; "Ñuñoa" -> "nunoa"; espacios múltiples colapsados.
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export const tokensOf = (query) => normalizeText(query).split(' ').filter(Boolean)

// ¿La búsqueda ya tiene suficiente texto para mostrar resultados?
export const isSearching = (query) => normalizeText(query).length >= MIN_QUERY_LENGTH

// Productos que contienen TODAS las palabras buscadas (en nombre o descripción, es o en).
// Primero salen los que coinciden en el nombre (y al inicio de una palabra); a igual puntaje se
// respeta el orden original del menú.
export function searchProducts(products, query) {
  if (!isSearching(query)) return []
  const tokens = tokensOf(query)

  const scored = []
  products.forEach((product, index) => {
    const names = normalizeText(`${product.name ?? ''} ${product.name_en ?? ''}`)
    const descriptions = normalizeText(`${product.description ?? ''} ${product.description_en ?? ''}`)
    let score = 0
    for (const token of tokens) {
      if (names.includes(token)) {
        score += 3
        if (names.startsWith(token) || names.includes(` ${token}`)) score += 1
      } else if (descriptions.includes(token)) {
        score += 1
      } else {
        return // falta una palabra: no coincide
      }
    }
    scored.push({ product, score, index })
  })

  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.product)
}
