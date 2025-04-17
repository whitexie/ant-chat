import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  return {
    plugins: [
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'src/main/index.ts',
          vite: {
            build: {
              minify: isBuild,
              outDir: 'dist-electron/main',
              target: 'esnext',
            },
            esbuild: {
              target: 'esnext',
            },
          },
        },
        preload: {
          input: 'src/preload/index.ts',
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              minify: isBuild,
              rollupOptions: {
                external: ['electron'],
              },
            },
            resolve: {
              alias: {
                'node:process': 'process/browser',
              },
            },
          },
        },
        renderer: false,
      }),
    ],
    esbuild: {
      target: 'es2022',
    },
    build: {
      target: 'es2022',
    },
  }
})
