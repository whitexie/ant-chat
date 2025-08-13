import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

console.log('开始执行数据库迁移...')

// 数据库文件路径
const dbPath = path.resolve('./dev.db')
console.log(`数据库路径: ${dbPath}`)

// 创建数据库连接
const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

// 执行迁移
console.log('应用迁移...')

db.run('PRAGMA foreign_keys=OFF;')
migrate(db, { migrationsFolder: path.resolve('./migrations') })
db.run('PRAGMA foreign_keys=ON;')

console.log('数据库迁移完成!')
