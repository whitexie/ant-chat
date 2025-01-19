export interface StoreState {
  conversations: IConversation[]
  activeConversationId: string
}

export const initialState: StoreState = {
  conversations: [],
  activeConversationId: '',
}
