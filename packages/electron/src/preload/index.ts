import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'

console.log('process.contextIsolated => ', process.contextIsolated)

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  }
  catch (error) {
    console.error(error)
  }
}
