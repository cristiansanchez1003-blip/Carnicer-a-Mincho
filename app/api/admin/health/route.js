import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readCloudinaryConfig } from '@/lib/cloudinary'
import { githubConfig } from '@/lib/menuStore'
import { checkCloudinary, checkGithub, checkSite } from '@/lib/health'

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
  const { config, missing } = readCloudinaryConfig()

  const [cloudinary, githubStatus] = await Promise.all([
    checkCloudinary(config, { missing }),
    checkGithub(github),
  ])

  const site = checkSite({
    vercelEnv: process.env.VERCEL_ENV,
    deployBranch: process.env.VERCEL_GIT_COMMIT_REF,
    dataBranch: github?.branch,
  })

  return NextResponse.json(
    { cloudinary, github: githubStatus, site },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
