import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/interface.ts',
        'src/types/**',
      ],
    },
    globals: true,
    alias: {
      '@ant-design/x/es/sender/useSpeech': '@ant-design/x/es/sender/useSpeech',
      '@ant-design/x': '@ant-design/x/es',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },

    environment: 'jsdom',

    setupFiles: [
      'fake-indexeddb/auto',
    ],
  },
})
