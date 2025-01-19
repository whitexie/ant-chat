import { chatCompletions } from '@/api'
import { DEFAULT_TITLE, Role } from '@/constants'
import { getNow, Stream, uuid } from '@/utils'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { initialState, type StoreState } from './initialState'

interface StoreActions {
  setActiveConversationId: (id: string) => void
  addConversation: (conversation: IConversation) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  importConversations: (conversations: IConversation[]) => void
  clearConversations: () => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  updateMessage: (conversationId: string, id: string, message: ChatMessage) => void
  onRequest: (conversationId: string, message: ChatMessage, model?: string) => Promise<void>
}

export type ConversationsStore = StoreState & StoreActions

// 创建基础 store
export const useConversationsStore = create<ConversationsStore>()(
  immer((set, get) => ({
    ...initialState,

    setActiveConversationId: (id) => {
      const conversation = get().conversations.find(conv => conv.id === id)
      if (!conversation)
        throw new Error('Conversation not found')

      set((state) => {
        state.activeConversationId = id
      })
    },

    addConversation: (conversation) => {
      set((state) => {
        state.conversations.push(conversation)
        // 自动设置为当前会话
        state.activeConversationId = conversation.id
      })
    },

    renameConversation: (id, title) => {
      set((state) => {
        const conversation = getConversation(state.conversations, id)
        if (!conversation)
          return

        conversation.title = title
      })
    },

    deleteConversation: (id) => {
      set((state) => {
        state.conversations = state.conversations.filter(conv => conv.id !== id)
        if (state.activeConversationId === id) {
          state.activeConversationId = state.conversations[0]?.id || ''
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
      })
    },

    addMessage: (conversationId, message) => {
      set((state) => {
        const conversation = getConversation(state.conversations, conversationId)
        conversation.messages.push(message)
      })
    },

    deleteMessage: (conversationId, messageId) => {
      set((state) => {
        const conversation = getConversation(state.conversations, conversationId)
        conversation.messages = conversation.messages.filter(msg => msg.id !== messageId)
      })
    },

    updateMessage: (conversationId, id, message) => {
      set((state) => {
        const conversation = getConversation(state.conversations, conversationId)
        const index = conversation.messages.findIndex(msg => msg.id === id)
        if (index === -1)
          throw new Error(`Message not found => ${message.id}`)

        conversation.messages[index] = message
      })
    },

    onRequest: async (conversationId, message, model) => {
      set(async (state) => {
        const conversation = getConversation(state.conversations, conversationId)
        const messages = conversation.messages
        get().addMessage(conversationId, message)
        // debugger
        const { response } = await chatCompletions([...messages, message], model || '')
        const readableStream = response.body!
        let content = ''
        const id = `AI-${uuid()}`
        const createAt = getNow()

        get().addMessage(conversationId, { id, role: Role.AI, content, createAt })

        for await (const chunk of Stream({ readableStream })) {
          if (!chunk.data)
            continue

          try {
            const json = JSON.parse(chunk.data)
            if (json.choices[0].delta.content) {
              content += json.choices[0].delta.content
              get().updateMessage(conversationId, id, { id, role: Role.AI, content, createAt })
            }
          }
          catch {
            if (!chunk.data.includes('[DONE]')) {
              console.error('parse fail line => ', JSON.stringify(chunk))
            }
          }
        }
      })
    },
  })),
)

function getConversation(conversations: IConversation[], id: string) {
  const conversation = conversations.find(conv => conv.id === id)
  if (!conversation) {
    throw new Error('Conversation not found')
  }
  return conversation
}

export function createConversation(option?: Partial<IConversation>) {
  return Object.assign({
    id: uuid(),
    title: DEFAULT_TITLE,
    messages: [],
    createAt: getNow(),
  }, option)
}
