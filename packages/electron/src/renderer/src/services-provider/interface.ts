import type { ChatFeatures, IMcpToolCall, IMessageContent } from '@ant-chat/shared'

export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
  maxTokens: number
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
