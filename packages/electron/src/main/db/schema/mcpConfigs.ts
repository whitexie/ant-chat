import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

// MCP配置表
export const mcpConfigsTable = sqliteTable('mcp_configs', {
  serverName: text('server_name').primaryKey(),
  icon: text('icon').notNull(),
  description: text('description'),
  timeout: integer('timeout'),
  transportType: text('transport_type', { enum: ['stdio', 'sse'] }).notNull(),
  createAt: integer('create_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updateAt: integer('update_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),

  // sse 特有字段
  url: text('url'),

  // stdio 特有字段
  command: text('command'),
  args: text('args', { mode: 'json' }).$type<string[] | null>().default(null),
  env: text('env', { mode: 'json' }).$type<Record<string, any> | null>().default(null),
})

// ============================ Select Schema ============================
export const mcpConfigsSelectSchema = createSelectSchema(mcpConfigsTable)
export type McpConfigsSelectSchema = z.infer<typeof mcpConfigsSelectSchema>

// ============================ Insert Schema ============================
export const mcpConfigsInsertSchema = createInsertSchema(mcpConfigsTable, {
  args: z.array(z.string()).optional(),
  env: z.record(z.union([z.number(), z.string(), z.boolean()])).optional(),
})

export type McpConfigsInsertSchema = z.infer<typeof mcpConfigsInsertSchema>

// ============================ Update Schema ============================
export const mcpConfigsUpdateSchema = createUpdateSchema(mcpConfigsTable, {
  serverName: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.union([z.number(), z.string(), z.boolean()])).optional(),
})
export type McpConfigsUpdateSchema = z.infer<typeof mcpConfigsUpdateSchema>
