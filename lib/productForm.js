// Lógica del formulario de producto del panel, separada de la pantalla para poder probarla.

// Estado inicial del formulario. Parte del producto completo para CONSERVAR los campos que
// la pantalla no muestra: antes el formulario reconstruía el producto solo con los campos en
// español y, al guardar, se perdía la traducción al inglés de ese producto.
export function buildProductForm(product, categories) {
  return {
    ...product,
    id: product.id || `n${Date.now()}`,
    categoryId: product.categoryId || categories[0]?.id || '',
    name: product.name || '',
    description: product.description || '',
    price: product.price ?? '',
    unit: product.unit || 'kg',
    image: product.image || '',
    available: product.available !== false,
    sort: product.sort || 0,
    name_en: product.name_en || '',
    description_en: product.description_en || '',
  }
}

// Producto listo para guardar: precio entero, textos recortados y sin campos en inglés vacíos.
export function normalizeProductForm(form) {
  const out = {
    ...form,
    name: String(form.name ?? '').trim(),
    description: String(form.description ?? '').trim(),
    price: Math.round(Number(form.price) || 0),
  }
  for (const field of ['name_en', 'description_en']) {
    const value = String(out[field] ?? '').trim()
    if (value) out[field] = value
    else delete out[field]
  }
  return out
}
