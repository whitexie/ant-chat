import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const initialState = {
  topicModelId: '',
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
