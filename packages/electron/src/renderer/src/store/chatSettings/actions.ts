import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { produce } from 'immer'
import { useChatSttings } from './store'

export function setModel(model: AllAvailableModelsSchema['models'][number]) {
  const { maxTokens } = useChatSttings.getState()

  useChatSttings.setState(state =>
    produce(state, (draft) => {
      draft.model = model
      draft.maxTokens = maxTokens < model.maxTokens ? maxTokens : model.maxTokens
    }),
  )
}

export function setSystemPrompt(systemPrompt: string) {
  useChatSttings.setState(state =>
    produce(state, (draft) => {
      draft.systemPrompt = systemPrompt
    }),
  )
}

export function setTemperature(temperature: number) {
  useChatSttings.setState(state =>
    produce(state, (draft) => {
      draft.temperature = temperature
    }),
  )
}

export function setMaxTokens(maxTokens: number): [boolean, string] {
  const modelMaxTokens = useChatSttings.getState().model?.maxTokens

  if (typeof modelMaxTokens === 'number' && maxTokens > modelMaxTokens) {
    return [false, `maxTokens 超过模型最大值 ${modelMaxTokens}`]
  }

  useChatSttings.setState(state =>
    produce(state, (draft) => {
      draft.maxTokens = maxTokens
    }),
  )

  return [true, '']
}
