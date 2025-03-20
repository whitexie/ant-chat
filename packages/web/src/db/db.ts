import type { EntityTable } from 'dexie'
import type { IAttachment, IConversations, IMessage } from './interface'
import type { IMessage as IMessageV1 } from './interface.v1'
import Dexie from 'dexie'

export function createDb() {
  return new Dexie('antChat') as Dexie & {
    conversations: EntityTable<IConversations, 'id'>
    messages: EntityTable<IMessage, 'id'>
    customModels: EntityTable<{ id: string, ownedBy: string, createAt: number }, 'id'>
  }
}

export function upgradeToV1(db: Dexie) {
  db.version(1).stores({
    conversations: '&id, title, createAt',
    messages: '&id, convId, content, createAt',
  })
}

export function upgradeToV2(db: Dexie) {
  db.version(2).stores({
    conversations: '&id, title, createAt',
    messages: '&id, convId, content, createAt',
  }).upgrade((trans) => {
    return trans.table('messages').toCollection().modify((msg: IMessageV1 & { images: IAttachment[], attachments: IAttachment[] }) => {
      const { content } = msg
      let text = ''
      const images: IAttachment[] = []

      if (typeof content === 'string') {
        text = content
      }
      else if (Array.isArray(content)) {
        content.forEach((item) => {
          if (item.type === 'text') {
            text += item.text
          }
          else if (item.type === 'image_url') {
            const { uid, name, size, type, url } = item.image_url
            images.push({ uid, name, size, type, data: url })
          }
        })
      }

      msg.content = text

      msg.images = images
      msg.attachments = []
    })
  })
}

export function upgradeToV3(db: Dexie) {
  db.version(3).stores({
    conversations: '&id, title, createAt',
    messages: '&id, convId, content, createAt',
    customModels: '&id, ownedBy, createAt',
  })
}

export function upgradeToV4(db: Dexie) {
  db.version(4).stores({
    conversations: '&id, title, createAt, updateAt',
    messages: '&id, convId, content, createAt',
    customModels: '&id, ownedBy, createAt',
  }).upgrade((trans) => {
    return trans.table('conversations').toCollection().modify((conv) => {
      conv.updateAt = conv.createAt
    })
  })
}

const db = createDb()

upgradeToV1(db)
upgradeToV2(db)
upgradeToV3(db)
upgradeToV4(db)

export default db
