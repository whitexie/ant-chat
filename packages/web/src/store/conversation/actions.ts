import type { AntChatFileStructure } from '@/constants'
import type { ConversationsId, IConversations, IMessage, MessageId, ModelConfig } from '@/db/interface'
import type { ChatFeatures } from '@/services-provider/interface'
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
  getConversationsById,
  getMessagesByConvId,
  importMessages,
  messageIsExists,
  renameConversations,
  setConversationsModelConfig,
  setConversationsSystemPrompt,
  updateMessage,
} from '@/db'
import { getServiceProviderConstructor } from '@/services-provider'
import { produce } from 'immer'
import { isEqual } from 'lodash-es'
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

export async function importConversationsAction(data: AntChatFileStructure) {
  const { conversations, messages } = data
  const conversationsList = await Promise.all(conversations.filter(async (item) => {
    return await conversationsExists(item.id)
  }))

  const messagesList = await Promise.all(messages.filter(async (item) => {
    return await messageIsExists(item.id)
  }))

  await Promise.all(conversationsList.map(async item => await addConversations(item)))

  await importMessages(messagesList)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.splice(0, 0, ...conversationsList)

    draft.conversations.sort((a, b) => b.createAt - a.createAt)
  }))
}

export async function clearConversationsAction() {
  await Promise.all([
    db.conversations.clear(),
    db.messages.clear(),
  ])

  await setActiveConversationsId('')

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = []
  }))
}

export async function initConversationsListAction() {
  useConversationsStore.getState().reset()
  const conversations = await fetchConversations(1, 100)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = conversations
  }))
}

export async function initConversationsTitle() {
  const { messages } = useConversationsStore.getState()
  const { active } = useModelConfigStore.getState()
  const config = getActiveModelConfig()

  const userMessage = messages.find(item => item.role === Role.USER)

  if (!userMessage) {
    console.error('current conversation not found user message')
    return
  }

  const text = messages.map(item => item.content).join('\n————————————————————\n')

  const content = TITLE_PROMPT.replace('pGqat5J/L@~U', text)
  const Service = getServiceProviderConstructor(active)
  const service = new Service(config.modelConfig)

  const stream = await service.sendChatCompletions(
    [
      { ...userMessage, content, images: [], attachments: [] },
    ],
  )

  const reader = stream.getReader()
  service.parseSse(reader, {
    onSuccess: (result) => {
      const title = result.message
      renameConversationsAction(messages[0].convId, title)
    },
  })
}

export interface UpdateConversationsSettingsConfig {
  title?: string
  systemPrompt?: string
  modelConfig?: ModelConfig | null
}

export async function updateConversationsSettingsAction(id: ConversationsId, config: UpdateConversationsSettingsConfig) {
  const { title, systemPrompt, modelConfig } = config
  const conversations = await getConversationsById(id)
  let systemPromptChanged = false
  if (!conversations) {
    console.error('conversations not found')
    return
  }

  if (title && conversations.title !== title) {
    await renameConversationsAction(id, title)
  }

  if (systemPrompt && conversations.settings?.systemPrompt !== systemPrompt) {
    systemPromptChanged = true
    await setConversationsSystemPrompt(id, systemPrompt)
  }

  if (modelConfig === null) {
    await setConversationsModelConfig(id, null)
  }

  else if (modelConfig !== undefined && !(isEqual(conversations.settings?.modelConfig, modelConfig))) {
    await setConversationsModelConfig(id, modelConfig)
  }

  // 更新conversationsStore.messages的系统提示词
  const messages = await getMessagesByConvId(id)
  const messageIndex = messages.findIndex(item => item.role === Role.SYSTEM)

  if (messageIndex === -1) {
    throw new Error('当前对话没有系统提示词。')
  }

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.settings = config
    }

    // 同步更新messages中的系统提示词
    if (systemPrompt && systemPromptChanged) {
      draft.messages[messageIndex].content = systemPrompt
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

export async function sendChatCompletions(conversationId: ConversationsId, config: ModelConfig, features: ChatFeatures) {
  const messages = useConversationsStore.getState().messages
  const aiMessage = createMessage({ convId: conversationId, role: Role.AI, status: 'loading' })

  // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
  await addMessageAction({ ...aiMessage })

  try {
    setRequestStatus('loading')
    const Service = getServiceProviderConstructor(config.id)
    const instance = new Service(config)

    const stream = await instance.sendChatCompletions(messages, { features })

    if (!stream) {
      throw new Error('stream is null')
    }

    const reader = stream.getReader()

    addAbortCallback(() => {
      reader.cancel()
    })

    await instance.parseSse(reader, {
      onUpdate: (result) => {
        aiMessage.content = result.message
        aiMessage.reasoningContent = result.reasoningContent
        updateMessageAction({ ...aiMessage, status: 'typing' })
      },
      onSuccess: () => {
        setRequestStatus('success')
        updateMessageAction({ ...aiMessage, status: 'success' })
        resetAbortCallbacks()
      },
    })
  }
  catch (e) {
    const error = e as Error
    aiMessage.content = error.message
    aiMessage.status = 'error'
    updateMessageAction(aiMessage)
    setRequestStatus('error')
  }
}

export async function onRequestAction(conversationId: ConversationsId, config: ModelConfig, features: ChatFeatures) {
  await sendChatCompletions(conversationId, config, features)
}

export async function refreshRequestAction(conversationId: ConversationsId, message: IMessage, config: ModelConfig, features: ChatFeatures) {
  await deleteMessageAction(message.id)
  await sendChatCompletions(conversationId, config, features)
}
