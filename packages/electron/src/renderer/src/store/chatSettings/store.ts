import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { create } from 'zustand'

const initializeState = {
  model: null as AllAvailableModelsSchema['models'][number] | null,
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 4000,
}

export const useChatSttings = create<typeof initializeState>()(() => ({
  ...initializeState,
}))
