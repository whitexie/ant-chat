export interface StoreState {
  conversations: IConversations[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
  messages: ChatMessage[]
  abortCallbacks: (() => void)[]
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
  messages: [],
  abortCallbacks: [],
}
