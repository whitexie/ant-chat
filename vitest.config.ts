import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
    },
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },

    environment: 'jsdom',

    setupFiles: [
      'fake-indexeddb/auto',
    ],
  },
})
