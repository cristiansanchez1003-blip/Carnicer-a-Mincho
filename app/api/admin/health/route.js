import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { githubConfig } from '@/lib/menuStore'
import { checkGithub, checkImages, checkSite, tokenAlert } from '@/lib/health'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

// Diagnóstico de las conexiones externas, solo para administradores. Prueba que las
// credenciales funcionan de verdad (sin subir ni modificar nada) y nunca devuelve
// valores secretos: únicamente mensajes de estado.
export async function GET(request) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const github = githubConfig()

  // ?only=token: versión liviana (una sola consulta a GitHub) que el panel usa al abrirse
  // para avisar si el acceso a GitHub está por vencer. Devuelve solo el aviso, o null.
  if (new URL(request.url).searchParams.get('only') === 'token') {
    const alert = github ? tokenAlert(await checkGithub(github)) : null
    return NextResponse.json({ alert }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const [images, githubStatus] = await Promise.all([checkImages(github), checkGithub(github)])

  const site = checkSite({
    vercelEnv: process.env.VERCEL_ENV,
    deployBranch: process.env.VERCEL_GIT_COMMIT_REF,
    dataBranch: github?.branch,
  })

  return NextResponse.json(
    { images, github: githubStatus, site },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
