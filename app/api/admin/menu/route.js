import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readMenu, writeMenu, validateMenu } from '@/lib/menuStore'

export const dynamic = 'force-dynamic'

// Lee el menú para EDITARLO. A diferencia de /api/menu (público y cacheado en el CDN):
// - exige sesión,
// - nunca se cachea (si no, tras guardar se podría cargar una copia vieja y pisar el cambio),
// - si GitHub falla devuelve error en vez de una copia antigua (guardarla borraría cambios recientes).
export async function GET(request) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const { menu, source } = await readMenu({ strict: true, withSource: true })
    return NextResponse.json(menu, {
      headers: { 'Cache-Control': 'no-store', 'X-Menu-Source': source },
    })
  } catch (err) {
    console.error('Error leyendo el menú para el panel:', err)
    return NextResponse.json(
      {
        error:
          'No se pudo leer el menú desde GitHub, así que no es seguro editarlo ahora. Prueba de nuevo en un minuto o revisa las conexiones en Ajustes.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

// Guarda el menú completo. Solo con sesión de administrador válida.
export async function PUT(request) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let menu
  try {
    menu = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const problem = validateMenu(menu)
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 })
  }

  try {
    const result = await writeMenu(menu)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('Error guardando el menú:', err)
    return NextResponse.json(
      { error: 'No se pudo guardar. Revisa el estado de las conexiones en Ajustes.' },
      { status: 500 }
    )
  }
}
