import type { ModelFeaturesSchema } from '@ant-chat/shared'
import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { providerServicesTable } from './providerServices'

export const providerServiceModelsTable = sqliteTable(
  'provider_service_models',
  {
    id: text('id').primaryKey().$defaultFn(() => `model-${nanoid()}`),
    name: text('name').notNull(),
    model: text('model').notNull(),
    isBuiltin: integer('is_builtin', { mode: 'boolean' }).notNull().default(false),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
    modelFeatures: text('model_features', { mode: 'json' }).$type<ModelFeaturesSchema | null>(),
    providerServiceId: text('provider_service_id').notNull().references(() => providerServicesTable.id),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s','now'))`),
  },
  t => [unique().on(t.model, t.providerServiceId)],
)

/**
 * 定义关联关系
 */
export const providerServiceModelsRelations = relations(providerServiceModelsTable, ({ one }) => ({
  providerService: one(providerServicesTable, { fields: [providerServiceModelsTable.providerServiceId], references: [providerServicesTable.id] }),
}))
