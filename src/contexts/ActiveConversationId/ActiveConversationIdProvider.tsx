import { useState } from 'react'
import { ActiveIdContext, ActiveIdDispatch } from './activeIdConversationsContext'

export function ActiveConversationIdProvider({ children }: { children: React.ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState('')

  return (
    <ActiveIdContext.Provider value={activeConversationId}>
      <ActiveIdDispatch.Provider value={setActiveConversationId}>
        {children}
      </ActiveIdDispatch.Provider>
    </ActiveIdContext.Provider>
  )
}
