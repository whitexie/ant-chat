import type { IMcpToolCall, IMessageContent } from '@ant-chat/shared'
import type { ChatFeatures as _ChatFeatures } from '@/store/features'

export type ChatFeatures = _ChatFeatures

export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
  enableMCP?: boolean
}

export interface ChatCompletionsCallbacks {
  onUpdate?: (message: { message: IMessageContent, reasoningContent: string, functioncalls?: IMcpToolCall[] }) => void
  onSuccess?: (message: { message: IMessageContent, reasoningContent: string, functioncalls?: IMcpToolCall[] }) => void
  onError?: (message: Error) => void
}

export interface IModel {
  id: string
  ownedBy: string
  createAt: number
}

export interface SendChatCompletionsOptions {
  features?: Partial<ChatFeatures>
  callbacks?: ChatCompletionsCallbacks
  abortController?: AbortController
}
