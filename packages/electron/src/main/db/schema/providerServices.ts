import type { ProviderServiceSchema } from '@ant-chat/shared'
import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { providerServiceModelsTable } from './providerServiceModels'

export const providerServicesTable = sqliteTable('provider_services', {
  id: text('id').primaryKey().$defaultFn(() => `provider-${nanoid()}`),
  name: text('name').notNull(),
  baseUrl: text('base_url').notNull(),
  apiKey: text('api_key').notNull().default(''),
  apiMode: text('api_mode', { enum: ['openai', 'anthropic', 'gemini'] }).notNull().$type<ProviderServiceSchema['apiMode']>(),
  isOfficial: integer('is_official', { mode: 'boolean' }).notNull().default(false),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s','now'))`),
})

/**
 * 定义关联关系
 */
export const providerServicesRelations = relations(
  providerServicesTable,
  ({ many }) => ({
    models: many(providerServiceModelsTable),
  }),
)
