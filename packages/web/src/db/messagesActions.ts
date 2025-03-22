import type { ConversationsId, IMessage, MessageId } from './interface'
import { Role } from '@/constants'
import { uuid } from '@/utils'
import { updateConversationsUpdateAt } from './conversationsActions'
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
  return await db.transaction('readwrite', db.conversations, db.messages, async () => {
    await Promise.all([
      updateConversationsUpdateAt(message.convId, Date.now()),
      db.messages.put(message),
    ])
  })
}

export async function deleteMessage(id: MessageId) {
  return db.messages.delete(id)
}

export async function getMessagesByConvId(id: ConversationsId) {
  return db.messages
    .orderBy('createAt')
    .filter(x => x.convId === id)
    .toArray()
}

export async function getMessagesByConvIdWithPagination(id: ConversationsId, pageIndex: number, pageSize: number) {
  const result = db.messages
    .orderBy('createAt')
    .filter(x => x.convId === id)

  const total = await result.count()
  const messages = (await result.offset(pageIndex * pageSize).limit(pageSize).reverse().toArray()).reverse()
  return { messages, total }
}

export async function getSystemMessageByConvId(id: ConversationsId): Promise<IMessage | null> {
  const messages = await db.messages
    .orderBy('createAt')
    .filter(x => x.convId === id && x.role === Role.SYSTEM)
    .toArray()
  return messages.length ? messages[0] : null
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
