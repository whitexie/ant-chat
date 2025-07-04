import type { AIProviderConstructor } from './interface'
import GeminiService from './gemini'
import OpenAIService from './openai'

export const AIProviderMapping: Record<string, AIProviderConstructor> = {
  openai: OpenAIService,
  gemini: GeminiService,
} as const
