import type { ConversationsId } from '../interface'

import { createConversation } from '@/store/conversation'
import { beforeEach, describe, expect, it } from 'vitest'
import { addConversations, deleteConversations, fetchConversations, getConversationsById, renameConversations } from '../conversationsActions'
import db from '../db'

describe('conversationActions', () => {
  beforeEach(() => {
    db.conversations.clear()
  })
  it('add conversation', async () => {
    const conversation = createConversation({ title: 'test add' })
    const result = await addConversations(conversation)

    expect(result).toBe(conversation.id)
    expect(await db.conversations.toArray()).toEqual([conversation])
  })

  it('repeat the addition', async () => {
    const conversation = createConversation({ title: 'test add' })
    await addConversations(conversation)

    await expect(() => addConversations(conversation)).rejects.toThrow(`${conversation.id} already exists`)
  })

  it('rename conversation', async () => {
    const conversation = createConversation({ title: 'old name' })
    await addConversations(conversation)

    await renameConversations(conversation.id, 'new name')
    const result = await getConversationsById(conversation.id)

    expect(result?.title).toBe('new name')
  })

  it('delete conversatio', async () => {
    const conversation = createConversation()
    await addConversations(conversation)

    await deleteConversations(conversation.id)

    expect(await getConversationsById(conversation.id)).toBeUndefined()
  })

  it('测试分页', async () => {
    const conversations = Array.from({ length: 20 }).map((_, index) => createConversation({ id: `${index}` as ConversationsId, createAt: index }))

    await Promise.all(conversations.map(addConversations))

    conversations.sort((a, b) => b.createAt - a.createAt)

    const result = (await fetchConversations(1, 10)).map(item => item.id)
    expect(result).toEqual(conversations.map(item => item.id).slice(0, 10))

    const result2 = (await fetchConversations(2, 10)).map(item => item.id)
    expect(result2).toEqual(conversations.map(item => item.id).slice(10, 20))
  })
})
