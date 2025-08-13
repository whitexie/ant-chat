import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const initialState = {
  // 助理模型ID，用于初始化对话标题
  assistantModelId: '',
}

export const useGeneralSettingsStore = create<typeof initialState>()(
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
