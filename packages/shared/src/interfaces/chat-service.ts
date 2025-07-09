import type { ChatFeatures, IMessage } from './db-types'
import type { McpTool } from './mcp'

export interface ChatSettings {
  systemPrompt: string
  temperature: number
  maxTokens: number
  model: string
  features: ChatFeatures
}

export interface SendChatCompletionsOptions {
  messages: IMessage[]
  chatSettings: ChatSettings
  mcpTools?: McpTool[]
}

export interface handleChatCompletionsOptions {
  conversationsId: string
  chatSettings: Omit<ChatSettings, 'model'> & { modelId: string }
}
