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
      'antd/es/style/motion': 'antd/es/style/motion/index.js',
      'antd/es/theme/useToken': 'antd/es/theme/useToken.js',
      'antd/es/theme/util/alias': 'antd/es/theme/util/alias.js',
      'antd': 'antd/es',
      'antd/es': 'antd/es',
      '@ant-design/x': '@ant-design/x/es',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },

    environment: 'jsdom',

    setupFiles: [
      'fake-indexeddb/auto',
    ],
  },
})
