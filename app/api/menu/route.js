import { NextResponse } from 'next/server'
import { readMenu } from '@/lib/menuStore'

export const dynamic = 'force-dynamic'

// Menú público: lo consume la vista /menu.
export async function GET() {
  try {
    const menu = await readMenu()
    return NextResponse.json(menu, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    })
  } catch (err) {
    console.error('Error leyendo el menú:', err)
    return NextResponse.json({ error: 'No se pudo cargar el menú' }, { status: 500 })
  }
}
