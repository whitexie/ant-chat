import { z } from 'zod'

// 文本内容
export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

export type TextContent = z.infer<typeof TextContentSchema>

// 图片内容
export const ImageContentSchema = z.object({
  type: z.literal('image'),
  mimeType: z.string(),
  data: z.string(),
})

export type ImageContent = z.infer<typeof ImageContentSchema>

// 消息内容
export const MessageContentSchema = z.array(z.union([TextContentSchema, ImageContentSchema]))

export type MessageContent = z.infer<typeof MessageContentSchema>

// 附件
export const AttachmentSchema = z.object({
  uid: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  data: z.string(),
})

export type AttachmentSchema = z.infer<typeof AttachmentSchema>

// 图片
export type ImageSchema = AttachmentSchema

// MCP工具结果
export const McpToolResultSchema = z.object({
  success: z.boolean(),
  data: z.string().optional(),
  error: z.string().optional(),
})

export type McpToolResult = z.infer<typeof McpToolResultSchema>

// MCP工具调用
export const McpToolCallSchema = z.object({
  id: z.string(),
  serverName: z.string(),
  toolName: z.string(),
  args: z.record(z.unknown()),
  executeState: z.enum(['await', 'executing', 'completed']),
  result: McpToolResultSchema.optional(),
})

export type McpToolCall = z.infer<typeof McpToolCallSchema>

// 模型信息
export const ModelInfoSchema = z.object({
  provider: z.string(),
  model: z.string(),
})

export type ModelInfo = z.infer<typeof ModelInfoSchema>

const BaseMessage = z.object({
  id: z.string().nanoid(),
  convId: z.string(),
  content: MessageContentSchema,
  createAt: z.number(),
  // updateAt: z.number(),
})

export const UserMessage = BaseMessage.extend({
  role: z.literal('user'),
  images: z.array(AttachmentSchema),
  attachments: z.array(AttachmentSchema),
  status: z.literal('success'),
})

export type UserMessage = z.infer<typeof UserMessage>

export const AIMessage = BaseMessage.extend({
  role: z.literal('assistant'),
  status: z.enum(['success', 'error', 'loading', 'typing', 'cancel']),
  modelInfo: ModelInfoSchema,
  mcpTool: z.array(McpToolCallSchema).optional(),
})

export type AIMessage = z.infer<typeof AIMessage>

export const Message = z.union([AIMessage, UserMessage])
export type Message = z.infer<typeof Message>

// ============================ Add Message Schema ============================
export const AddMessage = z.union([
  AIMessage.omit({ id: true, createAt: true }),
  UserMessage.omit({ id: true, createAt: true }),
])
export type AddMessage = z.infer<typeof AddMessage>

// ============================ Update Message Schema ============================
export const UpdateMessageSchema = z.union([
  AIMessage.partial().extend({ id: z.string() }),
  UserMessage.partial().extend({ id: z.string() }),
])

export type UpdateMessageSchema = z.infer<typeof UpdateMessageSchema>
