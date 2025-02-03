import type BaseService from './base'
import type { ServiceConstructorOptions } from './interface'
import GeminiService from './google'
import OpenAIService from './openai'

export const SERVICE_PROVIDER_MAPPING: Record<
  ModelConfigMappingKey,
  new (options?: Partial<ServiceConstructorOptions>) => BaseService
> = {
  Gemini: GeminiService,
  openAI: OpenAIService,
  DeepSeek: OpenAIService,
}

export function getServiceProviderConstructor(provider: ModelConfigMappingKey) {
  if (provider in SERVICE_PROVIDER_MAPPING)
    return SERVICE_PROVIDER_MAPPING[provider as keyof typeof SERVICE_PROVIDER_MAPPING]

  throw new Error(`Provider ${provider} not found`)
}

export async function getProviderModels(provider: ModelConfigMappingKey, apiHost: string, apiKey: string) {
  const ServiceClass = getServiceProviderConstructor(provider)
  return new ServiceClass().getModels(apiHost, apiKey)
}
