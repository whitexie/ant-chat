import { DEFAULT_TITLE, Role } from '@/constants'
import { addConversations, addMessage, db, deleteConversations, deleteMessage, fetchConversations, getMessagesByConvId, renameConversations, updateMessage } from '@/db'
import GeminiService from '@/services-provider/google'
import { getNow, uuid } from '@/utils'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useModelConfigStore } from '../modelConfig'
import { initialState, type StoreState } from './initialState'

interface StoreActions {
  setActiveConversationId: (id: string) => Promise<void>
  setRequestStatus: (status: StoreState['requestStatus']) => void
  addConversation: (conversation: IConversation) => Promise<void>
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  importConversations: (conversations: IConversation[]) => void
  clearConversations: () => Promise<void>
  addMessage: (message: ChatMessage) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  updateMessage: (message: ChatMessage) => void
  sendChatCompletions: (conversationId: string, model?: string) => Promise<void>
  onRequest: (conversationId: string, message: ChatMessage, model?: string) => Promise<void>
  refreshRequest: (conversationId: string, message: ChatMessage, model?: string) => Promise<void>
  initConversations: () => Promise<void>
  reset: () => Promise<void>
}

export type ConversationsStore = StoreState & StoreActions

// 创建基础 store
export const useConversationsStore = create<ConversationsStore>()(
  immer((set, get) => ({
    ...initialState,

    setActiveConversationId: async (id) => {
      const conversation = get().conversations.find(conv => conv.id === id)
      if (!conversation)
        throw new Error('Conversation not found')

      const _messages = await getMessagesByConvId(id)

      set((state) => {
        state.activeConversationId = id
        state.messages.splice(0, state.messages.length, ..._messages)
      })
    },

    setRequestStatus: (status) => {
      set((state) => {
        state.requestStatus = status
      })
    },

    addConversation: async (conversation) => {
      await addConversations(conversation)
      set((state) => {
        state.conversations.splice(0, 0, conversation)
        // 自动设置为当前会话
        state.activeConversationId = conversation.id
      })
    },

    renameConversation: async (id, title) => {
      await renameConversations(id, title)

      set((state) => {
        const conversation = getConversation(state.conversations, id)
        if (!conversation)
          return

        conversation.title = title
      })
    },

    deleteConversation: async (id) => {
      await deleteConversations(id)

      set((state) => {
        state.conversations = state.conversations.filter(conv => conv.id !== id)
        if (state.activeConversationId === id) {
          get().setActiveConversationId(state.conversations[0]?.id || '')
        }
      })
    },

    importConversations: (conversations: IConversation[]) => {
      set((state) => {
        const ids = state.conversations.map(item => item.id)

        conversations.forEach((item) => {
          if (ids.includes(item.id))
            return

          state.conversations.push(item)
        })
      })
    },

    clearConversations: async () => {
      await Promise.all([
        db.conversations.clear(),
        db.messages.clear(),
      ])
      set((state) => {
        state.conversations = []
        state.activeConversationId = ''
      })
    },

    addMessage: async (message) => {
      await addMessage(message)

      set((state) => {
        state.messages.push(message)
      })
    },

    deleteMessage: async (messageId) => {
      await deleteMessage(messageId)

      set((state) => {
        state.messages = state.messages.filter(msg => msg.id !== messageId)
      })
    },

    updateMessage: async (message) => {
      await updateMessage(message)

      set((state) => {
        const index = state.messages.findIndex(msg => msg.id === message.id)
        if (index === -1)
          throw new Error(`Message not found => ${message.id}`)

        state.messages[index] = message
      })
    },

    sendChatCompletions: async (conversationId, model) => {
      const messages = get().messages
      const aiMessage = createMessage({ convId: conversationId, role: Role.AI, content: '', status: 'loading' })
      try {
        get().setRequestStatus('loading')

        const { apiHost, apiKey } = useModelConfigStore.getState()
        const gemini = new GeminiService({ model, apiKey, apiHost })

        // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
        await get().addMessage({ ...aiMessage })

        await gemini.sendChatCompletions(messages, {
          onUpdate: (content) => {
            aiMessage.content = content
            get().updateMessage({ ...aiMessage, status: 'success' })
          },
          onSuccess: () => {
            get().setRequestStatus('success')
          },
        })
      }
      catch (e) {
        const error = e as Error
        console.log('chatCompletions fail', error)
        aiMessage.content = error.message
        aiMessage.status = 'error'
        get().updateMessage(aiMessage)
        get().setRequestStatus('error')
        return
      }

      get().setRequestStatus('success')
    },

    onRequest: async (conversationId, message, model) => {
      await get().addMessage(message)
      await get().sendChatCompletions(conversationId, model)
    },

    refreshRequest: async (conversationId, message, model) => {
      await get().deleteMessage(message.id)

      await (get().sendChatCompletions(conversationId, model))
    },

    reset: async () => {
      await db.conversations.clear()
      await db.messages.clear()
      set(initialState)
    },

    initConversations: async () => {
      const conversations = await fetchConversations(1, 100)
      get().importConversations(conversations)
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
    // messages: [],
    createAt: getNow(),
  }, option)
}

export function createMessage(option?: RequireKey<Partial<ChatMessage>, 'convId'>) {
  return Object.assign({
    id: uuid(),
    role: Role.USER,
    content: '',
    createAt: getNow(),
    status: 'success',
    convId: '',
  }, option)
}
