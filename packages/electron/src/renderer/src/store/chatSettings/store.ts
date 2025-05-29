import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const initializeState = {
  model: null as AllAvailableModelsSchema['models'][number] | null,
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 4000,
}

export const useChatSttings = create<typeof initializeState>()(
  devtools(
    persist(
      () => ({ ...initializeState }),
      { name: 'chat-settings' },
    ),
    { enabled: import.meta.env.MODE === 'development' },
  ),
)
