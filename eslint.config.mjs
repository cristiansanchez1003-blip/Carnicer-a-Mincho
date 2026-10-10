import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Cargar datos al montar la página y leer el tema guardado en localStorage son usos
      // normales de efectos que actualizan estado. Se mantiene como aviso visible (no error)
      // hasta migrarlos a una librería de datos; ver docs/roadmap.md.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'tests/**', 'docs/**', '.claude/**']),
])
