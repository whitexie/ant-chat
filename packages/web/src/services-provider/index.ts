import DeepSeekService from './deepseek'
import GoogleService from './google'
import OpenAIService from './openai'

export const SERVICE_PROVIDER_MAPPING = {
  Google: GoogleService,
  OpenAI: OpenAIService,
  DeepSeek: DeepSeekService,
}

type ProviderName = keyof typeof SERVICE_PROVIDER_MAPPING

export function getServiceProviderConstructor(provider: string) {
  if (provider in SERVICE_PROVIDER_MAPPING)
    return SERVICE_PROVIDER_MAPPING[provider as ProviderName]

  throw new Error(`Provider ${provider} not found`)
}

export function getProviderDefaultApiHost(provider: string) {
  if (provider in SERVICE_PROVIDER_MAPPING) {
    const ServiceClass = getServiceProviderConstructor(provider as ProviderName)
    return new ServiceClass().getApiHost()
  }

  throw new Error(`Provider ${provider} not found`)
}

export function validatorProvider(provider: string) {
  return provider in SERVICE_PROVIDER_MAPPING
}
