import type { AIProviderConstructor } from './interface'
import OpenAIService from './openai'

export const AIProviderMapping: Record<string, AIProviderConstructor> = {
  openai: OpenAIService,
} as const
