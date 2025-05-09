import type { Role } from '@/constants'

export type MessageId = string
export type ConversationsId = string
export type ModelConfigId = 'Google' | 'Gemini' | 'OpenAI' | 'DeepSeek'
type Timestamp = number

export interface ModelConfig {
  id: ModelConfigId | string
  name?: string
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

export interface IConversationsSettings {
  modelConfig?: ModelConfig | null
  systemPrompt?: string
}

export interface IConversations {
  id: ConversationsId
  title: string
  createAt: Timestamp
  updateAt: Timestamp
  settings?: IConversationsSettings
}

export interface IAttachment {
  uid: string
  name: string
  size: number
  type: string
  data: string
}

export type IImage = IAttachment

export interface IMcpToolCall {
  id: string
  serverName: string
  toolName: string
  args: Record<string, unknown> | string
  executeState: 'await' | 'executing' | 'completed'
  result?: IMcpToolResult
}

export interface IMcpToolResult {
  success: boolean
  data?: string
  error?: string
}

export interface IModelInfo {
  provider: string
  model: string
}

export interface IMessageBase {
  id: MessageId
  convId: ConversationsId
  createAt: Timestamp
}

export interface IMessageSystem extends IMessageBase {
  role: Role.SYSTEM
  content: string
  status: 'success'
}

export interface IMessageUser extends IMessageBase {
  role: Role.USER
  content: string
  images: IAttachment[]
  attachments: IAttachment[]
  status: 'success'
}

export interface IMessageAI extends IMessageBase {
  role: Role.AI
  reasoningContent?: string
  content: IMessageContent
  status: 'success' | 'error' | 'loading' | 'typing' | 'cancel'
  /** MCP 相关字段 */
  mcpTool?: IMcpToolCall[]
  /** 生成当前消息的模型信息 */
  modelInfo?: IModelInfo
}

export type IMessage = IMessageAI | IMessageUser | IMessageSystem

export interface ITextContent {
  type: 'text'
  text: string
}

export interface IImageContent {
  type: 'image'
  mimeType: string
  data: string
}

export type IMessageContent = string | (ITextContent | IImageContent)[]

// ============================ MCP-Server 相关类型 ============================
export type McpServerStatus = 'connected' | 'connecting' | 'disconnected'
export interface McpServerBase {
  icon: string
  // state: 'connected' | 'connecting' | 'disconnected'
  serverName: string
  description?: string
  timeout?: number
  createAt: Timestamp
  updateAt: Timestamp
}

export interface StdioConfigSchema extends McpServerBase {
  transportType: 'stdio'
  command: string
  args: string[]
  env?: Record<string, number | string | boolean>
}

export interface SseConfigSchema extends McpServerBase {
  transportType: 'sse'
  url: string
}

export type McpConfig = StdioConfigSchema | SseConfigSchema
