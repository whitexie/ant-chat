export interface SearchResult {
  type: 'message'
  id: string
  conversationId: string
  conversationTitle: string
  createdAt: number
  messages: {
    id: string
    content: string
    createdAt: number
  }[]
}
