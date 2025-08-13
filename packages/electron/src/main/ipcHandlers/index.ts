import type { BrowserWindow } from 'electron'
import { registerChatHandlers } from './chatHandlers'
import { registerCommonHandlers } from './commonHandlers'
import { registerDbHandlers } from './dbHandlers'
import { registerChatServiceEvent } from './registerChatServiceEvent'

export function registerIpcEvents(mainWindow: BrowserWindow) {
  registerDbHandlers()
  registerCommonHandlers(mainWindow)
  registerChatHandlers()
  registerChatServiceEvent()
}
