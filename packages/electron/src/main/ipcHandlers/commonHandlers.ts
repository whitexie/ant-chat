import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import { mainListener } from '../utils/ipc-events-bus'
import { clipboardWrite } from '../utils/util'

export function registerCommonHandlers(mainWindow: BrowserWindow) {
  mainListener.handle('common:clipboard-write', async (_, text) => {
    return clipboardWrite(text)
  })

  mainListener.on('common:minimize-window', async () => {
    return mainWindow.minimize()
  })

  // 保存窗口大小和位置
  let previousBounds: Electron.Rectangle

  mainListener.on('common:maximize-or-resore-window', async () => {
    const flag = mainWindow.isMaximized()
    console.log('isMaximized', flag)
    if (flag) {
      mainWindow.setBounds(previousBounds)
    }
    else {
      previousBounds = mainWindow.getBounds()
      mainWindow.maximize()
    }
  })

  mainListener.on('common:quit-app', async () => {
    app.quit()
  })
}
