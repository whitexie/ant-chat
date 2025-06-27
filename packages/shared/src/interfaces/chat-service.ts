import type { ChatFeatures, IMessage } from './db-types'

export interface SendChatCompletionsOptions {
  messages: IMessage[]
  chatSettings: {
    providerId: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    model: string
    features: ChatFeatures
  }
}

export interface handleChatCompletionsOptions {
  conversationsId: string
  chatSettings: {
    providerId: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    model: string
    features: ChatFeatures
  }
}
