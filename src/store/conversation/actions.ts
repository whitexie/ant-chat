import type { ConversationsId, IConversations, IConversationsSettings, IMessage, MessageId, ModelConfig } from '@/db/interface'
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
  updateConversationsSettings,
  updateMessage,
} from '@/db'
import { getServiceProviderConstructor } from '@/services-provider'
import { produce } from 'immer'
import { getActiveModelConfig, useModelConfigStore } from '../modelConfig'
import { createMessage, useConversationsStore } from './conversationsStore'

export async function setActiveConversationsId(id: ConversationsId | '') {
  const messages = id ? await getMessagesByConvId(id) : []

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

export async function addConversationsAction(conversation: IConversations) {
  await addConversations(conversation)
  const { systemMessage } = getActiveModelConfig()
  await addMessage(createMessage({ convId: conversation.id, role: Role.SYSTEM, content: systemMessage }))

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.splice(0, 0, conversation)
  }))
}

export async function renameConversationsAction(id: ConversationsId, title: string) {
  await renameConversations(id, title)

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.title = title
    }
  }))
}

export async function deleteConversationsAction(id: ConversationsId) {
  await deleteConversations(id)

  setActiveConversationsId('')

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = draft.conversations.filter(c => c.id !== id)
  }))
}

export async function importConversationsAction(conversations: IConversations[]) {
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
  const service = new Service(config.modelConfig)

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

export async function updateConversationsSettingsAction(id: ConversationsId, config: IConversationsSettings) {
  await updateConversationsSettings(id, config)

  const messages = await getMessagesByConvId(id)
  const oldSystemMessage = messages.find(item => item.role === Role.SYSTEM)
  let systemMessageIschanged = false

  // 判断是否修改了系统提示词
  if (oldSystemMessage && oldSystemMessage.content !== config.systemMessage) {
    await updateMessageAction({ ...oldSystemMessage, content: config.systemMessage })
    systemMessageIschanged = true
  }

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.settings = config
    }

    // 同步更新messages中的系统提示词
    if (oldSystemMessage && systemMessageIschanged) {
      const index = draft.messages.findIndex(msg => msg.id === oldSystemMessage.id)
      if (index > -1) {
        draft.messages[index].content = config.systemMessage
      }
    }
  }))
}

/* ============================== messages ============================== */

export async function addMessageAction(message: IMessage) {
  await addMessage(message)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.messages.push(message)
  }))
}

export async function deleteMessageAction(messageId: MessageId) {
  await deleteMessage(messageId)

  useConversationsStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      draft.messages.splice(index, 1)
    }
  }))
}

export async function updateMessageAction(message: IMessage) {
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

export async function sendChatCompletions(conversationId: ConversationsId, config: ModelConfig) {
  const messages = useConversationsStore.getState().messages
  const aiMessage = createMessage({ convId: conversationId, role: Role.AI, status: 'loading' })

  // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
  await addMessageAction({ ...aiMessage })

  try {
    setRequestStatus('loading')
    const Service = getServiceProviderConstructor(config.id)
    const instance = new Service(config)

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

export async function onRequestAction(conversationId: ConversationsId, message: IMessage, config: ModelConfig) {
  await addMessageAction(message)
  await sendChatCompletions(conversationId, config)
}

export async function refreshRequestAction(conversationId: ConversationsId, message: IMessage, config: ModelConfig) {
  await deleteMessageAction(message.id)
  await sendChatCompletions(conversationId, config)
}
