import { mainListener } from '../utils/ipc-events-bus'
import { clipboardWrite } from '../utils/util'

export function registerCommonHandlers() {
  mainListener.handle('common:clipboard-write', async (_, text) => {
    return clipboardWrite(text)
  })
}
