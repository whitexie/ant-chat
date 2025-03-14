import type { ConversationsId, IConversations, IConversationsSettings, ModelConfig } from './interface'
import { Role } from '@/constants'
import db from './db'
import { getMessagesByConvId, updateMessage } from './messagesActions'

export async function getConversationsById(id: ConversationsId) {
  return await db.conversations.get(id)
}

export async function conversationsExists(id: ConversationsId) {
  return !!(await getConversationsById(id))
}

export async function addConversations(conversation: IConversations) {
  try {
    return await db.conversations.add(conversation)
  }
  catch {
    throw new Error(`${conversation.id} already exists`)
  }
}

export async function deleteConversations(id: ConversationsId) {
  return db.transaction('readwrite', db.conversations, db.messages, async () => {
    await Promise.all([
      db.conversations.delete(id),
      db.messages.filter(item => item.convId === id).delete(),
    ])
  })
}

export async function setConversationsSystemPrompt(id: ConversationsId, systemPrompt: string) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }

  if (!conversation.settings) {
    conversation.settings = {}
  }

  conversation.settings.systemPrompt = systemPrompt
  const systemMessage = (await getMessagesByConvId(id)).find(item => item.role === Role.SYSTEM)

  if (systemMessage) {
    systemMessage.content = systemPrompt
    await updateMessage(systemMessage)
  }

  return await db.conversations.put(conversation)
}

export async function setConversationsModelConfig(id: ConversationsId, modelConfig: ModelConfig | null) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }

  if (!conversation.settings) {
    conversation.settings = {}
  }

  conversation.settings.modelConfig = modelConfig

  return await db.conversations.put(conversation)
}

export async function updateConversationsSettings(id: ConversationsId, config: IConversationsSettings) {
  const conversation = await getConversationsById(id)
  if (!conversation) {
    throw new Error(`conversations not exists: ${id}`)
  }
  conversation.settings = config

  return await db.conversations.put(conversation)
}

export async function renameConversations(id: string, newName: string) {
  const conversation = await db.conversations.where({ id }).first()

  if (!conversation) {
    throw new Error(`conversation not found. id => ${id}`)
  }

  conversation.title = newName

  return await db.conversations.put(conversation)
}

export async function fetchConversations(pageIndex: number, pageSize: number = 10) {
  return await db.conversations
    .orderBy('createAt')
    .reverse()
    .offset((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .toArray()
}
