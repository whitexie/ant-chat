import type { electronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electronAPI: typeof electronAPI
    __ELECTRON__: boolean
  }
}

export {}
