import { db } from './db'
import { providerServiceModelsTable, providerServicesTable } from './schema'

const providerServiceData = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'gemini', name: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', apiMode: 'gemini' as const, isOfficial: true },
]

const providerServiceModelsData = [
  // ============================ OpenAI 内置模型 ============================
  { id: 'gpt-4o-audio-preview-2024-10-01', model: 'gpt-4o-audio-preview-2024-10-01', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gpt-4o-mini-audio-preview', model: 'gpt-4o-mini-audio-preview', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'o1-preview-2024-09-12', model: 'o1-preview-2024-09-12', modelFeatures: { functionCall: true, deepThinking: true, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },

  // ============================ DeepSeek 内置模型 ============================
  { id: 'deepseek-chat', model: 'deepseek-chat', modelFeatures: { functionCall: true, deepThinking: false, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'deepseek-reasoner', model: 'deepseek-reasoner', modelFeatures: { functionCall: false, deepThinking: true, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },

  // ============================ Gemini 内置模型 ============================
  { id: 'gemini-2.5-flash-preview-0417', model: 'Gemini 2.5 Flash Preview 0417', modelFeatures: { functionCall: true, deepThinking: true, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini-2.5-pro-preview-05-06', model: 'Gemini 2.5 Pro Preview 05-06', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini 2.5-pro-exp-03-25', model: 'Gemini 2.5 Pro Exp 03-25', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini-2.0-flash', model: 'Gemini 2.0 Flash', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini-2.0-flash-lite', model: 'Gemini 2.0 Flash-Lite', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini-1.5-flash', model: 'Gemini 1.5 Flash', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gemini-1.5-pro', model: 'Gemini 1.5 Pro', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },

]

export async function initializeData() {
  db.transaction((tx) => {
    providerServiceData.forEach((row) => {
      tx.insert(providerServicesTable).values(row).onConflictDoNothing({ target: providerServicesTable.id }).run()
    })

    providerServiceModelsData.forEach((row) => {
      tx.insert(providerServiceModelsTable).values(row).onConflictDoNothing({ target: [providerServiceModelsTable.model, providerServiceModelsTable.providerServiceId] }).run()
    })
  })
}
