import type { ChatMessage, IConversation } from '@/types/conversation'
import { createSelectors } from '@/utils/createSelectors'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface StoreState {
  conversations: IConversation[]
  activeConversationId: string
  currentConversation: IConversation | undefined
}

interface StoreActions {
  setActiveConversationId: (id: string) => void
  addConversation: (conversation: IConversation) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  importConversations: (conversations: IConversation[]) => void
  clearConversations: () => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  updateMessage: (conversationId: string, messageId: string, content: API.MessageContent) => void
}

type ConversationsStore = StoreState & StoreActions

// 创建基础 store
const useConversationsStoreBase = create<ConversationsStore>()(
  immer((set, get) => ({
    conversations: [],
    activeConversationId: '',
    currentConversation: undefined,

    setActiveConversationId: (id) => {
      const conversation = get().conversations.find(conv => conv.id === id)
      if (!conversation)
        return

      set((state) => {
        state.activeConversationId = id
        state.currentConversation = conversation
      })
    },

    addConversation: (conversation) => {
      set((state) => {
        state.conversations.push(conversation)
        // 自动设置为当前会话
        state.activeConversationId = conversation.id
        state.currentConversation = conversation
      })
    },

    renameConversation: (id, title) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === id)
        if (!conversation)
          return

        conversation.title = title
        if (state.currentConversation?.id === id) {
          state.currentConversation.title = title
        }
      })
    },

    deleteConversation: (id) => {
      set((state) => {
        state.conversations = state.conversations.filter(conv => conv.id !== id)
        if (state.activeConversationId === id) {
          state.activeConversationId = state.conversations[0]?.id || ''
          state.currentConversation = state.conversations[0]
        }
      })
    },

    importConversations: (conversations: IConversation[]) => {
      set((state) => {
        state.conversations.push(...conversations)
      })
    },

    clearConversations: () => {
      set((state) => {
        state.conversations = []
        state.activeConversationId = ''
        state.currentConversation = undefined
      })
    },

    addMessage: (conversationId, message) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === conversationId)
        if (!conversation)
          return

        conversation.messages.push(message)
        if (state.currentConversation?.id === conversationId) {
          state.currentConversation = conversation
        }
      })
    },

    deleteMessage: (conversationId, messageId) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === conversationId)
        if (!conversation)
          return

        conversation.messages = conversation.messages.filter(msg => msg.id !== messageId)
        if (state.currentConversation?.id === conversationId) {
          state.currentConversation = conversation
        }
      })
    },

    updateMessage: (conversationId, messageId, content) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === conversationId)
        if (!conversation)
          return

        const message = conversation.messages.find(msg => msg.id === messageId)
        if (!message)
          return

        message.content = content
        if (state.currentConversation?.id === conversationId) {
          state.currentConversation = conversation
        }
      })
    },
  })),
)

// 导出带选择器的 store
export const useConversationsStore = createSelectors(useConversationsStoreBase)

// 导出常用选择器
export function useActiveConversation() {
  return useConversationsStore(state => state.currentConversation)
}

export function useConversations() {
  return useConversationsStore(state => state.conversations)
}
