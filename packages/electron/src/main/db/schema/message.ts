import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import z from 'zod'

// 文本内容
export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

export type ITextContent = z.infer<typeof TextContentSchema>

// 图片内容
export const ImageContentSchema = z.object({
  type: z.literal('image'),
  mimeType: z.string(),
  data: z.string(),
})

export type IImageContent = z.infer<typeof ImageContentSchema>

// 消息内容
export const MessageContentSchema = z.array(z.union([TextContentSchema, ImageContentSchema]))

export type IMessageContent = z.infer<typeof MessageContentSchema>

// 附件
export const AttachmentSchema = z.object({
  uid: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  data: z.string(),
})

export type IAttachment = z.infer<typeof AttachmentSchema>

// 图片
export type IImage = IAttachment

// MCP工具结果
export const McpToolResultSchema = z.object({
  success: z.boolean(),
  data: z.string().optional(),
  error: z.string().optional(),
})

export type IMcpToolResult = z.infer<typeof McpToolResultSchema>

// MCP工具调用
export const McpToolCallSchema = z.object({
  id: z.string(),
  serverName: z.string(),
  toolName: z.string(),
  args: z.union([z.record(z.unknown()), z.string()]),
  executeState: z.enum(['await', 'executing', 'completed']),
  result: McpToolResultSchema.optional(),
})

export type IMcpToolCall = z.infer<typeof McpToolCallSchema>

// 模型信息
export const ModelInfoSchema = z.object({
  provider: z.string(),
  model: z.string(),
})

export type IModelInfo = z.infer<typeof ModelInfoSchema>

// 消息表
export const messagesTable = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => `msg-${nanoid()}`),
  convId: text('conv_id').notNull(),
  role: text('role').notNull(),
  content: text('content', { mode: 'json' }).notNull().$type<IMessageContent>(),
  createAt: integer('create_at').notNull(),
  status: text('status').notNull(),
  images: text('images', { mode: 'json' }).$type<IAttachment[]>().default([]),
  attachments: text('attachments', { mode: 'json' }).$type<IAttachment[]>().default([]),
  reasoningContent: text('reasoning_content'),
  mcpTool: text('mcp_tool', { mode: 'json' }).$type<IMcpToolCall[] | null>().default(null),
  modelInfo: text('model_info', { mode: 'json' }).$type<IModelInfo | null>().default(null),
})

// ============================ Insert Schema ============================
export const messageInsertSchema = createInsertSchema(messagesTable, {
  images: z.array(AttachmentSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  mcpTool: z.array(McpToolCallSchema).optional(),
  modelInfo: ModelInfoSchema.optional(),
  createAt: z.number().optional(),
})
export type MessageInserSchema = z.infer<typeof messageInsertSchema>

// ============================ Update Schema ============================
export const messageUpdateSchema = createUpdateSchema(messagesTable, {
  id: z.string(),
  convId: z.string(),
  images: z.array(AttachmentSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  mcpTool: z.array(McpToolCallSchema).optional(),
  modelInfo: ModelInfoSchema.optional(),
})
export type MessageUpdateSchema = z.infer<typeof messageUpdateSchema>
