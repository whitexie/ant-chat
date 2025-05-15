import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 自定义模型表
export const customModelsTable = sqliteTable('custom_models', {
  id: text('id').primaryKey(),
  ownedBy: text('owned_by').notNull(),
  createAt: integer('create_at').notNull(),
})
