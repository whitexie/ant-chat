import { produce } from 'immer'
import { useGeneralSettingsStore } from './store'

export function setTopicModelId(id: string) {
  useGeneralSettingsStore.setState(produce((state) => {
    state.topicModelId = id
  }))
}
