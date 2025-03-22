import type { ConversationsId, IMessage, MessageId } from '../interface'
import { Role } from '@/constants'
import { createConversations, createMessage } from '@/store/conversation'
import { beforeEach, describe, expect, it } from 'vitest'
import { addConversations } from '../conversationsActions'
import db from '../db'
import { addMessage, deleteMessage, getMessagesByConvIdWithPagination, messageIsExists } from '../messagesActions'

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

  describe('getMessagesByConvIdWithPagination', () => {
    it('测试翻页', async () => {
      const conversations = createConversations()
      await addConversations(conversations)

      const length = 10
      const messages: IMessage[] = []

      for (let i = 0; i < length; i++) {
        const message = createMessage({ id: `${i}` as MessageId, convId: conversations.id, content: `message-${i}` })
        await addMessage(message)
        messages.push(message)
      }

      const result1 = await getMessagesByConvIdWithPagination(conversations.id, 0, 5)
      expect(result1.total).toEqual(10)
      expect(result1.messages.map(item => item.id)).toEqual(['5', '6', '7', '8', '9'])

      const result2 = await getMessagesByConvIdWithPagination(conversations.id, 1, 5)
      expect(result2.messages.map(item => item.id)).toEqual(['0', '1', '2', '3', '4'])
    })
  })
})
