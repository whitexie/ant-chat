import type { McpToolCall, MessageContent, SendChatCompletionsOptions } from '@ant-chat/shared'

export interface ProviderOptions {
  baseUrl: string
  apiKey: string
}

export interface AIProvider {
  sendChatCompletions: (options: SendChatCompletionsOptions) => AsyncIterable<StreamChunk>
}

export interface AIProviderConstructor {
  new (options: ProviderOptions): AIProvider
}

export interface StreamChunk {
  content: MessageContent
  reasoningContent: string
  functionCalls?: McpToolCall[]
}
