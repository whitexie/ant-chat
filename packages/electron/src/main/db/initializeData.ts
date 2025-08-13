import { db } from './db'
import { serviceProviderModelsTable, serviceProviderTable } from './schema'

const providerServiceData = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'gemini', name: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', apiMode: 'gemini' as const, isOfficial: true },
]

const providerServiceModelsData = [
  // ============================ Gemini 内置模型 ============================
  { id: 'models/gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash Preview', model: 'models/gemini-2.5-flash-preview-04-17', isBuiltin: false, isEnabled: true, maxTokens: 65536, temperature: 0.7, contextLength: 1048576, modelFeatures: { vision: true, functionCall: true, reasoning: true }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro Preview 05-06', model: 'gemini-2.5-pro-preview-05-06', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 2048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp 03-25', model: 'gemini-2.5-pro-exp-03-25', isBuiltin: false, isEnabled: true, maxTokens: 65536, temperature: 0.7, contextLength: 2048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini 2.0 Flash Exp Image Generation', model: 'gemini-2.0-flash-exp-image-generation', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 1048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp 02-05', model: 'gemini-2.0-pro-exp-02-05', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 2048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', model: 'gemini-2.0-flash', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 1048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', model: 'gemini-1.5-flash', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 1048576, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', model: 'gemini-1.5-pro', isBuiltin: false, isEnabled: true, maxTokens: 8192, temperature: 0.7, contextLength: 2097152, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'gemini', serviceProviderId: 'gemini' },

  // ============================ openai 内置模型 ============================
  { id: 'o4-mini-high', name: 'OpenAI o4 Mini High', model: 'o4-mini-high', isBuiltin: true, isEnabled: true, maxTokens: 100000, temperature: 0.7, contextLength: 100000, modelFeatures: { vision: false, functionCall: true, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o3', name: 'OpenAI o3', model: 'o3', isBuiltin: true, isEnabled: true, maxTokens: 100000, temperature: 0.7, contextLength: 100000, modelFeatures: { vision: false, functionCall: true, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o4-mini', name: 'OpenAI o4 Mini', model: 'o4-mini', isBuiltin: true, isEnabled: true, maxTokens: 100000, temperature: 0.7, contextLength: 100000, modelFeatures: { vision: false, functionCall: true, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1-Nano', model: 'gpt-4.1-nano', isBuiltin: true, isEnabled: true, maxTokens: 32000, temperature: 0.7, contextLength: 1000000, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1-Mini', model: 'gpt-4.1-mini', isBuiltin: true, isEnabled: true, maxTokens: 32000, temperature: 0.7, contextLength: 1000000, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4.1', name: 'GPT-4.1', model: 'gpt-4.1', isBuiltin: true, isEnabled: true, maxTokens: 32000, temperature: 0.7, contextLength: 1000000, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', model: 'gpt-4o', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', model: 'gpt-4-turbo', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4-32k', name: 'GPT-4 32K', model: 'gpt-4-32k', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 32768, modelFeatures: { vision: false, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-4', name: 'GPT-4', model: 'gpt-4', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 8192, modelFeatures: { vision: false, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', model: 'gpt-3.5-turbo-16k', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 16384, modelFeatures: { vision: false, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', model: 'gpt-3.5-turbo', isBuiltin: true, isEnabled: true, maxTokens: 4096, temperature: 0.7, contextLength: 4096, modelFeatures: { vision: false, functionCall: true, reasoning: false }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o1-preview', name: 'OpenAI o1 Preview', model: 'o1-preview', isBuiltin: true, isEnabled: true, maxTokens: 32768, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: false, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o1-mini', name: 'OpenAI o1 Mini', model: 'o1-mini', isBuiltin: true, isEnabled: true, maxTokens: 65536, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: false, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o1-mini', name: 'OpenAI o1 Mini', model: 'o1-mini', isBuiltin: true, isEnabled: true, maxTokens: 65536, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: false, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },
  { id: 'o1', name: 'OpenAI o1', model: 'o1', isBuiltin: true, isEnabled: true, maxTokens: 32768, temperature: 0.7, contextLength: 128000, modelFeatures: { vision: true, functionCall: false, reasoning: true }, apiMode: 'openai', serviceProviderId: 'openai' },

  // ============================ DeepSeek 内置模型 ============================
  { id: 'deepseek-chat', name: 'deepseek-chat', model: 'deepseek-chat', isBuiltin: true, isEnabled: true, maxTokens: 8000, temperature: 0.7, contextLength: 64000, modelFeatures: { functionCall: true, reasoning: false, vision: false }, apiMode: 'openai', serviceProviderId: 'deepseek' },
  { id: 'deepseek-reasoner', name: 'deepseek-reasoner', model: 'deepseek-reasoner', isBuiltin: true, isEnabled: true, maxTokens: 8000, temperature: 0.7, contextLength: 64000, modelFeatures: { functionCall: false, reasoning: true, vision: false }, apiMode: 'openai', serviceProviderId: 'deepseek' },
]

export async function initializeData() {
  db.transaction((tx) => {
    providerServiceData.forEach((row) => {
      tx.insert(serviceProviderTable).values(row).onConflictDoNothing({ target: serviceProviderTable.id }).run()
    })

    providerServiceModelsData.forEach((row) => {
      tx.insert(serviceProviderModelsTable)
        .values({ ...row })
        .onConflictDoUpdate({
          target: [serviceProviderModelsTable.model, serviceProviderModelsTable.serviceProviderId],
          set: {
            id: row.id,
            name: row.name,
            modelFeatures: row.modelFeatures,
            isBuiltin: row.isBuiltin,
            isEnabled: row.isEnabled,
            maxTokens: row.maxTokens,
            temperature: row.temperature,
            contextLength: row.contextLength,
            serviceProviderId: row.serviceProviderId,
          },
        })
        .run()
    })
  })
}
