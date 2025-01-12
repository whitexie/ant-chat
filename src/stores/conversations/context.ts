import type { Dispatch } from 'react'
import type { ConversationsReducerAction } from './reducer'
import { createContext } from 'react'

export const ConversationsContext = createContext<IConversation[]>([])
export const ConversationDispath = createContext<Dispatch<ConversationsReducerAction> | null>(null)
