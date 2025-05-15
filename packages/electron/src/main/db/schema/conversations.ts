import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import z from 'zod'

export const ModelConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  apiHost: z.string(),
  apiKey: z.string(),
  model: z.string(),
  temperature: z.number(),
})

// 会话设置
export const ConversationsSettingsSchema = z.object({
  modelConfig: z.union([ModelConfigSchema, z.null()]).optional(),
  systemPrompt: z.string().optional().optional(),
})

export type IConversationsSettings = z.infer<typeof ConversationsSettingsSchema>

// 会话表
export const conversationsTable = sqliteTable('conversations', {
  id: text('id').primaryKey().$defaultFn(() => `conv-${nanoid()}`),
  title: text('title').notNull(),
  createAt: integer('create_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updateAt: integer('update_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  settings: text('settings', { mode: 'json' }).$type<IConversationsSettings>(),
})

// ============================ Select Schema ============================
export const conversationsSelectSchema = createSelectSchema(conversationsTable)

// ============================ Insert Schema ============================
export const conversationsInsertSchema = createInsertSchema(conversationsTable, {
  settings: ConversationsSettingsSchema.optional(),
})
export type ConversationsInsertSchema = z.infer<typeof conversationsInsertSchema>

// ============================ Update Schema ============================
export const conversationsUpdateSchema = createUpdateSchema(conversationsTable, {
  id: z.string(),
})
export type ConversationsUpdateSchema = z.infer<typeof conversationsUpdateSchema>
