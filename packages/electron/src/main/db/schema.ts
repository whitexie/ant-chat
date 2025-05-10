import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 会话表
export const conversationsTable = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createAt: integer('create_at').notNull(),
  updateAt: integer('update_at').notNull(),
  settings: text('settings'), // JSON字符串存储
})

// 消息表
export const messagesTable = sqliteTable('messages', {
  id: text('id').primaryKey(),
  convId: text('conv_id').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createAt: integer('create_at').notNull(),
  status: text('status').notNull(),
  images: text('images'), // JSON字符串存储
  attachments: text('attachments'), // JSON字符串存储
  reasoningContent: text('reasoning_content'),
  mcpTool: text('mcp_tool'), // JSON字符串存储
  modelInfo: text('model_info'), // JSON字符串存储
})

// 自定义模型表
export const customModelsTable = sqliteTable('custom_models', {
  id: text('id').primaryKey(),
  ownedBy: text('owned_by').notNull(),
  createAt: integer('create_at').notNull(),
})

// MCP配置表
export const mcpConfigsTable = sqliteTable('mcp_configs', {
  serverName: text('server_name').primaryKey(),
  icon: text('icon').notNull(),
  description: text('description'),
  timeout: integer('timeout'),
  transportType: text('transport_type').notNull(),
  createAt: integer('create_at').notNull(),
  updateAt: integer('update_at').notNull(),

  // sse 特有字段
  url: text('url'),

  // stdio 特有字段
  command: text('command'),
  args: text('args'), // JSON字符串存储
  env: text('env'), // JSON字符串存储
})
