import process from 'node:process'
import { app } from 'electron'
import { McpService } from './mcp/index'
import { logger } from './utils/logger'
import { MainWindow } from './window'

const __dirname = process.cwd()

logger.info('Electron 主进程启动', __dirname)

app.whenReady().then(async () => {
  const mainWindow = new MainWindow()
  await mainWindow.createWindow()

  // 初始化 MCP 服务
  const mcpService = new McpService()

  mcpService.registerEvent()

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
