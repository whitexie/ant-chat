import process from 'node:process'
import { app } from 'electron'
import { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer'
import { initializeDb } from './db'
import { registerChatHandlers } from './ipcHandlers/chatHandlers'
import { registerCommonHandlers } from './ipcHandlers/commonHandlers'
import { registerDbHandlers } from './ipcHandlers/dbHandlers'
import { registerMcpHandlers } from './ipcHandlers/mcpHandlers'
import { clientHub } from './mcpClientHub'
import { isDev } from './utils/env'
import { logger } from './utils/logger'
import { MainWindow } from './window'

const __dirname = process.cwd()

logger.info('Electron 主进程启动', __dirname)

app.whenReady().then(async () => {
  registerDbHandlers()
  registerCommonHandlers()
  registerChatHandlers()

  // 安装开发工具扩展
  if (isDev) {
    try {
      // 先安装 React Developer Tools
      await installExtension(REACT_DEVELOPER_TOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: true,
      })
        .then(ext => logger.info(`Added Extension: ${ext.name}`))
        .catch(err => logger.error('React DevTools installation error:', err))

      // 再安装 Redux DevTools
      await installExtension(REDUX_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: true,
      })
        .then(ext => logger.info(`Added Extension: ${ext.name}`))
        .catch(err => logger.error('Redux DevTools installation error:', err))
    }
    catch (err) {
      logger.error('Failed to install dev tools:', err)
    }
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
