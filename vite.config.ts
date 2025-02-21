import type { PluginOption } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import compression from 'vite-plugin-compression'
import svgr from 'vite-plugin-svgr'

const plugins: PluginOption[] = [
  react(),
  UnoCSS(),
  svgr({
    svgrOptions: { icon: false },
  }),
]

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    plugins.push(compression({
      verbose: true, // 输出压缩日志
      disable: false, // 是否禁用压缩
      threshold: 10240, // 对超过10KB的文件进行压缩
      algorithm: 'gzip', // 使用gzip压缩
      ext: '.gz', // 压缩后文件的扩展名
    }))
  }

  if (mode === 'preview') {
    plugins.push(analyzer())
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
