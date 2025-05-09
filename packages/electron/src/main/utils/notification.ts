import type { NotificationOption } from '@ant-chat/shared'
import { ipcEvents } from '@ant-chat/shared'
import { getMainWindow } from '../window'
import { logger } from './logger'

type Option = Omit<NotificationOption, 'type'>

export class Notification {
  static info(option: Option) {
    notification({ ...option, type: 'info' })
  }

  static warn(option: Option) {
    notification({ ...option, type: 'warning' })
  }

  static success(option: Option) {
    notification({ ...option, type: 'success' })
  }

  static error(option: Option) {
    notification({ ...option, type: 'error' })
  }
}

function notification(option: NotificationOption) {
  const window = getMainWindow()
  if (window) {
    logger.debug('send NOTIFICATION', JSON.stringify(option))
    window.webContents.send(ipcEvents.NOTIFICATION, option)
  }
}
