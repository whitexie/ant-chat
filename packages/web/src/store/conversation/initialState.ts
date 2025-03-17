import type { IConversations, IMessage } from '@/db/interface'

export interface StoreState {
  conversations: IConversations[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
  abortCallbacks: (() => void)[]
  messages: IMessage[]
  pageIndex: number
  pageSize: number
  messageTotal: number
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
  abortCallbacks: [],
  messages: [],
  pageIndex: 0,
  pageSize: 5,
  messageTotal: -1,
}
