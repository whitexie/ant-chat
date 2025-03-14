import type { ConversationsId } from '../interface'
import { Role } from '@/constants'
import { createConversations, createMessage } from '@/store/conversation'
import { beforeEach, describe, expect, it } from 'vitest'
import { addConversations } from '../conversationsActions'
import db from '../db'
import { addMessage, deleteMessage, messageIsExists } from '../messagesActions'

describe('消息操作', () => {
  beforeEach(() => {
    db.messages.clear()
  })

  it('添加消息', async () => {
    const conversation = createConversations()
    await addConversations(conversation)
    const message = createMessage({ convId: conversation.id, content: 'asdfsd', role: Role.USER })

    await addMessage(message)

    await expect(db.messages.toArray()).resolves.toEqual([message])
  })

  it('添加消息到不存在的会话', async () => {
    const message = createMessage({ convId: '' as ConversationsId })

    await expect(addMessage(message)).rejects.toThrowError('conversation not found')
  })

  it('删除消息', async () => {
    const conversation = createConversations()
    await addConversations(conversation)
    const message = createMessage({ convId: conversation.id })
    await addMessage(message)

    expect(messageIsExists(message.id)).toBeTruthy()

    await deleteMessage(message.id)

    expect(await messageIsExists(message.id)).toBeFalsy()
  })
})
