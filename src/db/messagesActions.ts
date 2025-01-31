import db from './db'

export async function messageIsExists(id: string) {
  return !!await db.messages.get(id)
}

export async function addMessage(message: ChatMessage) {
  if (!await db.conversations.get(message.convId)) {
    throw new Error('conversation not found')
  }
  return await db.messages.add(message)
}

export async function updateMessage(message: ChatMessage) {
  return await db.messages.put(message)
}

export async function deleteMessage(id: string) {
  return await db.messages.delete(id)
}

export async function getMessagesByConvId(id: string) {
  return await db.messages.orderBy('createAt').filter(x => x.convId === id).toArray()
}

export async function BatchDeleteMessage(ids: string[]) {
  return await db.messages.bulkDelete(ids)
}
