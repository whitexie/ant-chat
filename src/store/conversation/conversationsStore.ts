import { chatCompletions } from '@/api'
import { DEFAULT_TITLE, Role } from '@/constants'
import { getNow, parseSse, uuid } from '@/utils'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { initialState, type StoreState } from './initialState'

interface StoreActions {
  setActiveConversationId: (id: string) => void
  setRequestStatus: (status: StoreState['requestStatus']) => void
  addConversation: (conversation: IConversation) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  importConversations: (conversations: IConversation[]) => void
  clearConversations: () => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  updateMessage: (conversationId: string, id: string, message: ChatMessage) => void
  sendChatCompletions: (conversationId: string, model?: string) => Promise<void>
  onRequest: (conversationId: string, message: ChatMessage, model?: string) => Promise<void>
  refreshRequest: (conversationId: string, message: ChatMessage, model?: string) => Promise<void>
  reset: () => void
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

    setRequestStatus: (status) => {
      set((state) => {
        state.requestStatus = status
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

    sendChatCompletions: async (conversationId, model) => {
      const messages = get().conversations.find(conv => conv.id === conversationId)?.messages || null
      if (!messages) {
        throw new Error('Conversation not found')
      }
      let response: Response | null = null
      try {
        get().setRequestStatus('loading')
        response = (await chatCompletions(messages, model || '')).response
      }
      catch (e) {
        const error = e as Error
        console.log('chatCompletions fail', error)
        get().addMessage(conversationId, createMessage({ role: Role.AI, content: error.message, status: 'error' }))
        get().setRequestStatus('error')
        return
      }

      const readableStream = response.body!
      const aiMessage = createMessage({ role: Role.AI, content: '' })

      // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
      get().addMessage(conversationId, { ...aiMessage })

      await parseSse(readableStream, {
        onUpdate: (content) => {
          aiMessage.content = content
          get().updateMessage(conversationId, aiMessage.id, { ...aiMessage })
        },
      })

      get().setRequestStatus('success')
    },

    onRequest: async (conversationId, message, model) => {
      const messages = get().conversations.find(conv => conv.id === conversationId)?.messages || null
      if (!messages) {
        throw new Error('Conversation not found')
      }
      get().addMessage(conversationId, message)
      await get().sendChatCompletions(conversationId, model)
    },

    refreshRequest: async (conversationId, message, model) => {
      get().deleteMessage(conversationId, message.id)

      await (get().sendChatCompletions(conversationId, model))
    },
    reset: () => {
      set(initialState)
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

export function createMessage(option?: Partial<ChatMessage>) {
  return Object.assign({
    id: uuid(),
    role: Role.USER,
    content: '',
    createAt: getNow(),
    status: 'success',
  }, option)
}
