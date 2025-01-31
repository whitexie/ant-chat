export interface StoreState {
  conversations: IConversation[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
  messages: ChatMessage[]
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
  messages: [],
}
