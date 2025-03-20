import type { ConversationsId } from '../interface'

import { createConversations } from '@/store/conversation'
import { beforeEach, describe, expect, it } from 'vitest'
import { addConversations, deleteConversations, fetchConversations, getConversationsById, renameConversations } from '../conversationsActions'
import db from '../db'

describe('conversationActions', () => {
  beforeEach(() => {
    db.conversations.clear()
  })
  it('add conversation', async () => {
    const conversation = createConversations({ title: 'test add' })
    const result = await addConversations(conversation)

    expect(result).toBe(conversation.id)
    expect(await db.conversations.toArray()).toEqual([conversation])
  })

  it('repeat the addition', async () => {
    const conversation = createConversations({ title: 'test add' })
    await addConversations(conversation)

    await expect(() => addConversations(conversation)).rejects.toThrow(`${conversation.id} already exists`)
  })

  it('rename conversation', async () => {
    const conversation = createConversations({ title: 'old name' })
    await addConversations(conversation)

    await renameConversations(conversation.id, 'new name')
    const result = await getConversationsById(conversation.id)

    expect(result?.title).toBe('new name')
  })

  it('delete conversatio', async () => {
    const conversation = createConversations()
    await addConversations(conversation)

    await deleteConversations(conversation.id)

    expect(await getConversationsById(conversation.id)).toBeUndefined()
  })

  it('测试分页', async () => {
    const conversations = Array.from({ length: 10 }).map((_, index) => createConversations({ id: `${index}` as ConversationsId, updateAt: index }))

    await Promise.all(conversations.map(addConversations))

    conversations.sort((a, b) => a.updateAt - b.updateAt)

    const result = (await fetchConversations(0, 5)).conversations.map(item => item.id)
    expect(result).toEqual(['9', '8', '7', '6', '5'])

    const result2 = (await fetchConversations(1, 5)).conversations.map(item => item.id)
    expect(result2).toEqual(['4', '3', '2', '1', '0'])
  })
})
