import type { IConversations } from '@/db/interface'

export interface StoreState {
  conversations: IConversations[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
  abortCallbacks: (() => void)[]
  pageIndex: number
  pageSize: number
  conversationsTotal: number
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
  abortCallbacks: [],
  pageIndex: 0,
  pageSize: 5,
  conversationsTotal: -1,
}
