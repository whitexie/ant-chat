import { produce } from 'immer'
import { useGeneralSettingsStore } from './store'

export function setAssistantModelId(id: string) {
  useGeneralSettingsStore.setState(produce((state) => {
    state.assistantModelId = id
  }))
}
