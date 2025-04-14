import type { Role } from '@/constants'

declare const __brand: unique symbol
interface Brand<B> { [__brand]: B }
export type Branded<T, B> = T & Brand<B>

export type MessageId = Branded<string, 'MessageId'>
export type ConversationsId = Branded<string, 'ConversationId'>
export type ModelConfigId = 'Gemini' | 'OpenAI' | 'DeepSeek'
type Timestamp = number

export interface ModelConfig {
  id: ModelConfigId
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

export interface IConversationBase {
  id: ConversationsId
  title: string
  createAt: Timestamp
  updateAt: Timestamp
  settings?: IConversationsSettings
}

interface IConversationType extends IConversationBase {
  type: 'conversation'
  completed?: boolean
}

interface ITaskType extends IConversationBase {
  type: 'task'
  completed: boolean
}

export type IConversations = IConversationType | ITaskType

export interface IAttachment {
  uid: string
  name: string
  size: number
  type: string
  data: string
}

export type IImage = IAttachment

export interface IMcpToolCall {
  serverName: string
  toolName: string
  arguments: string
  executing: boolean
  result?: IMcpToolResult
}

export interface IMcpToolResult {
  success: boolean
  data?: any
  error?: string
}

export interface IFollowupQuestion {
  question: string
  answer?: string
}

export type MessageType = 'normal' | 'use_mcp_tool' | 'question'

export interface MessageBase {
  id: MessageId
  convId: ConversationsId
  role: Role
  content: string
  reasoningContent?: string
  createAt: Timestamp
  status?: 'success' | 'error' | 'loading' | 'typing' | 'cancel'
  images: IAttachment[]
  attachments: IAttachment[]
}

export interface NormalMessage extends MessageBase {
  type: 'normal'
}

export interface MCPTollMessage extends MessageBase {
  type: 'use_mcp_tool'
  /** MCP 相关字段 */
  mcpTool?: IMcpToolCall
}

export interface QuestionMessage extends MessageBase {
  type: 'question'
  question: string
  answer?: string
  answerAt?: Timestamp
}

export type IMessage = NormalMessage | MCPTollMessage | QuestionMessage

export interface ITextContent {
  type: 'text'
  text: string
}

export interface IImageContent {
  type: 'image_url'
  image_url: IImage
}

export type IMessageContent = string | (ITextContent | IImageContent)[]
