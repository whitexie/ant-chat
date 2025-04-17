import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'

try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
}
catch (error) {
  console.error(error)
}
