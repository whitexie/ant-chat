import type { Role } from '@/constants'

declare const __brand: unique symbol
interface Brand<B> { [__brand]: B }
export type Branded<T, B> = T & Brand<B>

export type MessageId = Branded<string, 'MessageId'>
export type ConversationsId = Branded<string, 'ConversationId'>
export type ModelConfigId = 'Gemini' | 'OpenAI' | 'DeepSeek'
type CreateAt = number

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

export interface IConversations {
  id: ConversationsId
  title: string
  createAt: CreateAt
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

export interface IMessage {
  id: MessageId
  convId: ConversationsId
  role: Role
  content: string
  /** 推理内容 */
  reasoningContent?: string
  createAt: CreateAt
  status?: 'success' | 'error' | 'loading' | 'typing'
  images: IAttachment[]
  attachments: IAttachment[]
}

export interface ITextContent {
  type: 'text'
  text: string
}

export interface IImageContent {
  type: 'image_url'
  image_url: IImage
}

export type IMessageContent = string | (ITextContent | IImageContent)[]
