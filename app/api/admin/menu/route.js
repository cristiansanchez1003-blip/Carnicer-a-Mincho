import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeMenu, validateMenu } from '@/lib/menuStore'

export const dynamic = 'force-dynamic'

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
      { error: 'No se pudo guardar. Revisa la configuración de GitHub en Vercel.' },
      { status: 500 }
    )
  }
}
