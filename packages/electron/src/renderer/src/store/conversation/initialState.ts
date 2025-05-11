import type { IConversations } from '@/db/interface'

export interface StoreState {
  conversations: IConversations[]
  abortCallbacks: (() => void)[]
  pageIndex: number
  pageSize: number
  conversationsTotal: number
}

export const initialState: StoreState = {
  conversations: [],
  abortCallbacks: [],
  pageIndex: 0,
  pageSize: 20,
  conversationsTotal: 1,
}
