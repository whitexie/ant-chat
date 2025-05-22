import { db } from './db'
import { providerServiceModelsTable, providerServicesTable } from './schema'

const providerServiceData = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', apiMode: 'openai' as const, isOfficial: true },
  { id: 'gemini', name: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', apiMode: 'gemini' as const, isOfficial: true },
]

const providerServiceModelsData = [
  // ============================ OpenAI 内置模型 ============================
  { id: 'gpt-4o-audio-preview-2024-10-01', name: 'gpt-4o-audio-preview-2024-10-01', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'gpt-4o-mini-audio-preview', name: 'gpt-4o-mini-audio-preview', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },
  { id: 'o1-preview-2024-09-12', name: 'o1-preview-2024-09-12', modelFeatures: { functionCall: true, deepThinking: true, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'openai' },

  // ============================ DeepSeek 内置模型 ============================
  { id: 'deepseek-chat', name: 'deepseek-chat', modelFeatures: { functionCall: true, deepThinking: false, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'deepseek' },
  { id: 'deepseek-reasoner', name: 'deepseek-reasoner', modelFeatures: { functionCall: false, deepThinking: true, vision: false }, isBuiltin: true, isEnabled: true, providerServiceId: 'deepseek' },

  // ============================ Gemini 内置模型 ============================
  { id: 'gemini-2.5-flash-preview-0417', name: 'Gemini 2.5 Flash Preview 0417', modelFeatures: { functionCall: true, deepThinking: true, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro Preview 05-06', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini 2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp 03-25', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', modelFeatures: { functionCall: true, deepThinking: false, vision: true }, isBuiltin: true, isEnabled: true, providerServiceId: 'gemini' },

]

export async function initializeData() {
  db.transaction((tx) => {
    providerServiceData.forEach((row) => {
      tx.insert(providerServicesTable).values(row).onConflictDoNothing({ target: providerServicesTable.id }).run()
    })

    providerServiceModelsData.forEach((row) => {
      tx.insert(providerServiceModelsTable)
        .values({ ...row, model: row.id })
        .onConflictDoUpdate({
          target: [providerServiceModelsTable.model, providerServiceModelsTable.providerServiceId],
          set: {
            id: row.id,
            name: row.name,
            modelFeatures: row.modelFeatures,
            isBuiltin: row.isBuiltin,
            providerServiceId: row.providerServiceId,
          },
        })
        .run()
    })
  })
}
