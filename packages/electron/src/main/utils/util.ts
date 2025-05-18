import { existsSync, mkdirSync } from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, clipboard } from 'electron'

export function clipboardWrite(data: Electron.Data, type?: 'selection' | 'clipboard') {
  clipboard.write(data, type)
  return true
}

/**
 * 系统目录
 * 获取用户目录下appdata目录，win下指向C:\Users\用户名\AppData\Roaming
 * @returns string
 */
export function getAppHand() {
  return app.getPath('appData')
}

/**
 * 系统目录
 * 获取用户目录下userData（app）目录，win下指向C:\Users\用户名\AppData\Roaming\appname
 * @returns string
 */
export function getUserDataPath() {
  return app.getPath('userData')
}

/**
 * 安装目录
 * 获取打包的resource路径，开发环境为项目根目录
 * @returns string
 */
export function getResourcePath() {
  return process.resourcesPath
}

/**
 * 是否是mac
 * @returns string
 */
export function isMac() {
  return process.platform === 'darwin'
}

/**
 * 获取当前文件目录
 * @param importMetaUrl import.meta.url
 * @returns string
 */
export function getDirname(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl))
}

/**
 * 生成数据库文件夹
 */
export function generateDbPath(dirString: string) {
  try {
    const dir = dirname(dirString)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }
  catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}
