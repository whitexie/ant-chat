import type { IConversations, IMessage } from '@/db/interface'

export interface StoreState {
  conversations: IConversations[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
  messages: IMessage[]
  abortCallbacks: (() => void)[]
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
  messages: [],
  abortCallbacks: [],
}
