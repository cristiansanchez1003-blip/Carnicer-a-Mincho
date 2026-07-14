'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { translate } from '@/lib/i18n'

const AppContext = createContext(null)

const LANG_KEY = 'mincho-lang'
const THEME_KEY = 'mincho-theme'

// Provee idioma (fijo en español) y tema (dark/light) a todo el árbol del
// menú público. El tema por defecto es DARK (letrero Mincho sobre negro);
// la elección del cliente se persiste en localStorage.
export function AppProvider({ children }) {
  const [lang, setLangState] = useState('es')
  const [theme, setThemeState] = useState('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme)
    }
    setReady(true)
  }, [])

  const setLang = useCallback((value) => {
    setLangState(value)
    window.localStorage.setItem(LANG_KEY, value)
  }, [])

  const setTheme = useCallback((value) => {
    setThemeState(value)
    window.localStorage.setItem(THEME_KEY, value)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'es' ? 'en' : 'es')
  }, [lang, setLang])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  const t = useCallback((key) => translate(lang, key), [lang])

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, theme, setTheme, toggleTheme, t, ready }),
    [lang, setLang, toggleLang, theme, setTheme, toggleTheme, t, ready]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
