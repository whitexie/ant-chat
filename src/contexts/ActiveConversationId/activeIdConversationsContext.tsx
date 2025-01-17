import { createContext, useContext } from 'react'

export const ActiveIdContext = createContext('')

export const ActiveIdDispatch = createContext<React.Dispatch<React.SetStateAction<string>> | null>(null)

export function useActiveConversationIdContext() {
  const activeId = useContext(ActiveIdContext)
  const setActiveId = useContext(ActiveIdDispatch)

  return [activeId, setActiveId] as const
}
