import type { StoreState } from './initialState'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { initialState } from './initialState'

interface StoreActions {
  reset: () => void
}
export type ConversationsStore = StoreState & StoreActions

// 创建基础 store
export const useConversationsStore = create<ConversationsStore>()(
  devtools(
    set => ({
      ...initialState,
      reset: () => {
        set(initialState)
      },
    }),
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)
