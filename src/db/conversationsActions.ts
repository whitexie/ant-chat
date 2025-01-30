import db from './db'

export async function getConversation(id: string) {
  return await db.conversations.get(id)
}

export async function addConversation(conversation: IConversation) {
  try {
    return await db.conversations.add(conversation)
  }
  catch {
    throw new Error(`${conversation.id} already exists`)
  }
}

export async function deleteConversation(id: string) {
  return db.transaction('readwrite', db.conversations, db.messages, async () => {
    await Promise.all([
      db.conversations.delete(id),
      db.messages.filter(item => item.convId === id).delete(),
    ])
  })
}

export async function renameConversation(id: string, newName: string) {
  const conversation = await db.conversations.where({ id }).first()

  if (!conversation) {
    throw new Error(`conversation not found. id => ${id}`)
  }

  conversation.title = newName

  return await db.conversations.put(conversation)
}
