// Diccionario de textos de interfaz. Los productos y categorías se traducen
// en data/menu.json con los campos name_en / description_en, etc.
// Los textos pueden llevar variables entre llaves: "cierra a las {time}".
export const translations = {
  es: {
    heroSlogan: 'Carnes seleccionadas y atención de barrio en San José de Maipo',
    hoursBadge: 'hours',
    contactSectionTitle: 'Nuestros canales de contacto',
    contactSectionSubtitle: 'Encargos y consultas',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    email: 'Correo',
    directions: 'Cómo llegar',
    hoursLabel: 'Horario de atención',
    available: 'Disponible hoy',
    unavailable: 'No disponible',
    loadError: 'No pudimos cargar el menú. Revisa tu conexión e intenta de nuevo.',
    products: 'productos',
    product: 'producto',
    langToggle: 'EN',
    themeToggleLight: 'Modo claro',
    themeToggleDark: 'Modo oscuro',
    emptyCategory: 'Todavía no hay productos en esta categoría.',

    // Accesibilidad y etiquetas generales
    close: 'Cerrar',
    categoriesAria: 'Categorías del menú',
    mapTitle: 'Mapa de Carnicería Mincho',
    whatsappFab: 'Escríbenos por WhatsApp',
    pricesUpdated: 'Precios actualizados el {date}',
    noticeLabel: 'Aviso',
    call: 'Llamar',
    review: 'Dejar una reseña',
    reviewSub: 'Cuéntanos tu experiencia en Google',
    searchPlaceholder: 'Buscar corte o producto…',
    searchAria: 'Buscar en el menú',
    clearSearch: 'Borrar búsqueda',
    searchResults: 'Resultados',
    noResults: 'No encontramos “{q}”. Prueba con otra palabra o escríbenos por WhatsApp.',

    // Horario y "abierto ahora"
    openNow: 'Abierto ahora',
    closesAt: 'cierra a las {time}',
    closedNow: 'Cerrado',
    opensToday: 'abre hoy a las {time}',
    opensTomorrow: 'abre mañana a las {time}',
    opensDay: 'abre el {day} a las {time}',
    closedAllDay: 'cerrado',

    // Pedido por WhatsApp
    addToOrder: 'Agregar al pedido',
    updateOrder: 'Actualizar pedido',
    inOrder: 'En tu pedido: {qty}',
    myOrder: 'Mi pedido',
    viewOrder: 'Ver pedido',
    orderCountOne: '1 producto',
    orderCountMany: '{n} productos',
    estimatedTotal: 'Total estimado',
    priceNote: 'El total es estimado: el valor final se confirma al pesar.',
    yourName: 'Tu nombre (opcional)',
    orderNote: 'Comentarios (opcional)',
    orderNotePlaceholder: 'Ej: corte grueso, para el sábado…',
    sendWhatsApp: 'Enviar pedido por WhatsApp',
    sendHint: 'Se abrirá WhatsApp con tu pedido listo para enviar.',
    clearOrder: 'Vaciar pedido',
    emptyOrder: 'Tu pedido está vacío. Agrega productos con el botón +.',
    remove: 'Quitar',
    increase: 'Aumentar cantidad',
    decrease: 'Disminuir cantidad',
    addProduct: 'Agregar {name} al pedido',
    unavailableInOrder: 'No disponible: se dejará fuera del mensaje',

    // Calculadora de asado
    asadoButton: 'Calculadora de asado',
    asadoTitle: 'Calculadora de asado',
    asadoIntro: '¿Para cuántas personas? Te sugerimos cuántos kilos pedir.',
    adults: 'Adultos',
    kids: 'Niños',
    appetite: 'Apetito',
    appetiteNormal: 'Normal',
    appetiteBig: 'Grande',
    asadoResult: 'Para {people} personas necesitas unos {kg} de carne',
    asadoMix: 'Sugerencia de cortes',
    addAllToOrder: 'Agregar todo al pedido',
    asadoDisclaimer:
      'Referencia: unos {adult} g por adulto y {kid} g por niño. Cada persona come distinto: ajusta a tu gusto.',
    asadoNoProducts: 'Por ahora no hay productos disponibles para armar la sugerencia.',
  },
  en: {
    heroSlogan: 'Selected meats and neighborhood service in San José de Maipo',
    hoursBadge: 'hours',
    contactSectionTitle: 'Get in touch',
    contactSectionSubtitle: 'Orders and questions',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    email: 'Email',
    directions: 'Directions',
    hoursLabel: 'Opening hours',
    available: 'Available today',
    unavailable: 'Unavailable',
    loadError: "We couldn't load the menu. Check your connection and try again.",
    products: 'items',
    product: 'item',
    langToggle: 'ES',
    themeToggleLight: 'Light mode',
    themeToggleDark: 'Dark mode',
    emptyCategory: 'No items in this category yet.',

    close: 'Close',
    categoriesAria: 'Menu categories',
    mapTitle: 'Map to Carnicería Mincho',
    whatsappFab: 'Message us on WhatsApp',
    pricesUpdated: 'Prices updated on {date}',
    noticeLabel: 'Notice',
    call: 'Call us',
    review: 'Leave a review',
    reviewSub: 'Tell us about your visit on Google',
    searchPlaceholder: 'Search a cut or product…',
    searchAria: 'Search the menu',
    clearSearch: 'Clear search',
    searchResults: 'Results',
    noResults: 'We couldn’t find “{q}”. Try another word or message us on WhatsApp.',

    openNow: 'Open now',
    closesAt: 'closes at {time}',
    closedNow: 'Closed',
    opensToday: 'opens today at {time}',
    opensTomorrow: 'opens tomorrow at {time}',
    opensDay: 'opens {day} at {time}',
    closedAllDay: 'closed',

    addToOrder: 'Add to order',
    updateOrder: 'Update order',
    inOrder: 'In your order: {qty}',
    myOrder: 'My order',
    viewOrder: 'View order',
    orderCountOne: '1 item',
    orderCountMany: '{n} items',
    estimatedTotal: 'Estimated total',
    priceNote: 'The total is an estimate: the final amount is confirmed when weighed.',
    yourName: 'Your name (optional)',
    orderNote: 'Notes (optional)',
    orderNotePlaceholder: 'E.g. thick cut, for Saturday…',
    sendWhatsApp: 'Send order via WhatsApp',
    sendHint: 'WhatsApp will open with your order ready to send.',
    clearOrder: 'Clear order',
    emptyOrder: 'Your order is empty. Add products with the + button.',
    remove: 'Remove',
    increase: 'Increase quantity',
    decrease: 'Decrease quantity',
    addProduct: 'Add {name} to order',
    unavailableInOrder: 'Unavailable: it will be left out of the message',

    asadoButton: 'Asado calculator',
    asadoTitle: 'Asado (BBQ) calculator',
    asadoIntro: 'How many people? We suggest how many kilos to order.',
    adults: 'Adults',
    kids: 'Kids',
    appetite: 'Appetite',
    appetiteNormal: 'Normal',
    appetiteBig: 'Big',
    asadoResult: 'For {people} people you need about {kg} of meat',
    asadoMix: 'Suggested cuts',
    addAllToOrder: 'Add all to order',
    asadoDisclaimer:
      'Guide: about {adult} g per adult and {kid} g per child. Appetites vary: adjust to taste.',
    asadoNoProducts: 'There are no available products to build a suggestion right now.',
  },
}

// Devuelve el texto en el idioma pedido (con respaldo en español) y reemplaza las
// variables {nombre} por los valores de `vars`.
export function translate(lang, key, vars) {
  const text = translations[lang]?.[key] ?? translations.es[key] ?? key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}

// Helpers para leer campos traducibles de productos/categorías del menú,
// con fallback al español si falta la traducción en inglés.
export function localizedField(entity, field, lang) {
  if (!entity) return ''
  if (lang === 'en') {
    return entity[`${field}_en`] || entity[field] || ''
  }
  return entity[field] || ''
}
