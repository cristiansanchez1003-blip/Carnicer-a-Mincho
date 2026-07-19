'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Guard de autenticación: protege todo /admin/* excepto /admin/login.
// La sesión vive en una cookie httpOnly firmada; se verifica en /api/auth/me.
export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  const isLoginRoute = pathname === '/admin/login'

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!mounted) return
        const authenticated = res.ok
        if (!authenticated && !isLoginRoute) {
          router.replace('/admin/login')
        } else if (authenticated && isLoginRoute) {
          router.replace('/admin/dashboard')
        } else {
          setChecking(false)
        }
      } catch {
        if (mounted && !isLoginRoute) router.replace('/admin/login')
        else setChecking(false)
      }
    }

    checkSession()
    return () => {
      mounted = false
    }
  }, [isLoginRoute, router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-linen border-t-forest" />
          <p className="font-lato text-sm text-muted">Cargando…</p>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen bg-paper">{children}</div>
}
