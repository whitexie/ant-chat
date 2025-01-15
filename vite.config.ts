import type { PluginOption } from 'vite'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'

const plugins: PluginOption[] = [
  react(),
  UnoCSS(),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(analyzer())
}

// https://vite.dev/config/
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
