import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const providerServicesTable = sqliteTable('provider_services', {
  id: text('id').primaryKey().$defaultFn(() => `provider-${nanoid()}`),
  name: text('name').notNull(),
  baseUrl: text('base_url').notNull(),
  apiKey: text('api_key'),
  apiMode: text('api_mode').notNull(),
  isOfficial: integer('is_official', { mode: 'boolean' }).notNull().default(false),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s','now'))`),
})
