import type { StoreState } from './initialState'
import { Role, TITLE_PROMPT } from '@/constants'
import {
  addConversations,
  addMessage,
  conversationsExists,
  db,
  deleteConversations,
  deleteMessage,
  fetchConversations,
  getMessagesByConvId,
  renameConversations,
  updateMessage,
} from '@/db'
import { getServiceProviderConstructor } from '@/services-provider'
import { produce } from 'immer'
import { getActiveModelConfig, useModelConfigStore } from '../modelConfig'
import { createMessage, useConversationsStore } from './conversationsStore'

export async function setActiveConversationsId(id: string) {
  const messages = await getMessagesByConvId(id)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.activeConversationId = id
    draft.messages.splice(0, draft.messages.length, ...messages)
  }))
}

export function setRequestStatus(status: StoreState['requestStatus']) {
  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.requestStatus = status
  }))
}

export async function addConversationsAction(conversation: IConversation) {
  await addConversations(conversation)
  const content = getActiveModelConfig().systemMessage
  await addMessage(createMessage({ convId: conversation.id, role: Role.SYSTEM, content }))

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.splice(0, 0, conversation)
  }))
}

export async function renameConversationsAction(id: string, title: string) {
  await renameConversations(id, title)

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.title = title
    }
  }))
}

export async function deleteConversationsAction(id: string) {
  await deleteConversations(id)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = draft.conversations.filter(c => c.id !== id)
  }))
}

export async function importConversationsAction(conversations: IConversation[]) {
  const list = await Promise.all(conversations.filter(async (item) => {
    return await conversationsExists(item.id)
  }))

  await Promise.all(list.map(async item => await addConversationsAction(item)))
}

export async function clearConversationsAction() {
  await Promise.all([
    db.conversations.clear(),
    db.messages.clear(),
  ])

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = []
    draft.activeConversationId = ''
  }))
}

export async function initConversationsListAction() {
  useConversationsStore.getState().reset()
  const conversations = await fetchConversations(1, 100)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = conversations
  }))
}

export async function initCoversationsTitle() {
  const { messages } = useConversationsStore.getState()
  const { active } = useModelConfigStore.getState()
  const config = getActiveModelConfig()

  const userMessage = messages.find(item => item.role === Role.USER)

  if (!userMessage) {
    console.error('current conversation not found user message')
    return
  }

  const text = messages.map((item) => {
    const { content } = item

    if (typeof content === 'string') {
      return content
    }
    return content.filter(item => item.type === 'text')
      .map(item => item.text)
      .filter(Boolean)
      .join('\n')
  }).join('\n————————————————————\n')

  const content = TITLE_PROMPT.replace('pGqat5J/L@~U', text)
  const Service = getServiceProviderConstructor(active)
  const service = new Service(config)

  service.sendChatCompletions(
    [
      { ...userMessage, content },
    ],
    {
      onSuccess: (title) => {
        renameConversationsAction(messages[0].convId, title)
      },
    },
  )
}

/* ============================== messages ============================== */

export async function addMessageAction(message: ChatMessage) {
  await addMessage(message)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.messages.push(message)
  }))
}

export async function deleteMessageAction(messageId: string) {
  await deleteMessage(messageId)

  useConversationsStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      draft.messages.splice(index, 1)
    }
  }))
}

export async function updateMessageAction(message: ChatMessage) {
  await updateMessage(message)

  useConversationsStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === message.id)
    if (index === -1)
      throw new Error(`Message not found => ${message.id}`)

    draft.messages[index] = message
  }))
}

export function addAbortCallback(callback: () => void) {
  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.abortCallbacks.push(callback)
  }))
}

export function resetAbortCallbacks() {
  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.abortCallbacks = []
  }))
}

export function executeAbortCallbacks() {
  useConversationsStore.getState().abortCallbacks.forEach((callback) => {
    if (typeof callback === 'function') {
      try {
        callback()
      }
      catch (e) {
        console.log('execute abort callback fail => ', e)
      }
    }
    else {
      console.log('callback is not function', callback)
    }
  })

  resetAbortCallbacks()
}

export async function sendChatCompletions(conversationId: string, model: string) {
  const messages = useConversationsStore.getState().messages
  const aiMessage = createMessage({ convId: conversationId, role: Role.AI, status: 'loading' })
  try {
    setRequestStatus('loading')

    const { active } = useModelConfigStore.getState()
    const { apiHost, apiKey } = getActiveModelConfig()
    const Service = getServiceProviderConstructor(active)
    const instance = new Service({ model, apiKey, apiHost })

    // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
    await addMessageAction({ ...aiMessage })

    await instance.sendChatCompletions(
      messages,
      {
        onUpdate: (content) => {
          aiMessage.content = content
          updateMessageAction({ ...aiMessage, status: 'success' })
        },
        onSuccess: () => {
          setRequestStatus('success')
          resetAbortCallbacks()
        },
        onError: (error) => {
          throw error
        },
      },
      addAbortCallback,
    )
  }
  catch (e) {
    const error = e as Error
    aiMessage.content = error.message
    aiMessage.status = 'error'
    updateMessageAction(aiMessage)
    setRequestStatus('error')
  }
}

export async function onRequestAction(conversationId: string, message: ChatMessage, model: string) {
  await addMessageAction(message)
  await sendChatCompletions(conversationId, model)
}

export async function refreshRequestAction(conversationId: string, message: ChatMessage, model: string) {
  await deleteMessageAction(message.id)
  await sendChatCompletions(conversationId, model)
}
