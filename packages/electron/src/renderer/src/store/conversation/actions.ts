import type { AddConversationsSchema, AllAvailableModelsSchema, ConversationsId, ModelConfig, TextContent } from '@ant-chat/shared'
import type { AntChatFileStructure } from '@/constants'
import { produce } from 'immer'
import { isEqual } from 'lodash-es'
import { dbApi } from '@/api/dbApi'
import { Role, TITLE_PROMPT } from '@/constants'
import { getServiceProviderConstructor } from '@/services-provider'
import { useGeneralSettingsStore } from '../generalSettings'
import { setActiveConversationsId, useMessagesStore } from '../messages'
import { useConversationsStore } from './conversationsStore'

export async function addConversationsAction(conversation: AddConversationsSchema) {
  const data = await dbApi.addConversation(conversation)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.splice(0, 0, data)
  }))

  return data
}

export async function renameConversationsAction(id: ConversationsId, title: string) {
  // await renameConversations(id, title)

  const data = await dbApi.updateConversation({ id, title })

  useConversationsStore.setState(state => produce(state, (draft) => {
    const index = draft.conversations.findIndex(c => c.id === id)
    if (index > -1) {
      draft.conversations[index] = data
    }
  }))
}

export async function deleteConversationsAction(id: ConversationsId) {
  await dbApi.deleteConversation(id)

  setActiveConversationsId('')

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = draft.conversations.filter(c => c.id !== id)
  }))
}

export async function importConversationsAction(_: AntChatFileStructure) {
  throw new Error('待实现')
}

export async function clearConversationsAction() {
  // TODO 清理数据库中的所有会话数据
  await setActiveConversationsId('')

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations = []
  }))
}

export async function nextPageConversationsAction() {
  const { pageIndex, pageSize } = useConversationsStore.getState()
  const { data: conversations, total } = await dbApi.getConversations(pageIndex, pageSize)

  useConversationsStore.setState(state => produce(state, (draft) => {
    draft.conversations.push(...conversations)

    draft.conversationsTotal = total

    if (draft.conversations.length < total) {
      draft.pageIndex = pageIndex + 1
    }
  }))
}

export async function initConversationsTitle(model: AllAvailableModelsSchema['models'][number]) {
  const { messages } = useMessagesStore.getState()
  const { assistantModelId } = useGeneralSettingsStore.getState()
  const modelInfo = assistantModelId ? await dbApi.getModelById(assistantModelId) : model
  const serviceProviderInfo = await dbApi.getServiceProviderById(modelInfo.serviceProviderId)

  const userMessage = messages.find(item => item.role === Role.USER)

  if (!userMessage) {
    console.error('current conversation not found user message')
    return
  }

  const text = messages.map(
    item => item.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n'),
  ).join('\n————————————————————\n')

  const content = TITLE_PROMPT.replace('pGqat5J/L@~U', text)
  const Service = getServiceProviderConstructor(serviceProviderInfo.id)
  const service = new Service({
    apiHost: serviceProviderInfo.baseUrl,
    apiKey: serviceProviderInfo.apiKey,
    model: modelInfo.model,
  })

  const stream = await service.sendChatCompletions(
    [
      { ...userMessage, content: [{ type: 'text', text: content }], images: [], attachments: [] },
    ],
  )

  const reader = stream.getReader()
  service.parseSse(reader, {
    onSuccess: (result) => {
      let title = ''
      if (typeof result.message === 'string') {
        title = result.message
      }
      else {
        title = result.message.filter(item => item.type === 'text').reduce((a, b) => (a + (b as TextContent).text), '')
      }

      if (title) {
        renameConversationsAction(messages[0].convId, title)
        return
      }
      console.error('标题初始化失败. 响应数据:', JSON.stringify(result))
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
  const conversations = await dbApi.getConversationById(id)

  if (title && conversations.title !== title) {
    await renameConversationsAction(id, title)
  }

  if (systemPrompt && conversations.settings?.systemPrompt !== systemPrompt) {
    await dbApi.updateConversation({ id, settings: { systemPrompt } })
  }

  if (modelConfig === null) {
    await dbApi.updateConversation({ id, settings: null })
  }

  else if (modelConfig !== undefined && !(isEqual(conversations.settings?.modelConfig, modelConfig))) {
    await dbApi.updateConversation({ id, settings: { modelConfig } })
  }

  useConversationsStore.setState(state => produce(state, (draft) => {
    const conversation = draft.conversations.find(c => c.id === id)
    if (conversation) {
      conversation.settings = config
    }
  }))
}
