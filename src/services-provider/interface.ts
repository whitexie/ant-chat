import type { ChatFeatures as _ChatFeatures } from '@/store/features'

export type ChatFeatures = _ChatFeatures

export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

export interface ChatCompletionsCallbacks {
  onUpdate?: (message: string) => void
  onSuccess?: (message: string) => void
  onError?: (message: Error) => void
}

export interface IModel {
  id: string
  object: 'model'
  owned_by: string
}

export interface SendChatCompletionsOptions {
  features?: ChatFeatures
  callbacks?: ChatCompletionsCallbacks
  addAbortCallback?: (callback: () => void) => void
}
