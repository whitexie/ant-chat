import type { ConversationsId, IMessage } from '@/db/interface'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface InitialState {
  requestStatus: RequestStatus
  activeConversationsId: ConversationsId
  messages: IMessage[]
  pageIndex: number
  pageSize: number
  messageTotal: number
  abortFunction: (() => void) | null
}

export type RequestStatus = 'loading' | 'success' | 'error' | 'cancel'

const initialState: InitialState = {
  requestStatus: 'success',
  activeConversationsId: '' as ConversationsId,
  abortFunction: null,
  messages: [],
  pageIndex: 0,
  pageSize: 6,
  messageTotal: 1,
}

type MessagesStore = InitialState & {
  reset: () => void
}

export const useMessagesStore = create<MessagesStore>()(
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
