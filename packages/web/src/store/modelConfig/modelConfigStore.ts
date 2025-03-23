import type { ModelConfig, ModelConfigId } from '@/db/interface'
import { DEFAULT_SYSTEM_MESSAGE } from '@/constants'
import { uuid } from '@/utils'
import { produce } from 'immer'
import { pick } from 'lodash-es'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import storage from './storage'

interface Action {
  reset: () => void
}

export function createModelConfig(options: Partial<ModelConfig>): ModelConfig {
  return {
    id: uuid() as ModelConfigId,
    name: '',
    apiHost: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    ...options,
  }
}

interface ConfigMapping {
  Gemini: ModelConfig
  DeepSeek: ModelConfig
  OpenAI: ModelConfig
}

type ModelConfigMappingKey = keyof ConfigMapping

interface ModelConfigInitialState {
  active: ModelConfigId
  configMapping: ConfigMapping
  systemMessage: string
  openSettingsModal: boolean
}

const initialState: ModelConfigInitialState = {
  active: 'Gemini' as ModelConfigId,
  openSettingsModal: false,
  configMapping: {
    Gemini: createModelConfig({ id: 'Gemini' as ModelConfigId, name: 'Gemini', apiHost: 'https://generativelanguage.googleapis.com/v1beta' }),
    DeepSeek: createModelConfig({ id: 'DeepSeek' as ModelConfigId, name: 'DeepSeek', apiHost: 'https://api.deepseek.com' }),
    OpenAI: createModelConfig({ id: 'OpenAI' as ModelConfigId, name: 'OpenAI', apiHost: 'https://api.openai.com' }),
  },
  systemMessage: DEFAULT_SYSTEM_MESSAGE,
}

const MODEL_CONFIG_WHITE_KEYS = Object.keys(createModelConfig({})) as (keyof ModelConfig)[]

export type ModelConfigStore = ModelConfigInitialState & Action

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
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)

export function setConfigAction(id: ModelConfigId, config: ModelConfig & { systemMessage?: string }) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    if (!draft.configMapping[id]) {
      throw new Error(`id not found. ${id}`)
    }

    if (config.systemMessage) {
      draft.systemMessage = config.systemMessage
    }

    draft.configMapping[id] = pick(config, MODEL_CONFIG_WHITE_KEYS)
  }))
}

export function setSystemPromptAction(prompt: string) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    draft.systemMessage = prompt
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
    draft.active = active as ModelConfigId
  }))
}

export function useActiveModelConfig() {
  return useModelConfigStore(state => state.configMapping[state.active])
}

export function getActiveModelConfig() {
  const { configMapping, active, systemMessage } = useModelConfigStore.getState()
  return {
    modelConfig: configMapping[active],
    active,
    systemMessage,
  }
}

export function checkModelConfig() {
  const { configMapping, active } = useModelConfigStore.getState()
  const modelConfig = configMapping[active]
  if (!modelConfig) {
    return { ok: false, errMsg: `${active} 配置不存在` }
  }

  if (!modelConfig.apiKey) {
    return { ok: false, errMsg: `${active} apiKey 为空` }
  }

  return { ok: true }
}

export function setOpenSettingsModalAction(open: boolean) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    draft.openSettingsModal = open
  }))
}
