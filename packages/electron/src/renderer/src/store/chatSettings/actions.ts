import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { produce } from 'immer'
import { useChatSttingsStore } from './store'

export function setModel(model: AllAvailableModelsSchema['models'][number]) {
  const { maxTokens, temperature } = useChatSttingsStore.getState()

  useChatSttingsStore.setState(state =>
    produce(state, (draft) => {
      draft.model = model
      draft.maxTokens = maxTokens < model.maxTokens ? maxTokens : model.maxTokens
      draft.temperature = temperature
    }),
  )
}

export function setSystemPrompt(systemPrompt: string) {
  useChatSttingsStore.setState(state =>
    produce(state, (draft) => {
      draft.systemPrompt = systemPrompt
    }),
  )
}

export function setTemperature(temperature: number) {
  useChatSttingsStore.setState(state =>
    produce(state, (draft) => {
      draft.temperature = temperature
    }),
  )
}

export function setMaxTokens(maxTokens: number): [boolean, string] {
  const modelMaxTokens = useChatSttingsStore.getState().model?.maxTokens

  if (typeof modelMaxTokens === 'number' && maxTokens > modelMaxTokens) {
    return [false, `maxTokens 超过模型最大值 ${modelMaxTokens}`]
  }

  useChatSttingsStore.setState(state =>
    produce(state, (draft) => {
      draft.maxTokens = maxTokens
    }),
  )

  return [true, '']
}
