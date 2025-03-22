import type { ChatFeatures as _ChatFeatures } from '@/store/features'

export type ChatFeatures = _ChatFeatures

export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

export interface ChatCompletionsCallbacks {
  onUpdate?: (message: { message: string, reasoningContent: string }) => void
  onSuccess?: (message: { message: string, reasoningContent: string }) => void
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
