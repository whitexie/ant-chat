// 从 web/db/interface.ts 迁移的类型定义，供 electron 和 web 包共用

// 基础类型
export type MessageId = string
export type ConversationsId = string
export type ModelConfigId = 'Google' | 'Gemini' | 'OpenAI' | 'DeepSeek'
export type Timestamp = number
export type Role = 'system' | 'user' | 'assistant'

// 模型配置
export interface ModelConfig {
  id: string
  name?: string
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

// 会话设置
export interface IConversationsSettings {
  modelConfig?: ModelConfig | null
  systemPrompt?: string
}

// 会话
export interface IConversations {
  id: ConversationsId
  title: string
  createAt: Timestamp
  updateAt: Timestamp
  settings?: IConversationsSettings | null
}

// 附件
export interface IAttachment {
  uid: string
  name: string
  size: number
  type: string
  data: string
}

// 图片
export type IImage = IAttachment

// MCP工具调用
export interface IMcpToolCall {
  id: string
  serverName: string
  toolName: string
  args: Record<string, unknown> | string
  executeState: 'await' | 'executing' | 'completed'
  result?: IMcpToolResult
}

// MCP工具结果
export interface IMcpToolResult {
  success: boolean
  data?: string
  error?: string
}

// 模型信息
export interface IModelInfo {
  provider: string
  model: string
}

// 消息基础接口
export interface IMessageBase {
  id: MessageId
  convId: ConversationsId
  createAt: Timestamp
}

// 系统消息
export interface IMessageSystem extends IMessageBase {
  role: 'system'
  content: IMessageContent
  status: 'success'
}

// 用户消息
export interface IMessageUser extends IMessageBase {
  role: 'user'
  content: IMessageContent
  images: IAttachment[]
  attachments: IAttachment[]
  status: 'success'
}

// AI消息
export interface IMessageAI extends IMessageBase {
  role: 'assistant'
  reasoningContent?: string
  content: IMessageContent
  status: 'success' | 'error' | 'loading' | 'typing' | 'cancel'
  /** MCP 相关字段 */
  mcpTool?: IMcpToolCall[]
  /** 生成当前消息的模型信息 */
  modelInfo?: IModelInfo
}

export interface IMessage {
  id: MessageId
  convId: ConversationsId
  createAt: Timestamp
  role: 'system' | 'user' | 'assistant'
  content: IMessageContent
  reasoningContent?: string
  status: 'success' | 'error' | 'loading' | 'typing' | 'cancel'
  images?: IAttachment[]
  attachments?: IAttachment[]
  /** MCP 相关字段 */
  mcpTool?: IMcpToolCall[]
  /** 生成当前消息的模型信息 */
  modelInfo?: IModelInfo
}

// 文本内容
export interface ITextContent {
  type: 'text'
  text: string
}

// 图片内容
export interface IImageContent {
  type: 'image'
  mimeType: string
  data: string
}

// 消息内容
export type IMessageContent = (ITextContent | IImageContent)[]

// MCP服务器状态
export type McpServerStatus = 'connected' | 'connecting' | 'disconnected'

// MCP服务器基础配置
export interface McpServerBase {
  icon: string
  serverName: string
  description?: string
  timeout?: number
  createAt: Timestamp
  updateAt: Timestamp
}

// STDIO配置模式
export interface StdioConfigSchema extends McpServerBase {
  transportType: 'stdio'
  command: string
  args: string[]
  env?: Record<string, number | string | boolean>
}

// SSE配置模式
export interface SseConfigSchema extends McpServerBase {
  transportType: 'sse'
  url: string
}

// MCP配置联合类型
export type McpConfig = StdioConfigSchema | SseConfigSchema
