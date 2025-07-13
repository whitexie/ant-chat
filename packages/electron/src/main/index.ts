import process from 'node:process'
import { app } from 'electron'
import { initializeDb } from './db'
import { registerIpcEvents } from './ipcHandlers'
import { registerMcpHandlers } from './ipcHandlers/mcpHandlers'
import { clientHub } from './mcpClientHub'
import { installDevTools } from './plugins/devtools'
import { isDev } from './utils/env'
import { logger } from './utils/logger'
import { MainWindow } from './window'

const __dirname = process.cwd()

logger.info('Electron 主进程启动', __dirname)

app.whenReady().then(async () => {
  registerIpcEvents()

  // 安装开发工具扩展
  if (isDev) {
    installDevTools()
  }

  // 初始化数据库
  await initializeDb()

  const mainWindow = new MainWindow()
  await mainWindow.createWindow()

  // 初始化 MCP 服务
  registerMcpHandlers(clientHub)

  app.on('activate', () => {
    if (!mainWindow.getWindow()) {
      mainWindow.createWindow()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.quit()
  })
})
