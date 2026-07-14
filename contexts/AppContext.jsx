'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { translate } from '@/lib/i18n'

const AppContext = createContext(null)

const LANG_KEY = 'cafe-pirque-lang'
const THEME_KEY = 'cafe-pirque-theme'

// Provee idioma (es/en) y tema (light/dark) a todo el árbol del menú público,
// con persistencia en localStorage y detección de preferencia del sistema
// solo para el tema en la primera visita.
export function AppProvider({ children }) {
  const [lang, setLangState] = useState('es')
  const [theme, setThemeState] = useState('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedLang = window.localStorage.getItem(LANG_KEY)
    const storedTheme = window.localStorage.getItem(THEME_KEY)
    if (storedLang === 'es' || storedLang === 'en') setLangState(storedLang)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme)
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark')
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
