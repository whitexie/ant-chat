import type { ReactNode } from 'react'
import { useImmerReducer } from 'use-immer'
import { ConversationDispath, ConversationsContext } from './context'
import { conversationsReducer } from './reducer'

interface Props { children: ReactNode }

export function ConversationsProvider({ children }: Props) {
  const [conversations, dispatch] = useImmerReducer(conversationsReducer, [])

  return (
    <ConversationsContext.Provider value={conversations}>
      <ConversationDispath.Provider value={dispatch}>
        {children}
      </ConversationDispath.Provider>
    </ConversationsContext.Provider>
  )
}
