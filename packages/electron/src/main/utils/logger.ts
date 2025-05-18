import path from 'node:path'
import log from 'electron-log'
import { APP_NAME } from './constants'
import { isDev } from './env'
import { getAppHand } from './util'

const userDataPath = getAppHand()
const logPath = path.join(userDataPath, APP_NAME, 'logs/main.log')

log.transports.file.maxSize = 1024 * 1024 * 5 // 10MB

if (userDataPath) {
  log.transports.file.resolvePathFn = () => logPath
}

log.debug('log path: ', logPath)

const loggingEnabled = true

const logger = log

function hookConsole() {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    trace: console.trace,
  }

  // 替换console方法
  console.log = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.info(...args)
    }
  }

  console.error = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.error(...args)
    }
  }

  console.warn = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.warn(...args)
    }
  }

  console.info = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.info(...args)
    }
  }

  console.debug = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.debug(...args)
    }
  }

  console.trace = (...args: unknown[]) => {
    // 只有在启用日志或开发模式下才记录日志
    if (loggingEnabled || isDev) {
      logger.debug(...args)
    }
  }

  return originalConsole
}

// 导出原始console方法，以便需要时可以恢复
export const originalConsole = hookConsole()

export {
  logger,
}
