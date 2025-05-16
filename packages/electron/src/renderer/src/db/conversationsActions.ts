import type { IConversations, IConversationsSettings, ModelConfig } from '@ant-chat/shared'
import { getNow } from '@/utils'
import { dbApi } from './dbApi'
import { getSystemMessageByConvId, updateMessage } from './messagesActions'

export async function getConversationsById(id: string) {
  const response = await dbApi.getConversationById(id)
  return response.success ? response.data : null
}

export async function conversationsExists(id: string) {
  return !!(await getConversationsById(id))
}

export async function addConversations(conversation: IConversations) {
  try {
    const response = await dbApi.addConversation(conversation)
    return response.success ? response.data : null
  }
  catch {
    throw new Error(`${conversation.id} already exists`)
  }
}

export async function deleteConversations(id: string) {
  return dbApi.deleteConversation(id)
}

export async function setConversationsSystemPrompt(id: string, systemPrompt: string) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }

  if (!conversation.settings) {
    conversation.settings = {}
  }

  conversation.settings.systemPrompt = systemPrompt
  const systemMessage = (await getSystemMessageByConvId(id))

  if (systemMessage) {
    systemMessage.content = [{ text: systemPrompt, type: 'text' }]
    await updateMessage(systemMessage)
  }

  return dbApi.updateConversation({
    ...conversation,
    updateAt: getNow(),
  })
}

export async function setConversationsModelConfig(id: string, modelConfig: ModelConfig | null) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }

  if (!conversation.settings) {
    conversation.settings = {}
  }

  conversation.settings.modelConfig = modelConfig

  return dbApi.updateConversation({
    ...conversation,
    updateAt: getNow(),
  })
}

export async function updateConversationsSettings(id: string, config: IConversationsSettings) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }
  conversation.settings = config

  return dbApi.updateConversation({
    ...conversation,
    updateAt: getNow(),
  })
}

export async function renameConversations(id: string, newName: string) {
  const response = await dbApi.getConversationById(id)
  if (!response.success || !response.data) {
    throw new Error(`conversation not found. id => ${id}`)
  }

  const conversation = response.data
  conversation.title = newName
  conversation.updateAt = getNow()

  return dbApi.updateConversation(conversation)
}

export async function fetchConversations(pageIndex: number, pageSize: number = 10) {
  const resp = await dbApi.getConversations(pageIndex, pageSize)

  if (!resp.success) {
    return { conversations: [], total: 0 }
  }

  const allConversations = resp.data.sort((a: IConversations, b: IConversations) => b.updateAt - a.updateAt)
  const conversations = allConversations.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

  return {
    conversations,
    total: resp.total,
  }
}

export async function updateConversationsUpdateAt(id: string, updateAt: number) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }

  conversation.updateAt = updateAt || getNow()

  return dbApi.updateConversation(conversation)
}
