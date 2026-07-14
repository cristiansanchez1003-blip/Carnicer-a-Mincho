// Formatea un precio entero en CLP al estilo chileno: 2500 -> "$2.500"
export function formatCLP(value) {
  const number = Number(value) || 0
  return '$' + number.toLocaleString('es-CL')
}
