import type { ProxySettings } from '@ant-chat/shared'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface GeneralSettingsState {
  // 助理模型ID，用于初始化对话标题
  assistantModelId: string
  // 代理设置
  proxySettings: ProxySettings
}

const initialState: GeneralSettingsState = {
  assistantModelId: '',
  proxySettings: {
    mode: 'none',
    customProxyUrl: '',
  },
}

export const useGeneralSettingsStore = create<GeneralSettingsState>()(
  devtools(
    persist(
      set => ({
        ...structuredClone(initialState),
        reset: () => {
          set(structuredClone(initialState))
        },
      }),
      {
        name: 'General-Settings',
        version: 0,
      },
    ),
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)
