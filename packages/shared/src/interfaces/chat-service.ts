import type { ChatFeatures, IMessage } from './db-types'
import type { McpTool } from './mcp'

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
  mcpTools?: McpTool[]
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
