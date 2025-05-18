import type { Database } from 'better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import _Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { APP_NAME, DB_CONFIG } from '../utils/constants'
import { logger } from '../utils/logger'
import { generateDbPath, getAppHand, getDirname } from '../utils/util'
import * as schema from './schema'

const __dirname = getDirname(import.meta.url)
const DB_PATH = path.join(getAppHand(), APP_NAME, DB_CONFIG.dbFileName)

// eslint-disable-next-line import/no-mutable-exports
export let db: BetterSQLite3Database<typeof schema>

/**
 * 连接数据库
 */
export async function initializeDb() {
  logger.debug('DB_PATH => ', DB_PATH)
  let sqlite: Database | null = null

  generateDbPath(DB_PATH)

  try {
    sqlite = new _Database(DB_PATH, {
      timeout: DB_CONFIG.timeout,
    })
    logger.info('Database connected successfully.')
  }
  catch (e) {
    logger.error('Failed to connect to the database:', (e as Error).message)
    process.exit(1)
  }

  if (!sqlite) {
    logger.error('Database connection is null after initialization attempt.')
    process.exit(1)
  }

  db = drizzle(sqlite as Database, { schema })
  const migrationsFolder = path.join(__dirname, '../../migrations')
  logger.debug('migrationsFolder => ', migrationsFolder)
  try {
    migrate(db, { migrationsFolder })
    logger.info('Database migrations applied successfully.')
  }
  catch (e) {
    logger.error('Failed to apply database migrations:', (e as Error).message)
    process.exit(1)
  }
}
