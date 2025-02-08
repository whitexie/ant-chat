import db from './db'

export async function getConversationsById(id: string) {
  return await db.conversations.get(id)
}

export async function conversationsExists(id: string) {
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

export async function deleteConversations(id: string) {
  return db.transaction('readwrite', db.conversations, db.messages, async () => {
    await Promise.all([
      db.conversations.delete(id),
      db.messages.filter(item => item.convId === id).delete(),
    ])
  })
}

export async function updateConversationsSettings(id: string, config: IConversationsSettings) {
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
