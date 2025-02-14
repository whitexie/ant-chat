import type { IConversations, IMessage } from './interface'
import Dexie, { type EntityTable } from 'dexie'

const db = new Dexie('antChat') as Dexie & {
  conversations: EntityTable<IConversations, 'id'>
  messages: EntityTable<IMessage, 'id'>
}

db.version(1).stores({
  conversations: '&id, title, createAt',
  messages: '&id, convId, content, createAt',
})

export default db
