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
  return db.messages.add(message)
}

export async function updateMessage(message: IMessage) {
  return db.messages.put(message)
}

export async function deleteMessage(id: MessageId) {
  return db.messages.delete(id)
}

export async function getMessagesByConvId(id: ConversationsId) {
  return db.messages.orderBy('createAt').filter(x => x.convId === id).toArray()
}

export async function BatchDeleteMessage(ids: MessageId[]) {
  return db.messages.bulkDelete(ids)
}

export async function exportMessages() {
  return db.messages.toArray()
}

export async function importMessages(messages: IMessage[]) {
  const messagesList = messages.filter(async item => await messageIsExists(item.id))
  return db.messages.bulkAdd(messagesList)
}
