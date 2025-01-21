export interface StoreState {
  conversations: IConversation[]
  activeConversationId: string
  requestStatus: 'loading' | 'success' | 'error' | 'cancel'
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
  requestStatus: 'success',
}
