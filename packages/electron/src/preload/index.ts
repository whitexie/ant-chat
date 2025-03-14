import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  // 可以添加更多的 API
})
