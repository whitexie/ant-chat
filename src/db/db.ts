import Dexie, { type EntityTable } from 'dexie'

const db = new Dexie('antChat') as Dexie & {
  conversations: EntityTable<IConversation, 'id'>
  messages: EntityTable<ChatMessage, 'id'>
}

db.version(1).stores({
  conversations: '&id, title, createAt',
  messages: '&id, convId, content, createAt',
})

export default db
