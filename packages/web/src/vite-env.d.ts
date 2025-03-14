/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import type { AttributifyAttributes } from '@unocss/preset-attributify'

interface ImportMetaEnv {
  // readonly VITE_APP_TITLE: string
  // readonly VITE_API_HOST: string
  // readonly VITE_API_KEY: string
  // readonly VITE_DEFAULT_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends AttributifyAttributes {}
}
