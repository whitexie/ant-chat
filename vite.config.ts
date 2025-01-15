import type { PluginOption } from 'vite'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import compression from 'vite-plugin-compression'

const plugins: PluginOption[] = [
  react(),
  UnoCSS(),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(analyzer())
  plugins.push(
    compression({
      verbose: true, // 输出压缩日志
      disable: false, // 是否禁用压缩
      threshold: 10240, // 对超过10KB的文件进行压缩
      algorithm: 'gzip', // 使用gzip压缩
      ext: '.gz', // 压缩后文件的扩展名
    }),
  )
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
