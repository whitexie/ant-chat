import type { PluginOption } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import compression from 'vite-plugin-compression'
import magicPreloader from 'vite-plugin-magic-preloader'
import svgr from 'vite-plugin-svgr'
import pkg from './package.json'

const plugins: PluginOption[] = [
  react(),

  /**
   * @see https://github.com/cszhjh/vite-plugin-magic-preloader?tab=readme-ov-file
   */
  magicPreloader(),
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

  if (mode === 'development') {
    plugins.push(
      codeInspectorPlugin({
        bundler: 'vite',
      }),
    )
  }

  if (mode === 'preview') {
    plugins.push(analyzer({
      analyzerMode: 'static',
      openAnalyzer: true,
      fileName: `../report-${new Date().getTime()}`,
      reportTitle: `${pkg.name} - ${pkg.version}`,
    }))
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            cryptojs: ['crypto-js'],
          },
        },
      },
    },
  }
})
