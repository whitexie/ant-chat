import type { IConversations, IMessage } from '@/db/interface'
import type { RequireKey } from '@/types/global'
import type { StoreState } from './initialState'
import { DEFAULT_TITLE, Role } from '@/constants'
import { getNow, uuid } from '@/utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { initialState } from './initialState'

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
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)

export function createConversations(option?: Partial<IConversations>): IConversations {
  const time = getNow()
  return Object.assign({
    id: uuid(),
    title: DEFAULT_TITLE,
    createAt: time,
    updateAt: time,
  }, option)
}

export function createMessage(option?: RequireKey<Partial<IMessage>, 'convId'>): IMessage {
  return Object.assign({
    id: uuid(),
    role: Role.USER,
    content: '',
    reasoningContent: '',
    createAt: getNow(),
    status: 'success',
    convId: '',
    images: [],
    attachments: [],
  }, option)
}
