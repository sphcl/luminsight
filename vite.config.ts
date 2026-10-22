import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // As rules precisam do emulador, então rodam à parte em npm run test:rules.
    exclude: [...configDefaults.exclude, 'tests/rules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Sem include o Vitest 4 só mede arquivo que algum teste importa, e o que não tem teste some do relatório.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/types/**',
        'src/main.tsx',
        // Só ligação, sem lógica: um teste que só renderiza isso não tem como falhar de um jeito útil.
        'src/App.tsx',
        'src/lib/firebase/**',
        'src/components/layout/AppLayout/**',
        'src/components/layout/AuthLayout/**',
        'src/pages/Landing/**',
        'src/pages/Login/**',
        'src/pages/Register/**',
        'src/pages/NotFound/**',
        'src/pages/Forbidden/**',
      ],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60,
        // Segurança e engines puras têm mínimo maior porque um erro aqui libera acesso ou nota errada.
        'src/utils/security/**': { lines: 80, branches: 80, functions: 80, statements: 80 },
        'src/lib/router/**': { lines: 80, branches: 80, functions: 80, statements: 80 },
        'src/features/*/engine/**': { lines: 80, branches: 80, functions: 80, statements: 80 },
        'src/content/validate.ts': { lines: 80, branches: 80, functions: 80, statements: 80 },
      },
    },
  },
})
