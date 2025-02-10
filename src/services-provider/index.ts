import GeminiService from './google'
import OpenAIService from './openai'

export const SERVICE_PROVIDER_MAPPING = {
  Gemini: GeminiService,
  OpenAI: OpenAIService,
  DeepSeek: OpenAIService,
}

type ProviderName = keyof typeof SERVICE_PROVIDER_MAPPING

export function getServiceProviderConstructor(provider: ProviderName) {
  if (provider in SERVICE_PROVIDER_MAPPING)
    return SERVICE_PROVIDER_MAPPING[provider as keyof typeof SERVICE_PROVIDER_MAPPING]

  throw new Error(`Provider ${provider} not found`)
}

export async function getProviderModels(provider: ProviderName, apiHost: string, apiKey: string) {
  const ServiceClass = getServiceProviderConstructor(provider)
  return new ServiceClass().getModels(apiHost, apiKey)
}
