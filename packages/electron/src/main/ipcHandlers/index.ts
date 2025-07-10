import { registerChatHandlers } from './chatHandlers'
import { registerCommonHandlers } from './commonHandlers'
import { registerDbHandlers } from './dbHandlers'
import { registerChatServiceEvent } from './registerChatServiceEvent'

export function registerIpcEvents() {
  registerDbHandlers()
  registerCommonHandlers()
  registerChatHandlers()
  registerChatServiceEvent()
}
