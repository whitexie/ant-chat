import { join } from 'node:path'
import process from 'node:process'
import { app, BrowserWindow, ipcMain, Menu } from 'electron'

class MainWindow {
  private window: BrowserWindow | null = null
  private readonly isDev = process.env.NODE_ENV === 'development'
  private readonly DEV_SERVER_URL = 'http://localhost:5173' // Vite 默认端口

  private createMenu() {
    const isMac = process.platform === 'darwin'

    const template = [
      // macOS 应用菜单
      ...(isMac
        ? [{
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          }]
        : []),
      // 编辑菜单
      {
        label: '编辑',
        submenu: [
          { role: 'undo', label: '撤销' },
          { role: 'redo', label: '重做' },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '复制' },
          { role: 'paste', label: '粘贴' },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle', label: '粘贴并匹配样式' },
                { role: 'delete', label: '删除' },
                { role: 'selectAll', label: '全选' },
              ]
            : [
                { role: 'delete', label: '删除' },
                { type: 'separator' },
                { role: 'selectAll', label: '全选' },
              ]),
        ],
      },
      // 视图菜单
      {
        label: '视图',
        submenu: [
          { role: 'reload', label: '重新加载' },
          { role: 'forceReload', label: '强制重新加载' },
          { role: 'toggleDevTools', label: '开发者工具' },
          { type: 'separator' },
          { role: 'resetZoom', label: '重置缩放' },
          { role: 'zoomIn', label: '放大' },
          { role: 'zoomOut', label: '缩小' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: '全屏' },
        ],
      },
      // 开发菜单（仅在开发模式显示）
      ...(this.isDev
        ? [{
            label: '开发',
            submenu: [
              {
                label: '切换开发者工具',
                accelerator: isMac ? 'Command+Option+I' : 'Ctrl+Shift+I',
                click: () => {
                  this.window?.webContents.toggleDevTools()
                },
              },
            ],
          }]
        : []),
    ]

    const menu = Menu.buildFromTemplate(template as any)
    Menu.setApplicationMenu(menu)
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: !this.isDev, // 开发模式下禁用同源策略
      },
    })

    // 创建菜单
    this.createMenu()

    // 开发模式下加载本地服务器
    if (this.isDev) {
      console.log('Loading dev server:', this.DEV_SERVER_URL)
      this.window.loadURL(this.DEV_SERVER_URL).catch((err) => {
        console.error('Failed to load dev server:', err)
        console.log('Please make sure the web project is running (pnpm dev)')
      })

      // 自动打开开发者工具
      this.window.webContents.openDevTools()

      // 添加快捷键支持
      this.window.webContents.on('before-input-event', (event, input) => {
        // Command+Option+I (Mac) 或 Ctrl+Shift+I (Windows/Linux)
        if (input.key === 'i' && input.control && input.shift) {
          this.window?.webContents.toggleDevTools()
          event.preventDefault()
        }
        // 刷新页面: Command+R (Mac) 或 Ctrl+R (Windows/Linux)
        if (input.key === 'r' && (input.control || input.meta)) {
          this.window?.webContents.reload()
          event.preventDefault()
        }
      })

      // 监听页面加载状态
      this.window.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
        console.error('Page failed to load:', errorCode, errorDescription)
      })

      this.window.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully')
      })
    }
    else {
      // 生产环境加载打包后的文件
      const webDistPath = join(__dirname, '../../../web/dist/index.html')
      this.window.loadFile(webDistPath)
    }

    this.window.on('closed', () => {
      this.window = null
    })
  }

  getWindow() {
    return this.window
  }
}

// 创建主窗口实例
const mainWindow = new MainWindow()

app.whenReady().then(() => {
  mainWindow.createWindow()

  app.on('activate', () => {
    if (!mainWindow.getWindow())
      mainWindow.createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})

// IPC 通信示例
ipcMain.handle('get-is-electron', () => true)
