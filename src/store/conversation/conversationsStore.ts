import { DEFAULT_TITLE, Role } from '@/constants'
import { getNow, uuid } from '@/utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { initialState, type StoreState } from './initialState'

interface StoreActions {
  reset: () => void
}
export type ConversationsStore = StoreState & StoreActions

// 创建基础 store
export const useConversationsStore = create<ConversationsStore>()(
  devtools(
    set => ({
      ...initialState,
      reset: () => {
        set(initialState)
      },
    }),
    {
      enabled: true,
    },
  ),
)

export function createConversation(option?: Partial<IConversations>) {
  return Object.assign({
    id: uuid(),
    title: DEFAULT_TITLE,
    createAt: getNow(),
  }, option)
}

export function createMessage(option?: RequireKey<Partial<ChatMessage>, 'convId'>): ChatMessage {
  return Object.assign({
    id: uuid(),
    role: Role.USER,
    content: '',
    createAt: getNow(),
    status: 'success',
    convId: '',
  }, option)
}
