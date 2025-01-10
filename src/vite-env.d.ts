/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_OPENAI_ACCESS_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_DEFAULT_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'markdown-it';

// global.d.ts
interface Window {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
}

interface FileSystemDirectoryHandle {
  values: () => AsyncIterable<FileSystemHandle>
}
