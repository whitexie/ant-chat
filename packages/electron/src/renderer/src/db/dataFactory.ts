import type { RequireKey } from '@/types/global'
import type { ConversationsId, IConversations, IMessageAI, IMessageSystem, IMessageUser, MessageId } from '@ant-chat/shared'
import { DEFAULT_TITLE, Role } from '@/constants'
import { getNow, uuid } from '@/utils'

// ============================ Conversations ============================
export function createConversations(option?: Partial<IConversations>): IConversations {
  const time = getNow()

  return Object.assign({
    id: uuid('conv-'),
    title: DEFAULT_TITLE,
    createAt: time,
    updateAt: time,
  }, option)
}

// ============================ Message ============================

function createMessageBase<T extends Role = Role.USER>(role: T) {
  return {
    id: uuid() as MessageId,
    convId: '' as ConversationsId,
    role,
    content: '',
    createAt: getNow(),
  }
}

export function createUserMessage(option: RequireKey<Partial<IMessageUser>, 'convId'>): IMessageUser {
  return Object.assign(
    createMessageBase(Role.USER),
    {
      status: 'success',
      attachments: [],
      images: [],
    },
    option,
  )
}

export function createSystemMessage(option: RequireKey<Partial<IMessageSystem>, 'convId'>): IMessageSystem {
  return Object.assign(
    createMessageBase(Role.SYSTEM),
    {
      status: 'success',
    },
    option,
  )
}

export function createAIMessage(option: RequireKey<Partial<IMessageAI>, 'convId'>): IMessageAI {
  return Object.assign(
    createMessageBase(Role.AI),
    {
      status: 'success',
    },
    option,
  )
}
