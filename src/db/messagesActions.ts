import type { ConversationsId, IMessage, MessageId } from './interface'
import { uuid } from '@/utils'
import db from './db'

export function generateMessageId() {
  return `msg_${uuid()}` as MessageId
}

export function generateConversationId() {
  return `conv_${uuid()}` as ConversationsId
}

export async function messageIsExists(id: MessageId) {
  return !!await db.messages.get(id)
}

export async function addMessage(message: IMessage) {
  if (!await db.conversations.get(message.convId)) {
    throw new Error('conversation not found')
  }
  return await db.messages.add(message)
}

export async function updateMessage(message: IMessage) {
  return await db.messages.put(message)
}

export async function deleteMessage(id: MessageId) {
  return await db.messages.delete(id)
}

export async function getMessagesByConvId(id: ConversationsId) {
  return await db.messages.orderBy('createAt').filter(x => x.convId === id).toArray()
}

export async function BatchDeleteMessage(ids: MessageId[]) {
  return await db.messages.bulkDelete(ids)
}
