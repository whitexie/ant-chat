import type { ConversationsId, IMessage, IMessageSystem, MessageId } from './interface'
import { Role } from '@/constants'
import { uuid } from '@/utils'
import { updateConversationsUpdateAt } from './conversationsActions'
import { dbApi } from './dbApi'

export function generateMessageId() {
  return `msg_${uuid()}` as MessageId
}

export function generateConversationId() {
  return `conv_${uuid()}` as ConversationsId
}

export async function messageIsExists(id: MessageId) {
  const response = await dbApi.getMessageById(id)
  return response.success && response.data
}

export async function getMessageById(id: MessageId) {
  const response = await dbApi.getMessageById(id)
  if (!response.success || !response.data) {
    throw new Error('not found message')
  }
  return response.data
}

export async function addMessage(message: IMessage) {
  const convResponse = await dbApi.getConversationById(message.convId)
  if (!convResponse.success || !convResponse.data) {
    throw new Error('conversation not found')
  }

  const response = await dbApi.addMessage(message)
  return response.success ? response.data : null
}

export async function updateMessage(message: IMessage) {
  await updateConversationsUpdateAt(message.convId, Date.now())
  const response = await dbApi.updateMessage(message)
  return response.success ? response.data : null
}

export async function deleteMessage(id: MessageId) {
  return dbApi.deleteMessage(id)
}

export async function getMessagesByConvId(id: ConversationsId) {
  const response = await dbApi.getMessagesByConvId(id)
  return response.success ? response.data : []
}

export async function getMessagesByConvIdWithPagination(id: ConversationsId, pageIndex: number, pageSize: number) {
  const response = await dbApi.getMessagesByConvIdWithPagination(id, pageIndex, pageSize)

  if (!response.success || !response.data) {
    return { messages: [], total: 0 }
  }

  return response.data
}

export async function getSystemMessageByConvId(id: ConversationsId): Promise<IMessageSystem | null> {
  const response = await dbApi.getMessagesByConvId(id)

  if (!response.success || !response.data) {
    return null
  }

  const messages = response.data.filter((x: IMessage) => x.role === Role.SYSTEM)
  return messages.length ? messages[0] as IMessageSystem : null
}

export async function BatchDeleteMessage(ids: MessageId[]) {
  return dbApi.batchDeleteMessages(ids)
}

export async function exportMessages() {
  const allConversations = await dbApi.getConversations()
  if (!allConversations.success || !allConversations.data) {
    return []
  }

  const allMessages: IMessage[] = []
  for (const conv of allConversations.data) {
    const messagesResponse = await dbApi.getMessagesByConvId(conv.id)
    if (messagesResponse.success && messagesResponse.data) {
      allMessages.push(...messagesResponse.data)
    }
  }

  return allMessages
}

export async function importMessages(messages: IMessage[]) {
  const validMessages = []

  for (const message of messages) {
    const exists = await messageIsExists(message.id)
    if (!exists) {
      validMessages.push(message)
    }
  }

  for (const message of validMessages) {
    await dbApi.addMessage(message)
  }

  return validMessages.length
}
