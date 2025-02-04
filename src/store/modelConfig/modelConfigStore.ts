import { DEFAULT_SYSTEM_MESSAGE } from '@/constants'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import storage from './storage'

interface Action {
  reset: () => void
}

export function createModelConfig(options: Partial<ModelConfig>) {
  return {
    name: '',
    apiHost: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    systemMessage: DEFAULT_SYSTEM_MESSAGE,
    ...options,
  }
}

const initialState: ModelConfigV2 = {
  active: 'Gemini',
  configMapping: {
    Gemini: createModelConfig({ name: 'Gemini', apiHost: 'https://generativelanguage.googleapis.com/v1beta' }),
    DeepSeek: createModelConfig({ name: 'DeepSeek', apiHost: 'https://api.deepseek.com' }),
    openAI: createModelConfig({ name: 'openAI', apiHost: 'https://api.openai.com' }),
  },
}

export type ModelConfigStore = ModelConfigV2 & Action

export const useModelConfigStore = create<ModelConfigStore>()(
  devtools(
    persist(
      set => ({
        ...structuredClone(initialState),
        reset: () => {
          set(structuredClone(initialState))
        },
      }),
      {
        name: 'model-config',
        storage: createJSONStorage(() => storage),
        version: 1,
        migrate: (state, version) => {
          if (version === 0) {
            const newState = structuredClone(initialState)
            Object.assign(newState.configMapping.Gemini, state as ModelConfig)

            return newState
          }

          return state
        },
      },
    ),
  ),
)

export function setConfigAction(config: ModelConfig) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    if (draft.configMapping[draft.active]) {
      draft.configMapping[draft.active] = config
    }
  }))
}

export function setModelAction(model: string) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    draft.configMapping[draft.active].model = model
  }))
}

export function setActiveAction(active: ModelConfigMappingKey) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    if (!draft.configMapping[active]) {
      throw new Error(`Model config ${active} not found`)
    }
    draft.active = active
  }))
}

export function useActiveModelConfig() {
  return useModelConfigStore(state => state.configMapping[state.active])
}

export function getActiveModelConfig() {
  const { configMapping, active } = useModelConfigStore.getState()
  return configMapping[active]
}
