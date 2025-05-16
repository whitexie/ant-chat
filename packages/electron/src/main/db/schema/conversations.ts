import type { ConversationsSettingsSchema } from '@ant-chat/shared'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

// 会话表
export const conversationsTable = sqliteTable('conversations', {
  id: text('id').primaryKey().$defaultFn(() => `conv-${nanoid()}`),
  title: text('title').notNull(),
  createAt: integer('create_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updateAt: integer('update_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  settings: text('settings', { mode: 'json' }).$type<ConversationsSettingsSchema>(),
})
