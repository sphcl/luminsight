import { defineConfig } from 'vitest/config'

// Roda só os testes das rules, em Node e contra o emulador (ver script test:rules).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
