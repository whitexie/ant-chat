/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_HOST: string
  readonly VITE_API_KEY: string
  readonly VITE_DEFAULT_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'markdown-it';
