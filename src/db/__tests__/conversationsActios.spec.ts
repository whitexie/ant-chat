import { createConversation } from '@/store/conversation'

import { beforeEach, describe, expect, it } from 'vitest'
import { addConversation, deleteConversation, getConversation, renameConversation } from '../conversationsActions'
import db from '../db'

describe('conversationActions', () => {
  beforeEach(() => {
    db.conversations.clear()
  })
  it('add conversation', async () => {
    const conversation = createConversation({ title: 'test add' })
    const result = await addConversation(conversation)

    expect(result).toBe(conversation.id)
    expect(await db.conversations.toArray()).toEqual([conversation])
  })

  it('repeat the addition', async () => {
    const conversation = createConversation({ title: 'test add' })
    await addConversation(conversation)

    await expect(() => addConversation(conversation)).rejects.toThrow(`${conversation.id} already exists`)
  })

  it('rename conversation', async () => {
    const conversation = createConversation({ title: 'old name' })
    await addConversation(conversation)

    await renameConversation(conversation.id, 'new name')
    const result = await getConversation(conversation.id)

    expect(result?.title).toBe('new name')
  })

  it('delete conversatio', async () => {
    const conversation = createConversation()
    await addConversation(conversation)

    await deleteConversation(conversation.id)

    expect(await getConversation(conversation.id)).toBeUndefined()
  })
})
