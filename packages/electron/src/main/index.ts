import process from 'node:process'
import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { app } from 'electron'
import { initializeDb } from './db'
import { registerCommonHandlers } from './ipcHandlers/commonHandlers'
import { registerDbHandlers } from './ipcHandlers/dbHandlers'
import { registerMcpHandlers } from './ipcHandlers/mcpHandlers'
import { logger } from './utils/logger'
import { MainWindow } from './window'

const __dirname = process.cwd()

logger.info('Electron 主进程启动', __dirname)

app.whenReady().then(async () => {
  // 初始化数据库
  await initializeDb()

  const mainWindow = new MainWindow()
  await mainWindow.createWindow()

  registerDbHandlers()
  registerCommonHandlers()
  // 初始化 MCP 服务
  const clientHub = new MCPClientHub()
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
