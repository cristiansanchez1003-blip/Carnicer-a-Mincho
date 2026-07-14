'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión')
      router.replace('/admin/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="hero-texture flex min-h-screen items-center justify-center bg-paper px-5">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <img
          src="/logo.jpg"
          alt="El Café de Pirque"
          className="mx-auto mb-6 w-56 mix-blend-multiply"
        />

        <div className="rounded-3xl border border-linen bg-card p-6 shadow-cardHover">
          <h1 className="text-center font-playfair text-xl font-bold text-ink">
            Panel de administración
          </h1>
          <p className="mt-1 text-center text-[13px] text-muted">
            Acceso exclusivo para la administración
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-ink/70">Usuario</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                required
                className="w-full rounded-xl border border-linen bg-paper px-4 py-3 text-[15px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint"
                placeholder="marcela"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-ink/70">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-linen bg-paper px-4 py-3 text-[15px] text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-mint"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-600"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-xl bg-ink py-3.5 text-[15px] font-bold text-mint shadow-nav transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-muted">
          El Café de Pirque · Menú digital
        </p>
      </motion.div>
    </main>
  )
}
