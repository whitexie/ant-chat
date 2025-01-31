import { DEFAULT_SYSTEM_MESSAGE } from '@/constants'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Action {
  setConfig: (config: ModelConfig) => void
  setModel: (model: string) => void
  reset: () => void
}

const initialState: ModelConfig = {
  model: '',
  apiHost: '',
  apiKey: '',
  temperature: 0.7,
  systemMessage: DEFAULT_SYSTEM_MESSAGE,
}

export type ModelConfigStore = ModelConfig & Action

export const useModelConfigStore = create<ModelConfigStore>()(
  persist(immer(set => ({
    ...initialState,
    setConfig: (config) => {
      set(config)
    },
    setModel: (model) => {
      set((state) => {
        state.model = model
      })
    },
    reset: () => {
      set(initialState)
    },
  })), {
    name: 'model-config',
    storage: createJSONStorage(() => localStorage),
  }),
)
