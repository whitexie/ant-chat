import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import fs from 'node:fs'
// import { createRequire } from 'node:module'
import path from 'node:path'

import process from 'node:process'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { isDev } from '../utils/env'
import { logger } from '../utils/logger'
import * as schema from './schema'

// const require = createRequire(import.meta.url)

let Database: any

try {
  Database = require('better-sqlite3')
}
catch (error) {
  logger.error('加载 better-sqlite3 失败:', error)
  throw new Error(`无法加载 better-sqlite3 模块: ${error}`)
}

const projectPath = process.cwd()

// 数据库文件路径
export const dbPath = isDev ? path.join(projectPath, 'dev.db') : path.join(app.getPath('userData'), 'ant-chat', 'antChat.db')
logger.debug('dbPath => ', dbPath)

// 确保目录存在
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  logger.debug(`创建数据库目录: ${dbDir}`)
}

// 创建数据库连接实例和 db 对象
let sqlite: any
let _db: BetterSQLite3Database<typeof schema>

try {
  sqlite = new Database(dbPath)
  _db = drizzle(sqlite, { schema })
}
catch (error) {
  logger.error('创建数据库连接失败:', error)
  throw new Error(`无法创建数据库连接: ${error}`)
}

// 使用只读导出
const db = _db

// 确保数据库初始化（应用迁移）
export async function initializeDb() {
  logger.debug('初始化数据库...')

  try {
    // 读取并执行所有迁移文件
    const migrationsFolder = path.join(projectPath, './src/main/db/migrations')
    logger.debug(`迁移文件夹路径: ${migrationsFolder}`)

    await migrate(db, {
      migrationsFolder,
    })

    logger.debug('数据库初始化完成')
    return db
  }
  catch (error) {
    logger.error('数据库迁移失败:', error)
    throw new Error(`数据库迁移失败: ${error}`)
  }
}

export default db
