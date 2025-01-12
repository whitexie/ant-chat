import { useContext } from 'react'
import { ConversationDispath, ConversationsContext } from './context'

export { ConversationsProvider } from './ConversationsProvider'

export function useConversationStore() {
  const conversations = useContext(ConversationsContext)
  const dispatch = useContext(ConversationDispath)

  return [conversations, dispatch] as const
}
