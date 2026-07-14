import { NextResponse } from 'next/server'
import { checkCredentials, createToken, sessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const username = String(body.username || '').trim()
  const password = String(body.password || '')

  if (!username || !password) {
    return NextResponse.json({ error: 'Ingresa usuario y contraseña' }, { status: 400 })
  }

  if (!checkCredentials(username, password)) {
    // Pausa breve para dificultar ataques de fuerza bruta
    await new Promise((r) => setTimeout(r, 800))
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, user: username })
  res.cookies.set(sessionCookie(createToken(username)))
  return res
}
