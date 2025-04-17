/**
 * Electron主进程日志工具
 * 用于在终端中显示应用日志
 */

// 日志级别
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// 日志颜色
const LogColors = {
  [LogLevel.DEBUG]: '\x1B[36m', // 青色
  [LogLevel.INFO]: '\x1B[32m', // 绿色
  [LogLevel.WARN]: '\x1B[33m', // 黄色
  [LogLevel.ERROR]: '\x1B[31m', // 红色
  RESET: '\x1B[0m', // 重置颜色
}

/**
 * 格式化日志消息
 */
function formatLogMessage(level: LogLevel, message: any, ...args: any[]): string {
  const timestamp = new Date().toISOString()
  const formattedMessage = typeof message === 'object'
    ? JSON.stringify(message, null, 2)
    : message

  return `${timestamp} ${level} - ${formattedMessage} ${args.length ? JSON.stringify(args) : ''}`
}

/**
 * 主进程日志类
 */
class MainLogger {
  /**
   * 打印调试日志
   */
  debug(message: any, ...args: any[]): void {
    const formattedMessage = formatLogMessage(LogLevel.DEBUG, message, ...args)
    console.log(`${LogColors[LogLevel.DEBUG]}${formattedMessage}${LogColors.RESET}`)
  }

  /**
   * 打印信息日志
   */
  info(message: any, ...args: any[]): void {
    const formattedMessage = formatLogMessage(LogLevel.INFO, message, ...args)
    console.log(`${LogColors[LogLevel.INFO]}${formattedMessage}${LogColors.RESET}`)
  }

  /**
   * 打印警告日志
   */
  warn(message: any, ...args: any[]): void {
    const formattedMessage = formatLogMessage(LogLevel.WARN, message, ...args)
    console.log(`${LogColors[LogLevel.WARN]}${formattedMessage}${LogColors.RESET}`)
  }

  /**
   * 打印错误日志
   */
  error(message: any, ...args: any[]): void {
    const formattedMessage = formatLogMessage(LogLevel.ERROR, message, ...args)
    console.error(`${LogColors[LogLevel.ERROR]}${formattedMessage}${LogColors.RESET}`)
  }
}

// 导出单例
export const logger = new MainLogger()
