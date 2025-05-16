import type { ModelConfig, ModelConfigId } from '@ant-chat/shared'
import { DEFAULT_SYSTEM_MESSAGE } from '@/constants'
import { validatorProvider } from '@/services-provider'
import { uuid } from '@/utils'
import { produce } from 'immer'
import { pick } from 'lodash-es'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import storage from './storage'

interface Action {
  reset: () => void
}

export function createModelConfig(options?: Partial<ModelConfig>): ModelConfig {
  return {
    id: uuid(),
    name: '',
    apiHost: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    ...options,
  }
}

interface ModelConfigInitialState {
  active: ModelConfigId
  configMapping: Record<string, ModelConfig>
  systemMessage: string
  openSettingsModal: boolean
}

const initialState: ModelConfigInitialState = {
  active: 'Google' as ModelConfigId,
  openSettingsModal: false,
  configMapping: {
    Google: {
      id: 'Google',
      name: 'Google',
      apiHost: '',
      apiKey: '',
      model: '',
      temperature: 0.7,
    },
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
        version: 3,
        migrate: (state, version) => {
          if (version === 0) {
            const newState = structuredClone(initialState)
            Object.assign(newState.configMapping.Google, state as ModelConfig)

            return newState
          }
          else if (version === 1 || version === 2) {
            const newState = structuredClone(state as ModelConfigInitialState)
            if (newState.active === 'Gemini') {
              newState.active = 'Google'
            }
            if (newState.configMapping.Gemini) {
              newState.configMapping.Google = newState.configMapping.Gemini
              delete newState.configMapping.Gemini
            }

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

export function setConfigAction(id: string, config: ModelConfig & { systemMessage?: string }) {
  useModelConfigStore.setState(state => produce(state, (draft) => {
    if (!validatorProvider(id)) {
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
    const temp = draft.configMapping[draft.active]
    if (temp) {
      temp.model = model
    }
  }))
}

export function setActiveAction(active: string) {
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
