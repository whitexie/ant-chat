import type { ChatMessage } from '@/types/conversation'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useConversationsStore } from './conversationsStore'

interface MessagesStoreState {
  activeConversationId: string
}

interface MessagesStoreActions {
  setActiveConversationId: (id: string) => void
  addMessage: (message: ChatMessage) => void
  deleteMessage: (messageId: string) => void
  updateMessage: (messageId: string, content: API.MessageContent) => void
}

type MessagesStore = MessagesStoreState & MessagesStoreActions

const useMessagesStoreBase = create<MessagesStore>()(
  immer((set, get) => ({
    activeConversationId: '',

    setActiveConversationId: (id) => {
      set({ activeConversationId: id })
    },

    addMessage: (message) => {
      const { activeConversationId } = get()
      const conversation = useConversationsStore.getState().conversations.find(conv => conv.id === activeConversationId)
      if (!conversation)
        return

      // 直接在 conversationsStore 中添加消息
      useConversationsStore.getState().addMessage(activeConversationId, message)
    },

    deleteMessage: (messageId) => {
      const { activeConversationId } = get()
      const conversation = useConversationsStore.getState().conversations.find(conv => conv.id === activeConversationId)
      if (!conversation)
        return

      // 直接在 conversationsStore 中删除消息
      useConversationsStore.getState().deleteMessage(activeConversationId, messageId)
    },

    updateMessage: (messageId, content) => {
      const { activeConversationId } = get()
      const conversation = useConversationsStore.getState().conversations.find(conv => conv.id === activeConversationId)
      if (!conversation)
        return

      // 直接在 conversationsStore 中更新消息
      useConversationsStore.getState().updateMessage(activeConversationId, messageId, content)
    },
  })),
)

// 导出 store
export const useMessagesStore = useMessagesStoreBase

// 派生属性：获取当前活动会话的消息
export function useActiveMessages() {
  const activeConversationId = useMessagesStore(state => state.activeConversationId)
  const conversations = useConversationsStore(state => state.conversations)
  const conversation = conversations.find(conv => conv.id === activeConversationId)
  return conversation ? conversation.messages : []
}
