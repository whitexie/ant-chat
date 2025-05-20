import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { providerServicesTable } from './providerServices'

interface ModelFeature {
  functionCall?: boolean
  deepThinking?: boolean
  vision?: boolean
}

export const providerServiceModelsTable = sqliteTable(
  'provider_service_models',
  {
    id: text('id').primaryKey(),
    model: text('model').notNull(),
    isBuiltin: integer('is_builtin', { mode: 'boolean' }).notNull().default(false),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
    modelFeatures: text('model_features', { mode: 'json' }).$type<ModelFeature | null>(),
    providerServiceId: text('provider_service_id').notNull().references(() => providerServicesTable.id),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s','now'))`),
  },
  t => [unique().on(t.model, t.providerServiceId)],
)
