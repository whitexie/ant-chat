import type { AntChatFileStructure } from '@/constants'
import type { ConversationsId, IConversations, ModelConfig } from '@/db/interface'
import { Role, TITLE_PROMPT } from '@/constants'
import {
  addConversations,
  addMessage,
  conversationsExists,
  db,
  deleteConversations,
  fetchConversations,
  getConversationsById,
  getMessagesByConvId,
  importMessages,
  messageIsExists,
  renameConversations,
  setConversationsModelConfig,
  setConversationsSystemPrompt,
} from '@/db'
import { getServiceProviderConstructor } from '@/services-provider'
import { produce } from 'immer'
import { isEqual } from 'lodash-es'
import { setActiveConversationsId, updateMessageAction, useMessagesStore } from '../messages'
import { getActiveModelConfig, useModelConfigStore } from '../modelConfig'
import { createMessage, useConversationsStore } from './conversationsStore'

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

export async function nextPageConversationsAction() {
  const { pageIndex, pageSize } = useConversationsStore.getState()
  const { conversations, total } = await fetchConversations(pageIndex, pageSize)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.push(...conversations)

    draft.conversationsTotal = total

    if (draft.conversations.length < total) {
      draft.pageIndex = pageIndex + 1
    }
  }))
}

export async function initConversationsTitle() {
  const { messages } = useMessagesStore.getState()
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
  const message = messages.find(item => item.role === Role.SYSTEM)

  if (!message) {
    throw new Error('当前对话没有系统提示词。')
  }

  // 同步更新messages中的系统提示词
  if (systemPrompt && systemPromptChanged) {
    message.content = systemPrompt
    await updateMessageAction(message)
  }

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.settings = config
    }
  }))
}
