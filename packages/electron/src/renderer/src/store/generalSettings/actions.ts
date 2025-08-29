import type { ProxySettings } from '@ant-chat/shared'
import { produce } from 'immer'
import { useGeneralSettingsStore } from './store'

export function setAssistantModelId(id: string) {
  useGeneralSettingsStore.setState(produce((state) => {
    state.assistantModelId = id
  }))
}

export function updateProxySettings(proxySettings: Partial<ProxySettings>) {
  useGeneralSettingsStore.setState(produce((state) => {
    Object.assign(state.proxySettings, proxySettings)
  }))
}
